import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();
    
    // Get the shift details
    const shift = await base44.asServiceRole.entities.Shift.filter({ id: data.shift_id });
    if (!shift || shift.length === 0) {
      console.error('Shift not found:', data.shift_id);
      return Response.json({ error: 'Shift not found' }, { status: 404 });
    }
    
    const shiftData = shift[0];
    
    // Get employer email from venue
    let employerEmail = shiftData.created_by;
    
    if (!employerEmail && data.venue_type) {
      // Try to get from venue
      const venueEntity = data.venue_type === 'coffee_shop' ? 'CoffeeShop' : 'Restaurant';
      const venue = await base44.asServiceRole.entities[venueEntity].filter({ id: data.venue_id });
      
      if (venue && venue.length > 0) {
        employerEmail = venue[0].contact_email;
      }
    }
    
    if (!employerEmail) {
      console.error('No employer email found for shift or venue');
      return Response.json({ error: 'Employer email not found' }, { status: 400 });
    }

    // Get Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
    
    // Compose email
    const subject = `New Application: ${data.applicant_name} applied for ${shiftData.role_type} shift`;
    const body = `
Hello,

You have a new application for your ${shiftData.role_type} shift at ${shiftData.venue_name}.

Applicant Details:
- Name: ${data.applicant_name}
- Phone: ${data.applicant_phone || 'Not provided'}
- Experience: ${data.applicant_experience_years || 0} years
- Rating: ${data.applicant_rating ? data.applicant_rating + '/5' : 'New worker'}
- Skills: ${data.applicant_skills?.join(', ') || 'None listed'}

Shift Details:
- Date: ${shiftData.date}
- Time: ${shiftData.start_time} - ${shiftData.end_time}
- Rate: €${shiftData.hourly_rate}/hour
- Location: ${shiftData.location}

${data.cover_note ? `Cover Note:\n"${data.cover_note}"\n` : ''}

Log in to your Hospo dashboard to review and respond to this application.

Best regards,
Hospo Team
    `.trim();

    // Create RFC 2822 email format
    const emailContent = [
      `To: ${employerEmail}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ].join('\r\n');

    // Base64 encode (URL-safe)
    const encodedMessage = btoa(emailContent)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gmail API error:', error);
      return Response.json({ error: 'Failed to send email', details: error }, { status: response.status });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);

    return Response.json({ 
      success: true, 
      message: 'Notification sent',
      emailId: result.id 
    });

  } catch (error) {
    console.error('Error in notifyEmployerNewApplication:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});