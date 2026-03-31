import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a Connect account
    if (user.stripe_connect_account_id) {
      // Create account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: user.stripe_connect_account_id,
        refresh_url: `${req.headers.get('origin')}/profile`,
        return_url: `${req.headers.get('origin')}/profile?stripe_connected=true`,
        type: 'account_onboarding',
      });

      return Response.json({ url: accountLink.url });
    }

    // Create new Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'IE',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        email: user.email,
        first_name: user.legal_first_name || user.full_name?.split(' ')[0],
        last_name: user.legal_last_name || user.full_name?.split(' ').slice(1).join(' '),
      },
    });

    // Update user with Connect account ID
    await base44.auth.updateMe({
      stripe_connect_account_id: account.id,
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/profile`,
      return_url: `${req.headers.get('origin')}/profile?stripe_connected=true`,
      type: 'account_onboarding',
    });

    return Response.json({ 
      url: accountLink.url,
      account_id: account.id 
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create Connect account' 
    }, { status: 500 });
  }
});