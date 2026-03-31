import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      emailType,
      applicantEmail,
      applicantName,
      venueName,
      shiftDate,
      startTime,
      endTime,
      hourlyRate,
      roleType,
      interviewDate,
      interviewTime,
      contactPerson,
      contactPhone
    } = await req.json();

    if (!emailType || !applicantEmail || !applicantName || !venueName) {
      return Response.json({ error: 'Missing required fields: emailType, applicantEmail, applicantName, venueName' }, { status: 400 });
    }

    let emailSubject = '';
    let emailBody = '';

    if (emailType === 'acknowledgment') {
      emailSubject = `Application Received – ${venueName}`;
      emailBody = `Hi ${applicantName},\n\nThank you for applying to the ${roleType} position at ${venueName}!\n\nWe've received your application and are reviewing it carefully. You'll hear back within 3–5 business days.\n\nBest regards,\nHospo Ireland Team`;

    } else if (emailType === 'interview') {
      emailSubject = `Interview Scheduled – ${venueName}`;
      emailBody = `Hi ${applicantName},\n\nGreat news! We'd like to invite you to an interview for the ${roleType} position at ${venueName}.\n\nInterview Details:\n- Date: ${interviewDate}\n- Time: ${interviewTime}\n- Venue: ${venueName}\n${contactPerson ? `- Contact: ${contactPerson}\n` : ''}${contactPhone ? `- Phone: ${contactPhone}\n` : ''}\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nHospo Ireland Team`;

    } else if (emailType === 'rejection') {
      emailSubject = `Application Update – ${venueName}`;
      emailBody = `Hi ${applicantName},\n\nThank you for your interest in the ${roleType ? roleType + ' ' : ''}position at ${venueName}.\n\nAfter careful consideration, we've decided to move forward with other candidates at this time. We encourage you to apply for future opportunities.\n\nBest regards,\nHospo Ireland Team`;

    } else if (emailType === 'shift_confirmation') {
      emailSubject = `Shift Confirmed – ${venueName}${shiftDate ? ' on ' + shiftDate : ''}`;
      emailBody = `Hi ${applicantName},\n\nCongratulations! Your shift application has been accepted.\n\nShift Details:\n- Venue: ${venueName}${shiftDate ? '\n- Date: ' + shiftDate : ''}${startTime ? '\n- Time: ' + startTime + (endTime ? ' – ' + endTime : '') : ''}${roleType ? '\n- Role: ' + roleType.charAt(0).toUpperCase() + roleType.slice(1) : ''}${hourlyRate ? '\n- Hourly Rate: €' + hourlyRate + '/hour' : ''}\n\nPlease arrive 10 minutes early and bring your ID.\n\nBest regards,\nHospo Ireland Team`;

    } else {
      return Response.json({ error: 'Invalid emailType' }, { status: 400 });
    }

    // Use Core integration to send email (no Gmail OAuth needed)
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: applicantEmail,
      subject: emailSubject,
      body: emailBody
    });

    console.log(`${emailType} email sent to ${applicantEmail}`);

    return Response.json({
      success: true,
      message: `${emailType} email sent successfully`
    });

  } catch (error) {
    console.error('Error in sendApplicationEmail:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});