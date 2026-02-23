import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Fetch unread emails from Gmail with applicant-related keywords
    const response = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread subject:(application OR applicant OR apply OR shift OR job)',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gmail API error:', errorData);
      return Response.json({ error: 'Failed to fetch Gmail messages' }, { status: response.status });
    }

    const messagesData = await response.json();
    const messageIds = messagesData.messages?.map(msg => msg.id) || [];

    if (messageIds.length === 0) {
      return Response.json({ messages: [], count: 0 });
    }

    // Fetch full message details for each unread message
    const messages = await Promise.all(
      messageIds.slice(0, 20).map(async (id) => {
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!msgResponse.ok) return null;

        const message = await msgResponse.json();
        const headers = message.payload.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Extract email body
        let body = '';
        if (message.payload.parts) {
          const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
          if (textPart && textPart.body.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        } else if (message.payload.body?.data) {
          body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        }

        return {
          id,
          subject,
          from,
          date,
          body: body.substring(0, 500), // First 500 characters
          fullBody: body
        };
      })
    );

    const filteredMessages = messages.filter(m => m !== null);

    return Response.json({
      messages: filteredMessages,
      count: filteredMessages.length,
      totalUnread: messageIds.length
    });
  } catch (error) {
    console.error('Error reading Gmail messages:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});