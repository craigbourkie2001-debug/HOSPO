import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicantEmail, applicantName, venueName, roleType } = await req.json();

    if (!applicantEmail || !applicantName || !venueName || !roleType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    const emailSubject = `Application Received - ${venueName}`;
    const emailBody = `
Hi ${applicantName},

Thank you for applying to the ${roleType} position at ${venueName}!

We've received your application and we're reviewing it carefully. You'll hear back from us within 3-5 business days with next steps.

If you have any questions in the meantime, feel free to reach out.

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
      return Response.json({ error: 'Failed to send acknowledgment email' }, { status: sendResponse.status });
    }

    const result = await sendResponse.json();

    return Response.json({
      success: true,
      message: 'Acknowledgment email sent successfully',
      messageId: result.id
    });
  } catch (error) {
    console.error('Error sending acknowledgment email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});