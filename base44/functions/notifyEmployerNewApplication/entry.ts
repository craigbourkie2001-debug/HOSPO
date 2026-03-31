import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    if (!data?.shift_id) {
      return Response.json({ error: 'Missing shift_id in payload' }, { status: 400 });
    }

    // Get the shift details
    const shifts = await base44.asServiceRole.entities.Shift.filter({ id: data.shift_id });
    if (!shifts || shifts.length === 0) {
      console.error('Shift not found:', data.shift_id);
      return Response.json({ error: 'Shift not found' }, { status: 404 });
    }

    const shiftData = shifts[0];

    // Get employer email from venue
    let employerEmail = shiftData.created_by;

    if (!employerEmail) {
      const venueEntity = (data.venue_type || shiftData.venue_type) === 'restaurant' ? 'Restaurant' : 'CoffeeShop';
      const venueId = data.venue_id || shiftData.venue_id;
      if (venueId) {
        const venue = await base44.asServiceRole.entities[venueEntity].filter({ id: venueId });
        if (venue && venue.length > 0) {
          employerEmail = venue[0].contact_email;
        }
      }
    }

    if (!employerEmail) {
      console.error('No employer email found for shift:', data.shift_id);
      return Response.json({ error: 'Employer email not found' }, { status: 400 });
    }

    const subject = `New Application – ${data.applicant_name} for ${shiftData.role_type} shift`;
    const body = `Hello,\n\nYou have a new application for your ${shiftData.role_type} shift at ${shiftData.venue_name}.\n\nApplicant Details:\n- Name: ${data.applicant_name}\n- Phone: ${data.applicant_phone || 'Not provided'}\n- Experience: ${data.applicant_experience_years || 0} years\n- Rating: ${data.applicant_rating ? data.applicant_rating + '/5' : 'New worker'}\n- Skills: ${data.applicant_skills?.join(', ') || 'None listed'}\n\nShift Details:\n- Date: ${shiftData.date}\n- Time: ${shiftData.start_time} – ${shiftData.end_time}\n- Rate: €${shiftData.hourly_rate}/hour\n- Location: ${shiftData.location}\n${data.cover_note ? `\nCover Note:\n"${data.cover_note}"\n` : ''}\nLog in to your Hospo dashboard to review this application.\n\nBest regards,\nHospo Team`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: employerEmail,
      subject,
      body
    });

    console.log('Employer notification sent to:', employerEmail);
    return Response.json({ success: true, message: 'Notification sent' });

  } catch (error) {
    console.error('Error in notifyEmployerNewApplication:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});