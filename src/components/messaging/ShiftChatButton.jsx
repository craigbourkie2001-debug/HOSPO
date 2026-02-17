import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function ShiftChatButton({ shift, className, size = "default", variant = "outline" }) {
  const navigate = useNavigate();

  const handleStartChat = async () => {
    try {
      const user = await base44.auth.me();
      
      if (!shift.assigned_to) {
        toast.error('No worker assigned to this shift yet');
        return;
      }

      const isWorker = user.email === shift.assigned_to;
      let recipientEmail, recipientName;

      if (isWorker) {
        recipientEmail = shift.created_by;
        recipientName = shift.venue_name || 'Employer';
      } else {
        recipientEmail = shift.assigned_to;
        recipientName = shift.assigned_to_name || 'Worker';
      }

      if (!recipientEmail) {
        toast.error('Unable to start chat');
        return;
      }

      const emails = [user.email, recipientEmail].sort();
      const conversationId = `conv_${emails.join('_').replace(/[^a-zA-Z0-9]/g, '_')}`;

      const existingMessages = await base44.entities.Message.filter(
        { conversation_id: conversationId },
        '-created_date',
        1
      );

      if (existingMessages.length === 0) {
        const shiftDate = new Date(shift.date).toLocaleDateString('en-IE', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
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

      navigate(createPageUrl("Messages"), { state: { conversationId, shiftId: shift.id } });
      
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleStartChat}
      className={className}
      style={{ 
        minHeight: '44px',
        border: '1px solid var(--sand)',
        color: 'var(--earth)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400'
      }}
    >
      <MessageCircle className="w-4 h-4 mr-2" style={{ strokeWidth: 1.5 }} />
      Chat About Shift
    </Button>
  );
}