import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Phone, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch all conversations
  const { data: allMessages = [], refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
    enabled: !!user,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      // Refetch messages when a new message is created or updated
      if (event.type === 'create' || event.type === 'update') {
        refetch();
        
        // Auto-scroll to bottom if we're in the conversation
        if (selectedConversation && event.data) {
          const isRelevantMessage = 
            event.data.conversation_id === selectedConversation.id ||
            (event.data.sender_email === user.email && event.data.recipient_email === selectedConversation.otherUser.email) ||
            (event.data.recipient_email === user.email && event.data.sender_email === selectedConversation.otherUser.email);
          
          if (isRelevantMessage) {
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user, selectedConversation?.id, refetch]);

  // Group messages into conversations
  const conversations = React.useMemo(() => {
    if (!user || !allMessages.length) return [];
    
    const convMap = new Map();
    allMessages.forEach(msg => {
      const otherUser = msg.sender_email === user.email 
        ? { email: msg.recipient_email, name: msg.recipient_name }
        : { email: msg.sender_email, name: msg.sender_name };
      
      if (!convMap.has(msg.conversation_id)) {
        convMap.set(msg.conversation_id, {
          id: msg.conversation_id,
          otherUser,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conv = convMap.get(msg.conversation_id);
      conv.messages.push(msg);
      
      if (!msg.read && msg.recipient_email === user.email) {
        conv.unreadCount++;
      }
      
      if (new Date(msg.created_date) > new Date(conv.lastMessage.created_date)) {
        conv.lastMessage = msg;
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
  }, [allMessages, user]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Message.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  useEffect(() => {
    if (selectedConversation && user) {
      const unreadMessages = selectedConversation.messages.filter(
        msg => !msg.read && msg.recipient_email === user.email
      );
      unreadMessages.forEach(msg => {
        markReadMutation.mutate({ id: msg.id });
      });
    }
  }, [selectedConversation?.id]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation || !user) return;
    
    sendMutation.mutate({
      conversation_id: selectedConversation.id,
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: selectedConversation.otherUser.email,
      recipient_name: selectedConversation.otherUser.name,
      content: messageText.trim(),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--terracotta)' }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Mobile Header */}
      <header className="border-b px-4 py-4 md:hidden sticky top-0 z-10" style={{ backgroundColor: 'var(--warm-white)', borderColor: 'var(--sand)' }}>
        <div className="flex items-center gap-3">
          {selectedConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <MessageCircle className="w-6 h-6" style={{ color: 'var(--terracotta)' }} />
          <h1 className="text-xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
            {selectedConversation ? selectedConversation.otherUser.name : 'Messages'}
          </h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r ${selectedConversation ? 'hidden md:block' : ''}`} style={{ borderColor: 'var(--sand)' }}>
          <div className="p-6 border-b hidden md:block" style={{ borderColor: 'var(--sand)' }}>
            <h2 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>Messages</h2>
          </div>
          <ScrollArea className="h-full">
            {conversations.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--clay)' }}>
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="w-full p-4 rounded-xl text-left transition-all hover-lift mb-2"
                    style={{
                      backgroundColor: selectedConversation?.id === conv.id ? 'var(--sand)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                        {conv.otherUser.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate" style={{ color: 'var(--earth)' }}>
                            {conv.otherUser.name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--terracotta)' }}>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm truncate" style={{ color: 'var(--clay)' }}>
                         {conv.lastMessage.sender_email === user.email ? 'You: ' : ''}{conv.lastMessage.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                         <p className="text-xs" style={{ color: 'var(--clay)' }}>
                           {format(new Date(conv.lastMessage.created_date), 'MMM d, h:mm a')}
                         </p>
                         {conv.lastMessage.related_shift_id && (
                           <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--sand)', color: 'var(--clay)' }}>
                             About a shift
                           </span>
                         )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--clay)' }}>
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="border-b p-4 hidden md:block" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--terracotta)', color: 'white' }}>
                      {selectedConversation.otherUser.name[0].toUpperCase()}
                    </div>
                    <div>
                     <p className="font-medium" style={{ color: 'var(--earth)' }}>
                       {selectedConversation.otherUser.name}
                     </p>
                     <p className="text-sm" style={{ color: 'var(--clay)' }}>
                       {selectedConversation.otherUser.email}
                     </p>
                     {selectedConversation.lastMessage.related_shift_id && (
                       <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: 'var(--sand)', color: 'var(--clay)' }}>
                         About a shift
                       </p>
                     )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.location.href = `mailto:${selectedConversation.otherUser.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => alert('Phone feature coming soon')}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Actions - Mobile */}
              <div className="flex gap-2 p-3 border-b md:hidden" style={{ borderColor: 'var(--sand)' }}>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.href = `mailto:${selectedConversation.otherUser.email}`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => alert('Phone feature coming soon')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages
                    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                    .map(msg => {
                      const isOwn = msg.sender_email === user.email;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                           className="max-w-[70%] rounded-2xl px-4 py-2"
                           style={{
                             backgroundColor: isOwn ? 'var(--terracotta)' : 'var(--warm-white)',
                             color: isOwn ? 'white' : 'var(--earth)',
                             border: msg.related_shift_id && !isOwn ? '1px solid var(--sand)' : 'none',
                           }}
                          >
                           {msg.related_shift_id && (
                             <div className="text-xs mb-2 pb-2 border-b" style={{ borderColor: isOwn ? 'rgba(255,255,255,0.3)' : 'var(--sand)', color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--clay)' }}>
                               📅 About a shift
                             </div>
                           )}
                           <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                           <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : ''}`} style={{ color: isOwn ? 'inherit' : 'var(--clay)' }}>
                             {format(new Date(msg.created_date), 'h:mm a')}
                           </p>
                          </div>
                        </div>
                      );
                    })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                    style={{ minHeight: '44px' }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMutation.isPending}
                    style={{ backgroundColor: 'var(--terracotta)', minHeight: '44px', minWidth: '44px' }}
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}