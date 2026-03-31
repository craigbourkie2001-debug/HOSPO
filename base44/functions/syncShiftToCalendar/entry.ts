import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { shift_id } = await req.json();

    // Get shift details
    const shifts = await base44.asServiceRole.entities.Shift.filter({ id: shift_id });
    if (!shifts || shifts.length === 0) {
      return Response.json({ error: 'Shift not found' }, { status: 404 });
    }

    const shift = shifts[0];

    // Only sync completed shifts
    if (shift.status !== 'completed') {
      return Response.json({ 
        message: 'Shift not completed yet, skipping calendar sync' 
      });
    }

    // Get access token for Google Calendar
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Prepare calendar event
    const startDateTime = `${shift.date}T${shift.start_time}:00`;
    const endDateTime = `${shift.date}T${shift.end_time}:00`;

    const event = {
      summary: `${shift.role_type === 'chef' ? 'Chef' : 'Barista'} Shift - ${shift.venue_name}`,
      description: `Completed shift at ${shift.venue_name}\n\nRole: ${shift.role_type}\nLocation: ${shift.location}\nHourly Rate: €${shift.hourly_rate}\nWorker: ${shift.assigned_to_name || shift.assigned_to}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Dublin',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Dublin',
      },
      location: shift.location,
      colorId: '10', // Green color for completed shifts
    };

    // Create event in Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Calendar API error:', error);
      return Response.json({ 
        error: 'Failed to create calendar event',
        details: error 
      }, { status: 500 });
    }

    const calendarEvent = await response.json();

    console.log(`Synced shift ${shift_id} to calendar:`, calendarEvent.htmlLink);

    return Response.json({ 
      success: true,
      event_link: calendarEvent.htmlLink,
      event_id: calendarEvent.id,
      shift_id: shift_id
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return Response.json({ 
      error: error.message || 'Failed to sync shift to calendar' 
    }, { status: 500 });
  }
});