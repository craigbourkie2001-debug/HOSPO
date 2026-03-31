import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const base44 = createClientFromRequest(req);
    
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Stripe Connect webhook event:', event.type);

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;
        
        // Check if onboarding is complete
        const onboardingComplete = account.charges_enabled && account.payouts_enabled;
        
        // Find user with this Connect account
        const users = await base44.asServiceRole.entities.User.filter({ 
          stripe_connect_account_id: account.id 
        });
        
        if (users && users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            stripe_connect_onboarded: onboardingComplete
          });
          console.log(`Updated user ${users[0].email} Connect status:`, onboardingComplete);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const shiftId = paymentIntent.metadata?.shift_id;
        
        if (shiftId) {
          // Update payment record
          const payments = await base44.asServiceRole.entities.Payment.filter({ 
            stripe_payment_intent_id: paymentIntent.id 
          });
          
          if (payments && payments.length > 0) {
            await base44.asServiceRole.entities.Payment.update(payments[0].id, {
              status: 'completed',
              paid_at: new Date().toISOString(),
              stripe_transfer_id: paymentIntent.transfer
            });
            console.log(`Payment completed for shift ${shiftId}`);
          }

          // Update shift status
          await base44.asServiceRole.entities.Shift.update(shiftId, {
            status: 'completed'
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const shiftId = paymentIntent.metadata?.shift_id;
        
        if (shiftId) {
          const payments = await base44.asServiceRole.entities.Payment.filter({ 
            stripe_payment_intent_id: paymentIntent.id 
          });
          
          if (payments && payments.length > 0) {
            await base44.asServiceRole.entities.Payment.update(payments[0].id, {
              status: 'failed'
            });
            console.log(`Payment failed for shift ${shiftId}`);
          }
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        console.log('Dispute created:', dispute.id);
        
        // Update payment status
        const payments = await base44.asServiceRole.entities.Payment.filter({ 
          stripe_payment_intent_id: dispute.payment_intent 
        });
        
        if (payments && payments.length > 0) {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, {
            status: 'disputed'
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 400 });
  }
});