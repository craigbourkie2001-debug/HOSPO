import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, product_name, price, currency = 'eur', success_url, cancel_url } = await req.json();

    if (!product_name || !price) {
      return Response.json({ error: 'Missing required fields: product_name, price' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: product_name,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: success_url || `${req.headers.get('origin')}?purchase=success`,
      cancel_url: cancel_url || `${req.headers.get('origin')}?purchase=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        app_name: 'Hospo',
        product_id: product_id || '',
        user_email: user.email,
      },
    });

    console.log(`Checkout session created: ${session.id} for product: ${product_name}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});