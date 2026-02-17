import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Loader2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InlineShiftChat({ shift, isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && shift) {
      initializeChat();
    }
  }, [isOpen, shift]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const unsubscribe = base44.entities.Message.subscribe((event) => {
        if (event.type === 'create' && event.data.conversation_id === conversationId) {
          setMessages(prev => [...prev, event.data]);
          setTimeout(() => scrollToBottom(), 100);
        }
      });
      return unsubscribe;
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!shift.assigned_to) {
        toast.error('No worker assigned to this shift yet');
        onClose();
        return;
      }

      const isWorker = currentUser.email === shift.assigned_to;
      let recipientEmail, recipientName, recipientPhone;

      if (isWorker) {
        const venue = shift.venue_type === 'coffee_shop'
          ? await base44.entities.CoffeeShop.filter({ id: shift.venue_id })
          : await base44.entities.Restaurant.filter({ id: shift.venue_id });

        if (!venue || venue.length === 0) {
          toast.error('Could not find venue information');
          onClose();
          return;
        }

        recipientEmail = venue[0].created_by;
        recipientName = shift.venue_name;
        recipientPhone = venue[0].contact_phone;
      } else {
        recipientEmail = shift.assigned_to;
        recipientName = shift.assigned_to_name;
        
        const workerProfile = await base44.entities.User.filter({ email: shift.assigned_to });
        recipientPhone = workerProfile?.[0]?.phone;
      }

      setRecipientInfo({ email: recipientEmail, name: recipientName, phone: recipientPhone });

      const emails = [currentUser.email, recipientEmail].sort();
      const convId = `conv_${emails.join('_').replace(/[^a-zA-Z0-9]/g, '_')}`;
      setConversationId(convId);

      const existingMessages = await base44.entities.Message.filter(
        { conversation_id: convId },
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
          conversation_id: convId,
          sender_email: currentUser.email,
          sender_name: currentUser.full_name,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          content: `Hi! I wanted to discuss the ${shift.role_type} shift at ${shift.venue_name} on ${shiftDate}.`,
          related_shift_id: shift.id,
        });
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.Message.filter(
        { conversation_id: conversationId },
        'created_date'
      );
      setMessages(msgs);

      const unreadMessages = msgs.filter(
        m => m.recipient_email === user.email && !m.read
      );
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { read: true });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !recipientInfo) return;

    try {
      setSending(true);
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: recipientInfo.email,
        recipient_name: recipientInfo.name,
        content: newMessage.trim(),
        related_shift_id: shift.id,
      });
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b" style={{ borderColor: 'var(--sand)' }}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {recipientInfo?.name || 'Loading...'}
              </DialogTitle>
              <p className="text-sm mt-1" style={{ color: 'var(--clay)' }}>
                {shift.role_type} shift • {format(new Date(shift.date), 'EEEE, MMMM d')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {recipientInfo?.phone && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`tel:${recipientInfo.phone}`}>
                    <Phone className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {recipientInfo?.email && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`mailto:${recipientInfo.email}`}>
                    <Mail className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--terracotta)' }} />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_email === user.email;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isOwn
                            ? 'bg-[var(--earth)] text-white'
                            : 'bg-[var(--sand)] text-[var(--earth)]'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-white/70' : 'text-[var(--clay)]'
                          }`}
                        >
                          {format(new Date(message.created_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="px-6 py-4 border-t" style={{ borderColor: 'var(--sand)' }}>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                  style={{ minHeight: '44px' }}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  style={{ backgroundColor: 'var(--terracotta)', minHeight: '44px' }}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}