import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    let emailSubject = '';
    let emailBody = '';

    // Generate email content based on type
    if (emailType === 'acknowledgment') {
      emailSubject = `Application Received - ${venueName}`;
      emailBody = `
Hi ${applicantName},

Thank you for applying to the ${roleType} position at ${venueName}!

We've received your application and we're reviewing it carefully. You'll hear back from us within 3-5 business days with next steps.

If you have any questions in the meantime, feel free to reach out.

Best regards,
Hospo Ireland Team
`;
    } else if (emailType === 'interview') {
      emailSubject = `Interview Scheduled - ${venueName}`;
      emailBody = `
Hi ${applicantName},

Great news! We'd like to invite you to an interview for the ${roleType} position at ${venueName}.

**Interview Details:**
- Date: ${interviewDate}
- Time: ${interviewTime}
- Venue: ${venueName}
${contactPerson ? `- Contact: ${contactPerson}` : ''}
${contactPhone ? `- Phone: ${contactPhone}` : ''}

Please confirm your attendance by replying to this email. If this time doesn't work for you, let us know and we'll find an alternative.

Looking forward to meeting you!

Best regards,
Hospo Ireland Team
`;
    } else if (emailType === 'rejection') {
      emailSubject = `Application Update - ${venueName}`;
      emailBody = `
Hi ${applicantName},

Thank you for your interest in the ${roleType} position at ${venueName}.

After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs.

We appreciate the time you've taken to apply and encourage you to apply for future opportunities that match your skills.

Best regards,
Hospo Ireland Team
`;
    } else if (emailType === 'shift_confirmation') {
      emailSubject = `Shift Confirmation - ${venueName} on ${shiftDate}`;
      emailBody = `
Hi ${applicantName},

Congratulations! Your shift application has been accepted.

**Shift Details:**
- Venue: ${venueName}
- Date: ${shiftDate}
- Time: ${startTime} - ${endTime}
- Role: ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}
- Hourly Rate: €${hourlyRate}/hour

Please arrive 10 minutes early and bring your ID with you.

If you have any questions or need to reschedule, please contact the venue or reply to this email.

Looking forward to seeing you!

Best regards,
Hospo Ireland Team
`;
    } else {
      return Response.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Create RFC 2822 formatted email
    const message = [
      `From: ${user.email}`,
      `To: ${applicantEmail}`,
      `Subject: ${emailSubject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      emailBody
    ].join('\r\n');

    // Encode message in base64url format for Gmail API
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const sendResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedMessage
        })
      }
    );

    if (!sendResponse.ok) {
      const errorData = await sendResponse.text();
      console.error('Gmail API error:', errorData);
      return Response.json({ error: 'Failed to send email' }, { status: sendResponse.status });
    }

    const result = await sendResponse.json();

    return Response.json({
      success: true,
      message: `${emailType} email sent successfully`,
      messageId: result.id
    });
  } catch (error) {
    console.error('Error sending application email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});