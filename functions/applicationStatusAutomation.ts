import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse the event from the automation payload
    const { event, data, old_data } = await req.json();
    
    console.log(`Application status changed: ${event.type}`, { 
      applicationId: event.entity_id, 
      oldStatus: old_data?.status,
      newStatus: data?.status 
    });

    // Only process update events
    if (event.type !== 'update') {
      return Response.json({ success: true, message: 'Not an update event' });
    }

    const { status: newStatus } = data || {};
    const { status: oldStatus } = old_data || {};

    // Status changed, send appropriate email
    if (newStatus === 'accepted' && oldStatus !== 'accepted') {
      // Send shift confirmation email
      const emailPayload = {
        emailType: 'shift_confirmation',
        applicantEmail: data.applicant_email,
        applicantName: data.applicant_name,
        venueName: data.venue_name,
        shiftDate: data.shift_date,
        startTime: data.start_time,
        endTime: data.end_time,
        hourlyRate: data.hourly_rate,
        roleType: data.role_type
      };

      console.log('Sending acceptance email:', emailPayload);
      
      // Call the sendApplicationEmail function
      const result = await base44.asServiceRole.functions.invoke('sendApplicationEmail', emailPayload);
      console.log('Acceptance email sent:', result);

    } else if (newStatus === 'rejected' && oldStatus !== 'rejected') {
      // Send rejection email
      const emailPayload = {
        emailType: 'rejection',
        applicantEmail: data.applicant_email,
        applicantName: data.applicant_name,
        venueName: data.venue_name,
        roleType: data.role_type
      };

      console.log('Sending rejection email:', emailPayload);
      
      const result = await base44.asServiceRole.functions.invoke('sendApplicationEmail', emailPayload);
      console.log('Rejection email sent:', result);
    }

    return Response.json({ 
      success: true, 
      message: 'Application status automation completed' 
    });
  } catch (error) {
    console.error('Error in application status automation:', error);
    // Don't fail the automation on email errors - log and continue
    return Response.json({ 
      success: true, 
      message: 'Automation completed with error',
      error: error.message 
    });
  }
});