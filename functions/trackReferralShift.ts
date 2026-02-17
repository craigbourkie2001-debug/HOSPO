import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function is triggered by automation when a shift status changes to 'completed'
    const { shiftId } = await req.json();
    
    if (!shiftId) {
      return Response.json({ error: 'Missing shiftId' }, { status: 400 });
    }
    
    // Get the shift details
    const shift = await base44.asServiceRole.entities.Shift.get(shiftId);
    
    if (!shift || !shift.assigned_to) {
      return Response.json({ message: 'Shift not assigned or not found' }, { status: 200 });
    }
    
    const workerEmail = shift.assigned_to;
    
    // Check if this worker was referred
    const referrals = await base44.asServiceRole.entities.Referral.filter({
      referred_email: workerEmail,
      status: 'onboarded'
    });
    
    if (referrals.length === 0) {
      return Response.json({ message: 'No pending referrals for this worker' }, { status: 200 });
    }
    
    const referral = referrals[0];
    
    // Update referral status to first_shift_completed
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      status: 'first_shift_completed',
      first_shift_date: shift.date
    });
    
    // Award €50 to the referrer
    const referrer = await base44.asServiceRole.entities.User.filter({ email: referral.referrer_email });
    
    if (referrer.length > 0) {
      const currentCredits = referrer[0].referral_credits || 0;
      await base44.asServiceRole.entities.User.update(referrer[0].id, {
        referral_credits: currentCredits + 50
      });
      
      // Update referral status to reward_paid
      await base44.asServiceRole.entities.Referral.update(referral.id, {
        status: 'reward_paid',
        reward_paid_date: new Date().toISOString()
      });
      
      console.log(`Awarded €50 referral bonus to ${referral.referrer_email} for referring ${workerEmail}`);
    }
    
    // Also award €50 to the referred worker
    const referredWorker = await base44.asServiceRole.entities.User.filter({ email: workerEmail });
    if (referredWorker.length > 0) {
      const currentCredits = referredWorker[0].referral_credits || 0;
      await base44.asServiceRole.entities.User.update(referredWorker[0].id, {
        referral_credits: currentCredits + 50
      });
      
      console.log(`Awarded €50 welcome bonus to ${workerEmail} for completing first shift`);
    }
    
    return Response.json({ 
      success: true, 
      message: 'Referral rewards processed',
      referrer: referral.referrer_email,
      referred: workerEmail
    });
    
  } catch (error) {
    console.error('Error tracking referral shift:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});