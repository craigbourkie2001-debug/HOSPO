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
      
      // Create initial message or navigate to messages page
      navigate(createPageUrl("Messages"));
      
      // Small delay then try to select the conversation
      setTimeout(() => {
        // The Messages page will handle showing the conversation if it exists
      }, 100);
      
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