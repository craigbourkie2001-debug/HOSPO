import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "../components/chat/MessageBubble";

export default function SupportChat() {
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && !conversation) {
      loadOrCreateConversation();
    }
  }, [user]);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOrCreateConversation = async () => {
    try {
      const existing = await base44.agents.listConversations({ agent_name: "support_agent" });
      if (existing.length > 0) {
        const conv = await base44.agents.getConversation(existing[0].id);
        setConversation(conv);
        setMessages(conv.messages || []);
      } else {
        const newConv = await base44.agents.createConversation({
          agent_name: "support_agent",
          metadata: { name: "Support Chat" }
        });
        setConversation(newConv);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversation) return;

    const userMessage = message.trim();
    setMessage("");

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!user || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'var(--sand)', borderTopColor: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="max-w-4xl mx-auto w-full flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)' }}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                Hospo Support
              </h1>
              <p className="text-sm" style={{ color: 'var(--clay)' }}>
                Here to help with any questions
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="sync">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <div className="flex gap-3">
            <Textarea
              placeholder="Ask a question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="rounded-xl resize-none"
              style={{ borderColor: 'var(--sand)', minHeight: '60px' }}
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="rounded-xl self-end"
              style={{ backgroundColor: 'var(--terracotta)', color: 'white', minHeight: '44px', minWidth: '44px' }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}