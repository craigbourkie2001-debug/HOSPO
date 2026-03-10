import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function StartConversationButton({ recipientEmail, recipientName, className, size = "default", variant = "outline" }) {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    try {
      const user = await base44.auth.me();
      
      // Create a conversation ID (sorted emails for consistency)
      const emails = [user.email, recipientEmail].sort();
      const conversationId = `conv_${emails.join('_').replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Check if conversation already exists
      const existingMessages = await base44.entities.Message.filter({ conversation_id: conversationId }, '-created_date', 1);
      
      if (existingMessages.length === 0) {
        // Create initial greeting message
        await base44.entities.Message.create({
          conversation_id: conversationId,
          sender_email: user.email,
          sender_name: user.full_name,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          content: `Hi ${recipientName}, I'd like to connect with you.`,
        });
      }
      
      // Navigate to messages page with the conversation highlighted
      navigate(createPageUrl("Messages"), { state: { conversationId } });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      className={className}
      style={{ minHeight: '44px' }}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Message
    </Button>
  );
}