import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shift_id } = await req.json();

    if (!shift_id) {
      return Response.json({ error: 'Missing shift_id' }, { status: 400 });
    }

    // Get shift details
    const shifts = await base44.entities.Shift.filter({ id: shift_id });
    if (shifts.length === 0) {
      return Response.json({ error: 'Shift not found' }, { status: 404 });
    }
    const shift = shifts[0];

    if (shift.status !== 'completed') {
      return Response.json({ error: 'Shift must be completed before payment' }, { status: 400 });
    }
    if (!shift.assigned_to) {
      return Response.json({ error: 'Shift has no assigned worker' }, { status: 400 });
    }

    // Check if payment already exists and completed
    const existingPayments = await base44.entities.Payment.filter({ shift_id });
    if (existingPayments.length > 0 && existingPayments[0].status === 'completed') {
      return Response.json({ error: 'Payment already completed for this shift' }, { status: 400 });
    }

    // Get worker's IBAN details
    const workers = await base44.entities.User.filter({ email: shift.assigned_to });
    const worker = workers[0];
    if (!worker?.iban) {
      console.error('Worker has no IBAN on file:', shift.assigned_to);
      return Response.json({ error: 'Worker has not set up payment details (IBAN) yet' }, { status: 400 });
    }

    // Calculate payment — 10% platform fee on both sides
    const startTime = new Date(`${shift.date}T${shift.start_time}`);
    const endTime = new Date(`${shift.date}T${shift.end_time}`);
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    const grossAmount = hoursWorked * shift.hourly_rate;
    const platformFeeEmployer = grossAmount * 0.10;
    const platformFeeWorker = grossAmount * 0.10;
    const workerPayout = grossAmount - platformFeeWorker;
    const employerTotal = grossAmount + platformFeeEmployer;

    // Create or update payment record
    let payment;
    if (existingPayments.length > 0) {
      payment = existingPayments[0];
      await base44.entities.Payment.update(payment.id, {
        status: 'pending',
        hours_worked: hoursWorked,
        gross_amount: grossAmount,
        platform_fee_employer: platformFeeEmployer,
        platform_fee_worker: platformFeeWorker,
        worker_payout: workerPayout,
        employer_total: employerTotal,
        worker_iban: worker.iban,
        worker_bank_name: worker.bank_name || ''
      });
    } else {
      payment = await base44.entities.Payment.create({
        shift_id,
        worker_email: shift.assigned_to,
        worker_name: shift.assigned_to_name,
        employer_email: user.email,
        venue_name: shift.venue_name,
        shift_date: shift.date,
        hours_worked: hoursWorked,
        hourly_rate: shift.hourly_rate,
        gross_amount: grossAmount,
        platform_fee_employer: platformFeeEmployer,
        platform_fee_worker: platformFeeWorker,
        worker_payout: workerPayout,
        employer_total: employerTotal,
        worker_iban: worker.iban,
        worker_bank_name: worker.bank_name || '',
        status: 'pending'
      });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';
    const idempotencyKey = `shift-payment-${payment.id}-v2`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Shift Payment: ${shift.role_type} at ${shift.venue_name}`,
              description: `${new Date(shift.date).toLocaleDateString('en-IE')} · ${hoursWorked}h @ €${shift.hourly_rate}/h · 10% fee each side`,
            },
            unit_amount: Math.round(employerTotal * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/employerdashboard?payment=success&shift=${shift_id}`,
      cancel_url: `${origin}/employerdashboard?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id: payment.id,
        shift_id,
        worker_email: shift.assigned_to,
        worker_iban: worker.iban,
        worker_name: shift.assigned_to_name || shift.assigned_to
      },
    }, { idempotencyKey });

    await base44.entities.Payment.update(payment.id, {
      stripe_payment_intent_id: session.id,
      status: 'processing'
    });

    console.log('Checkout session created:', session.id, 'for shift:', shift_id, 'worker:', shift.assigned_to);

    return Response.json({ sessionUrl: session.url, payment_id: payment.id });

  } catch (error) {
    console.error('Error creating shift payment:', error);
    return Response.json({ error: 'Failed to create payment', details: error.message }, { status: 500 });
  }
});