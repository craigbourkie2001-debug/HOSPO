import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicantEmail, applicantName, venueName, shiftDate, startTime, endTime, hourlyRate, roleType } = await req.json();

    // Validate required fields
    if (!applicantEmail || !venueName || !shiftDate || !startTime || !endTime) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Format the confirmation email
    const emailSubject = `Shift Confirmation - ${venueName} on ${shiftDate}`;
    const emailBody = `
Hi ${applicantName},

Great news! Your shift application has been accepted.

**Shift Confirmation Details:**
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
      return Response.json({ error: 'Failed to send confirmation email' }, { status: sendResponse.status });
    }

    const result = await sendResponse.json();

    return Response.json({
      success: true,
      message: 'Shift confirmation sent successfully',
      messageId: result.id
    });
  } catch (error) {
    console.error('Error sending shift confirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});