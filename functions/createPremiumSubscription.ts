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

    if (user.role !== 'employer') {
      return Response.json({ error: 'Only employers can subscribe to premium' }, { status: 403 });
    }

    const { price_id } = await req.json();

    if (!price_id) {
      return Response.json({ error: 'Missing price_id' }, { status: 400 });
    }

    // Check if already has active subscription
    if (user.employer_premium && user.stripe_subscription_id) {
      return Response.json({ error: 'Already has active premium subscription' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';
    
    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/employerdashboard?premium=success`,
      cancel_url: `${origin}/employerpremium?premium=cancelled`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        subscription_type: 'employer_premium'
      },
    });

    console.log('Premium subscription session created:', session.id);

    return Response.json({ 
      sessionUrl: session.url,
      session_id: session.id 
    });

  } catch (error) {
    console.error('Error creating premium subscription:', error);
    return Response.json({ 
      error: 'Failed to create subscription',
      details: error.message 
    }, { status: 500 });
  }
});