import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'employer') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shift_id } = await req.json();

    // Get shift details
    const shifts = await base44.entities.Shift.filter({ id: shift_id });
    if (!shifts || shifts.length === 0) {
      return Response.json({ error: 'Shift not found' }, { status: 404 });
    }

    const shift = shifts[0];

    if (!shift.assigned_to) {
      return Response.json({ error: 'Shift not assigned to a worker' }, { status: 400 });
    }

    // Get worker details
    const workers = await base44.entities.User.filter({ email: shift.assigned_to });
    if (!workers || workers.length === 0) {
      return Response.json({ error: 'Worker not found' }, { status: 404 });
    }

    const worker = workers[0];

    if (!worker.stripe_connect_account_id || !worker.stripe_connect_onboarded) {
      return Response.json({ 
        error: 'Worker has not completed payment setup' 
      }, { status: 400 });
    }

    // Calculate hours and amounts
    const startTime = new Date(`2000-01-01T${shift.start_time}`);
    const endTime = new Date(`2000-01-01T${shift.end_time}`);
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    
    const hourlyRate = shift.hourly_rate;
    const grossAmount = Math.round(hours * hourlyRate * 100); // in cents
    const platformFee = Math.round(grossAmount * 0.10); // 10% commission
    const workerPayout = grossAmount - platformFee;

    // Get or create Stripe customer for employer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.company_name || user.full_name,
        metadata: {
          user_email: user.email,
          base44_app_id: Deno.env.get("BASE44_APP_ID")
        }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Shift Payment: ${shift.venue_name}`,
            description: `${shift.date} (${shift.start_time} - ${shift.end_time}) - ${hours}h @ €${hourlyRate}/h`,
          },
          unit_amount: grossAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/employer-dashboard?payment_success=true&shift_id=${shift_id}`,
      cancel_url: `${req.headers.get('origin')}/employer-dashboard?payment_cancelled=true`,
      metadata: {
        shift_id: shift_id,
        worker_email: worker.email,
        employer_email: user.email,
        hours_worked: hours.toString(),
        hourly_rate: hourlyRate.toString(),
        platform_fee: (platformFee / 100).toString(),
        worker_payout: (workerPayout / 100).toString(),
        base44_app_id: Deno.env.get("BASE44_APP_ID")
      },
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: worker.stripe_connect_account_id,
        },
        metadata: {
          shift_id: shift_id,
          base44_app_id: Deno.env.get("BASE44_APP_ID")
        }
      }
    });

    // Create payment record
    await base44.asServiceRole.entities.Payment.create({
      shift_id: shift_id,
      worker_email: worker.email,
      worker_name: worker.full_name,
      employer_email: user.email,
      venue_name: shift.venue_name,
      shift_date: shift.date,
      hours_worked: hours,
      hourly_rate: hourlyRate,
      gross_amount: grossAmount / 100,
      platform_fee_employer: platformFee / 100,
      platform_fee_worker: 0,
      worker_payout: workerPayout / 100,
      employer_total: grossAmount / 100,
      status: 'pending',
      stripe_payment_intent_id: session.payment_intent,
    });

    return Response.json({ 
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Payment funding error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create payment' 
    }, { status: 500 });
  }
});