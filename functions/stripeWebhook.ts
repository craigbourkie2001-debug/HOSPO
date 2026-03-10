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

      // Handle employer premium subscription
      if (subscription_type === 'employer_premium' && user_email) {
        console.log('Employer premium subscription completed:', { user_email, subscription_id: session.subscription });
        const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            employer_premium: true,
            stripe_subscription_id: session.subscription,
            premium_activated_at: new Date().toISOString()
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user_email,
            subject: 'Welcome to Hospo+ Employer Premium!',
            body: `Congratulations! Your Hospo+ Employer Premium subscription is now active.\n\nYou now have access to:\n- Featured placement for all shifts\n- Featured placement for all job postings\n- Premium badge on your venue profile\n- Priority support\n- Advanced analytics\n\nThank you for choosing Hospo+ Premium!`
          });
          console.log('Employer premium activated for:', user_email);
        }
        return Response.json({ received: true });
      }

      // Handle worker premium subscription
      if (subscription_type === 'worker_premium' && user_email) {
        console.log('Worker premium subscription completed:', { user_email, subscription_id: session.subscription });
        const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            is_premium: true,
            stripe_subscription_id: session.subscription,
            premium_activated_at: new Date().toISOString(),
            premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user_email,
            subject: 'Welcome to Hospo+ Premium!',
            body: `Congratulations! Your Hospo+ Premium subscription is now active.\n\nYou now have access to:\n- Priority matching — shown to employers first\n- Featured profile in search results\n- Advanced analytics\n\nThank you for choosing Hospo+!`
          });
          console.log('Worker premium activated for:', user_email);
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

      // Get payment record for full details
      const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
      if (payments.length > 0) {
        const payment = payments[0];

        // Send confirmation to worker with IBAN details
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: worker_email,
          subject: `Payment of €${payment.worker_payout?.toFixed(2)} on its way!`,
          body: `Hi ${payment.worker_name || 'there'},\n\nGreat news! Your employer has completed payment for your shift at ${payment.venue_name}.\n\nPayment Summary:\n- Shift Date: ${new Date(payment.shift_date).toLocaleDateString('en-IE')}\n- Hours Worked: ${payment.hours_worked}h @ €${payment.hourly_rate}/h\n- Your Payout: €${payment.worker_payout?.toFixed(2)}\n\nThe payment will be transferred to your registered IBAN within 3–5 business days.\n\nIBAN on file: ${payment.worker_iban ? `****${payment.worker_iban.slice(-4)}` : 'not set'}\n\nIf you have any questions, contact us at hello@hospo.ie.\n\nThank you for working with Hospo Ireland!`
        });

        // Send confirmation to employer
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: payment.employer_email,
          subject: `Shift Payment Confirmed — €${payment.employer_total?.toFixed(2)}`,
          body: `Your payment for ${payment.worker_name}'s shift has been successfully processed.\n\nPayment Breakdown:\n- Shift Date: ${new Date(payment.shift_date).toLocaleDateString('en-IE')}\n- Hours Worked: ${payment.hours_worked}h @ €${payment.hourly_rate}/h\n- Worker Earnings: €${payment.gross_amount?.toFixed(2)}\n- Platform Fee (10%): €${payment.platform_fee_employer?.toFixed(2)}\n- Total Charged: €${payment.employer_total?.toFixed(2)}\n\nThe worker will receive €${payment.worker_payout?.toFixed(2)} directly to their registered bank account within 3–5 business days.\n\nThank you for using Hospo Ireland!`
        });

        console.log('Payment emails sent for payment:', payment_id);
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
        const cancelledUser = users[0];
        await base44.asServiceRole.entities.User.update(cancelledUser.id, {
          employer_premium: false,
          is_premium: false,
          stripe_subscription_id: null,
          premium_cancelled_at: new Date().toISOString()
        });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: cancelledUser.email,
          subject: 'Hospo+ Premium Subscription Cancelled',
          body: `Your Hospo+ Premium subscription has been cancelled.\n\nYou'll continue to have access to premium features until the end of your billing period.\n\nIf you'd like to reactivate, you can do so anytime from your dashboard.\n\nThank you for being a premium member!`
        });
        console.log('Premium subscription cancelled for:', cancelledUser.email);
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