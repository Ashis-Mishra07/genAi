'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Clock, User, Send, ArrowLeft } from 'lucide-react';

interface Conversation {
  artisan_id: string;
  artisan_name: string;
  artisan_email: string;
  last_message: string;
  last_message_time: string;
  last_sender: 'admin' | 'artisan';
  unread_count: number;
}

interface Message {
  id: string;
  message: string;
  isFromAdmin: boolean;
  timestamp: string;
  status: string;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Use the same admin-chat endpoint but as admin
      const response = await fetch('/api/admin-chat', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin conversations loaded:', data);
        if (data.isAdmin && data.conversations) {
          setConversations(data.conversations);
        }
      } else {
        console.error('Failed to load conversations:', response.status);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (artisanId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Get messages for specific artisan conversation
      const response = await fetch(`/api/admin-chat?artisanId=${artisanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin messages loaded for artisan', artisanId, ':', data);
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load messages:', response.status);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('Admin sending message to artisan', selectedConversation.artisan_id, ':', newMessage);
      
      const response = await fetch('/api/admin-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedConversation.artisan_id,
          message: newMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin message sent successfully:', data);
        setNewMessage('');
        await loadMessages(selectedConversation.artisan_id);
        await loadConversations(); // Refresh conversation list
      } else {
        console.error('Failed to send admin message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.artisan_id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadConversations();
      setIsLoading(false);
    };

    initializeData();
    
    // Set up polling for conversation updates every 2 seconds
    const conversationInterval = setInterval(loadConversations, 2000);
    
    return () => clearInterval(conversationInterval);
  }, []);

  useEffect(() => {
    // Poll for new messages every 2 seconds when a conversation is selected
    if (selectedConversation) {
      const messageInterval = setInterval(() => {
        loadMessages(selectedConversation.artisan_id);
      }, 2000);

      return () => clearInterval(messageInterval);
    }
  }, [selectedConversation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Admin Support Center
          </h1>
          <p className="text-white/70 mt-2">Manage artisan support conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 h-full">
              <div className="p-4 border-b border-white/20">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Active Conversations ({conversations.length})
                </h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {isLoading ? (
                  <div className="p-4 text-center text-white/70">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-white/70">No conversations yet</div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.artisan_id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                        selectedConversation?.artisan_id === conversation.artisan_id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-orange-400" />
                            <span className="font-medium truncate">{conversation.artisan_name}</span>
                            {conversation.unread_count > 0 && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 truncate">{conversation.last_message}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                            <Clock className="h-3 w-3" />
                            {formatTime(conversation.last_message_time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/20 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.artisan_name}</h3>
                        <p className="text-sm text-white/70">{selectedConversation.artisan_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.isFromAdmin
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          <p className="break-words">{message.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/20">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your response..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/70 mb-2">Select a Conversation</h3>
                    <p className="text-white/50">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
