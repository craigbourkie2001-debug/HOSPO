import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ShiftChatButton({ shift, className, size = "default", variant = "outline" }) {
  const navigate = useNavigate();

  const handleStartShiftChat = async () => {
    try {
      const user = await base44.auth.me();
      
      if (!shift.assigned_to) {
        toast.error('No worker assigned to this shift yet');
        return;
      }

      // Determine the other person in the conversation
      // Worker is chatting with venue/employer
      const isWorker = user.email === shift.assigned_to;
      
      let recipientEmail, recipientName;
      
      if (isWorker) {
        // Worker chatting with employer - need to get venue owner's email
        const venue = shift.venue_type === 'coffee_shop' 
          ? await base44.entities.CoffeeShop.filter({ id: shift.venue_id })
          : await base44.entities.Restaurant.filter({ id: shift.venue_id });
        
        if (!venue || venue.length === 0) {
          toast.error('Could not find venue information');
          return;
        }
        
        recipientEmail = venue[0].created_by;
        recipientName = shift.venue_name;
      } else {
        // Employer chatting with worker
        recipientEmail = shift.assigned_to;
        recipientName = shift.assigned_to_name;
      }
      
      // Create a conversation ID (sorted emails for consistency)
      const emails = [user.email, recipientEmail].sort();
      const conversationId = `conv_${emails.join('_').replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Check if conversation already exists
      const existingMessages = await base44.entities.Message.filter({ conversation_id: conversationId }, '-created_date', 1);
      
      if (existingMessages.length === 0) {
        // Create initial message about the shift
        const shiftDate = new Date(shift.date).toLocaleDateString('en-IE', { weekday: 'long', month: 'long', day: 'numeric' });
        await base44.entities.Message.create({
          conversation_id: conversationId,
          sender_email: user.email,
          sender_name: user.full_name,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          content: `Hi! I wanted to discuss the ${shift.role_type} shift at ${shift.venue_name} on ${shiftDate}.`,
          related_shift_id: shift.id,
        });
      }
      
      // Navigate to messages page
      navigate(createPageUrl("Messages"));
      toast.success('Opening chat about this shift');
      
    } catch (error) {
      console.error('Error starting shift conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartShiftChat}
      className={className}
      style={{ minHeight: '44px' }}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chat About Shift
    </Button>
  );
}