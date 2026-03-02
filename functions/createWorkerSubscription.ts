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

    // Already subscribed?
    if (user.is_premium && user.stripe_subscription_id) {
      return Response.json({ error: 'Already subscribed to Hospo+ Premium' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: 'price_1T6UigE2QjaxHD8ffPvwXSeX', quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/premium?success=true`,
      cancel_url: `${origin}/premium`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        subscription_type: 'worker_premium'
      },
    });

    console.log('Worker premium session created:', session.id, 'for', user.email);

    return Response.json({ sessionUrl: session.url, session_id: session.id });

  } catch (error) {
    console.error('Error creating worker subscription:', error);
    return Response.json({ error: 'Failed to create subscription', details: error.message }, { status: 500 });
  }
});