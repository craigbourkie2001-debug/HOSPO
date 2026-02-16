import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Webhook configuration error' }, { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize base44 client with service role for webhook processing
    const base44 = createClientFromRequest(req);

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { payment_id, shift_id, worker_email, subscription_type, user_email } = session.metadata;

      // Handle premium subscription
      if (subscription_type === 'employer_premium' && user_email) {
        console.log('Premium subscription completed:', { user_email, subscription_id: session.subscription });

        // Update user to premium status
        const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            employer_premium: true,
            stripe_subscription_id: session.subscription,
            premium_activated_at: new Date().toISOString()
          });

          // Send confirmation email
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user_email,
            subject: 'Welcome to Hospo+ Premium!',
            body: `Congratulations! Your Hospo+ Premium subscription is now active.\n\nYou now have access to:\n- Featured placement for all shifts\n- Featured placement for all job postings\n- Premium badge on your venue profile\n- Priority support\n- Advanced analytics\n\nAll your future shift and job postings will automatically be featured.\n\nThank you for choosing Hospo+ Premium!`
          });

          console.log('Premium subscription activated for:', user_email);
        }
        
        return Response.json({ received: true });
      }

      // Handle shift payment
      if (payment_id && shift_id) {

      console.log('Payment completed:', { payment_id, shift_id });

      // Update payment status
      await base44.asServiceRole.entities.Payment.update(payment_id, {
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        paid_at: new Date().toISOString()
      });

      // Send confirmation email to worker
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: worker_email,
        subject: 'Payment Received for Your Shift',
        body: `Great news! Your payment for the shift has been processed.\n\nThe payment has been completed and will be transferred to your account shortly.\n\nThank you for your hard work!`
      });

      // Get shift and employer details for employer email
      const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
      if (payments.length > 0) {
        const payment = payments[0];
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: payment.employer_email,
          subject: 'Shift Payment Confirmed',
          body: `Your payment for ${payment.worker_name}'s shift has been successfully processed.\n\nShift Date: ${new Date(payment.shift_date).toLocaleDateString()}\nHours Worked: ${payment.hours_worked}h\nTotal Paid: €${payment.employer_total.toFixed(2)}\n\nThank you for using Hospo!`
        });
      }

      console.log('Payment processed successfully:', payment_id);
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      // Find user by subscription ID
      const users = await base44.asServiceRole.entities.User.filter({ 
        stripe_subscription_id: subscription.id 
      });
      
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          employer_premium: false,
          stripe_subscription_id: null,
          premium_cancelled_at: new Date().toISOString()
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: users[0].email,
          subject: 'Hospo+ Premium Subscription Cancelled',
          body: `Your Hospo+ Premium subscription has been cancelled.\n\nYou'll continue to have access to premium features until the end of your billing period.\n\nIf you'd like to reactivate your subscription, you can do so anytime from your dashboard.\n\nThank you for being a premium member!`
        });

        console.log('Premium subscription cancelled for:', users[0].email);
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
});