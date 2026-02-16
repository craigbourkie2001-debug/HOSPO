import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

    // Verify shift is completed and assigned
    if (shift.status !== 'completed') {
      return Response.json({ error: 'Shift must be completed before payment' }, { status: 400 });
    }

    if (!shift.assigned_to) {
      return Response.json({ error: 'Shift has no assigned worker' }, { status: 400 });
    }

    // Check if payment already exists
    const existingPayments = await base44.entities.Payment.filter({ shift_id });
    if (existingPayments.length > 0 && existingPayments[0].status !== 'failed') {
      return Response.json({ error: 'Payment already exists for this shift' }, { status: 400 });
    }

    // Calculate payment details
    const shiftDate = new Date(shift.date);
    const startTime = new Date(`${shift.date}T${shift.start_time}`);
    const endTime = new Date(`${shift.date}T${shift.end_time}`);
    const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);
    
    const grossAmount = hoursWorked * shift.hourly_rate;
    const platformFeeEmployer = grossAmount * 0.10; // 10% employer fee
    const platformFeeWorker = grossAmount * 0.10;   // 10% worker fee
    const workerPayout = grossAmount - platformFeeWorker;
    const employerTotal = grossAmount + platformFeeEmployer;

    // Create payment record
    const payment = await base44.entities.Payment.create({
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
      status: 'pending'
    });

    // Create Stripe checkout session
    const origin = req.headers.get('origin') || 'https://app.base44.com';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Payment for ${shift.role_type} shift`,
              description: `${shift.venue_name} - ${new Date(shift.date).toLocaleDateString()} (${hoursWorked}h @ €${shift.hourly_rate}/h)`,
            },
            unit_amount: Math.round(employerTotal * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/employerdashboard?payment=success`,
      cancel_url: `${origin}/employerdashboard?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id: payment.id,
        shift_id,
        worker_email: shift.assigned_to,
      },
    });

    // Update payment with session ID
    await base44.entities.Payment.update(payment.id, {
      stripe_payment_intent_id: session.id
    });

    return Response.json({ 
      sessionUrl: session.url,
      payment_id: payment.id 
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json({ 
      error: 'Failed to create payment',
      details: error.message 
    }, { status: 500 });
  }
});