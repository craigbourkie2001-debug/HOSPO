import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import InlineShiftChat from "./InlineShiftChat";

export default function ShiftChatButton({ shift, className, size = "default", variant = "outline" }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setChatOpen(true)}
        className={className}
        style={{ minHeight: '44px' }}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat About Shift
      </Button>
      
      <InlineShiftChat
        shift={shift}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}