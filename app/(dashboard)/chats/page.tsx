"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  ArrowLeft,
  Send,
  Camera,
  Clock,
  CheckCircle,
  Sparkles,
  Instagram,
  AlertCircle,
  Paperclip,
  Download,
  Palette,
  Wand2,
} from "lucide-react";
import { GoogleLoaderWithText } from '@/components/ui/google-loader';
import { useDynamicTranslation } from "@/lib/i18n/useDynamicTranslation";

// Type definitions
interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastSeen: string;
  unreadCount: number;
  specialty: string;
  location: string;
  roomId?: string;
}

interface ArtisanConversation {
  artisan_id: string;
  artisan_name: string;
  artisan_email: string;
  last_message: string;
  last_message_time: string;
  last_sender: 'admin' | 'artisan';
  unread_count: number;
}

interface AdminMessage {
  id: string;
  message: string;
  isFromAdmin: boolean;
  timestamp: string;
  status: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string | null;
  messageType: string;
  timestamp: string;
  status: string;
  imageUrl?: string;
}

export default function ChatsPage() {
  const { translateBatch, t } = useDynamicTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [artisanConversations, setArtisanConversations] = useState<ArtisanConversation[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'support'>('support');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    translateBatch([
      "Loading conversations...",
      "Retry",
      "Back to Chats",
      "Artisan Support",
      "Support Chat",
      "Online",
      "Away",
      "Offline",
      "Just now",
      "minutes ago",
      "hours ago",
      "days ago",
      "Message",
      "Download",
      "Create Poster",
      "Support Center",
      "Manage artisan support conversations and provide business assistance",
      "Search artisans by name or specialty...",
      "Active Conversations",
      "Pending Support",
      "Responded Today",
      "Support Status",
      "Active",
      "Admin replied",
      "Needs response",
      "Artwork Image",
      "Shared image",
      "Now",
      "Failed to load users",
      "Failed to connect to chat service",
    ]);
  }, [translateBatch]);

  useEffect(() => {
    checkUserRole();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAdmin && chatMode === 'support') {
      fetchArtisanConversations();
    }
  }, [isAdmin, chatMode]);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u.id === selectedUser);
      if (user?.roomId) {
        fetchMessages(user.roomId);
      }
    }
  }, [selectedUser, users]);

  useEffect(() => {
    if (selectedArtisan && chatMode === 'support') {
      fetchAdminMessages(selectedArtisan);
      
      // Set up polling for real-time messages
      const interval = setInterval(() => {
        fetchAdminMessages(selectedArtisan);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedArtisan, chatMode]);

  useEffect(() => {
    if (isAdmin && chatMode === 'support') {
      // Set up polling for conversation list
      const interval = setInterval(() => {
        fetchArtisanConversations();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin, chatMode]);

  const checkUserRole = () => {
    const userRole = localStorage.getItem('user_role');
    setIsAdmin(userRole === 'ADMIN');
  };

  // Helper function to get the access token from localStorage
  const getAccessToken = () => {
    // Try different token keys that might be used
    return localStorage.getItem('accessToken') || 
           localStorage.getItem('auth_token') || 
           null;
  };

  const fetchArtisanConversations = async () => {
    try {
      const token = getAccessToken();
      console.log('Fetching artisan conversations...');
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('No access token found');
        return;
      }
      
      const response = await fetch('/api/admin-chat', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Artisan conversations response:', data);
        
        if (data.isAdmin && data.conversations) {
          console.log('Setting artisan conversations:', data.conversations);
          setArtisanConversations(data.conversations);
        } else {
          console.log('No artisan conversations found or not admin');
        }
      } else {
        console.error('Failed to fetch artisan conversations:', response.status);
      }
    } catch (error) {
      console.error('Error loading artisan conversations:', error);
    }
  };

  const fetchAdminMessages = async (artisanId: string) => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        console.log('No access token found for admin messages');
        return;
      }
      
      const response = await fetch(`/api/admin-chat?artisanId=${artisanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading admin messages:', error);
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedArtisan) {
      console.log('Cannot send message: missing message or selectedArtisan', { newMessage, selectedArtisan });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      console.log('Sending admin message:', { recipient_id: selectedArtisan, message: newMessage });
      
      const response = await fetch('/api/admin-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedArtisan,
          message: newMessage
        })
      });

      const responseData = await response.json();
      console.log('Admin message response:', responseData);

      if (response.ok) {
        setNewMessage('');
        await fetchAdminMessages(selectedArtisan);
        await fetchArtisanConversations();
      } else {
        console.error('Failed to send admin message:', responseData);
        throw new Error(responseData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending admin message:', error);
    }
  };

  const handleDownloadImage = async (imageUrl: string, filename: string) => {
    try {
      // For Cloudinary URLs, we can download directly
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'artisan-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Image downloaded:', filename);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try right-clicking and saving.');
    }
  };

  const handleCreatePoster = async (imageUrl: string, filename: string) => {
    try {
      // Store the image data in sessionStorage for the AI assistant
      const imageData = {
        url: imageUrl,
        filename: filename,
        artisan_id: selectedArtisan,
        timestamp: new Date().toISOString()
      };
      
      
      sessionStorage.setItem('posterImageData', JSON.stringify(imageData));
      
      // Send a message to the artisan about poster creation
      const posterMessage = `🎨 I'm going to create a professional poster for your product!

✨ Taking your image: ${filename}
🎯 I'll work with AI to design the perfect marketing poster
⏱️ This will help you sell better!

I'll be back with your poster soon! 📸➡️🎨`;

      // Send the message to artisan
      const token = localStorage.getItem('accessToken');
      const messageResponse = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: posterMessage,
          recipient_id: selectedArtisan,
        }),
      });

      if (messageResponse.ok) {
        // Refresh messages to show the notification
        if (selectedArtisan) {
          await fetchAdminMessages(selectedArtisan);
        }
      }
      
      // Redirect to AI assistant chat
      window.location.href = '/chatbot?mode=poster-creation';
      
    } catch (error) {
      console.error('Failed to initiate poster creation:', error);
      alert('Failed to start poster creation. Please try again.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find((u) => u.id === selectedUser);
      if (user?.roomId) {
        fetchMessages(user.roomId);
      }
    }
  }, [selectedUser, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setAdminUser(data.admin);
      } else {
        setError(t("Failed to load users"));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(t("Failed to connect to chat service"));
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        // Mark messages as read for admin
        if (adminUser) {
          await fetch(`/api/chat/rooms/${roomId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: adminUser.id }),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !adminUser) return;

    const user = users.find((u) => u.id === selectedUser);
    if (!user?.roomId) return;

    try {
      const response = await fetch(`/api/chat/rooms/${user.roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: adminUser.id,
          content: newMessage,
          messageType: "TEXT",
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Refresh messages
        fetchMessages(user.roomId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-400";
      case "AWAY":
        return "bg-yellow-400";
      case "OFFLINE":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case "SENT":
        return <Clock className="h-3 w-3 text-gray-400" />;
      case "DELIVERED":
        return <CheckCircle className="h-3 w-3 text-blue-400" />;
      case "READ":
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case "PROCESSING":
        return <Clock className="h-3 w-3 text-yellow-400" />;
      case "ENHANCED":
        return <Sparkles className="h-3 w-3 text-purple-400" />;
      case "POSTED":
        return <Instagram className="h-3 w-3 text-pink-400" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.log("Invalid timestamp:", timestamp);
        return t("Now");
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.log("Error parsing timestamp:", timestamp, error);
      return t("Now");
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return t("Just now");
    if (diffMins < 60) return `${diffMins} ${t("minutes ago")}`;
    if (diffHours < 24) return `${diffHours} ${t("hours ago")}`;
    if (diffDays < 7) return `${diffDays} ${t("days ago")}`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArtisanConversations = artisanConversations.filter(
    (conversation) =>
      conversation.artisan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.artisan_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserData = users.find((user) => user.id === selectedUser);
  const selectedArtisanData = artisanConversations.find((conv) => conv.artisan_id === selectedArtisan);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
                    <GoogleLoaderWithText size="xl" text={t("Loading conversations...")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-foreground mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
            {t("Retry")}
          </button>
        </div>
      </div>
    );
  }

  if (selectedUser || selectedArtisan) {
    // Individual Chat View (Regular or Support)
    const isRegularChat = !!selectedUser;
    const chatData = isRegularChat ? selectedUserData : selectedArtisanData;
    const chatMessages = isRegularChat ? messages : adminMessages;
    
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedUser(null);
                setSelectedArtisan(null);
              }}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              <span>{t("Back to Chats")}</span>
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {isRegularChat 
                      ? selectedUserData?.name?.split(" ").map((n) => n[0]).join("")
                      : selectedArtisanData?.artisan_name?.split(" ").map((n) => n[0]).join("")
                    }
                  </span>
                </div>
                {isRegularChat && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                      selectedUserData?.status || "OFFLINE"
                    )}`}></div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isRegularChat ? selectedUserData?.name : selectedArtisanData?.artisan_name}
                </h1>
                <p className="text-primary">
                  {isRegularChat ? selectedUserData?.specialty : t('Artisan Support')}
                </p>
                <p className="text-muted-foreground text-sm">
                  {isRegularChat ? selectedUserData?.location : selectedArtisanData?.artisan_email}
                </p>
              </div>
            </div>
            <div className="h-1 bg-primary rounded-full w-32"></div>
          </div>

          {/* Chat Container */}
          <div className="bg-card rounded-xl border border-border h-[70vh] flex flex-col shadow-lg">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/95">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isRegularChat ? (
                    <span
                      className={`text-sm flex items-center space-x-1 ${
                        selectedUserData?.status === "ONLINE"
                          ? "text-green-600 dark:text-green-400"
                          : selectedUserData?.status === "AWAY"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-muted-foreground"
                      }`}>
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          selectedUserData?.status || "OFFLINE"
                        )}`}></div>
                      <span>{t(selectedUserData?.status.toLowerCase() || "offline")}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{t("Support Chat")}</span>
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {isRegularChat && (
                    <>
                      <button className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 transition-all duration-200">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </button>
                      <button className="p-2 bg-pink-500/10 hover:bg-pink-500/20 rounded-lg border border-pink-500/30 transition-all duration-200">
                        <Instagram className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {isRegularChat ? (
                // Regular chat messages
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === adminUser?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}>
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        message.senderId === adminUser?.id
                          ? "bg-primary text-primary-foreground"
                          : message.messageType === "SYSTEM"
                          ? "bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300"
                          : "bg-card border border-border text-foreground"
                      } rounded-lg p-3 shadow-lg`}>
                      {message.messageType === "TEXT" && message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}

                      {message.messageType === "IMAGE" && (
                        <div className="space-y-2">
                          <div className="relative">
                            <div className="w-full h-48 bg-accent rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                              {message.imageUrl ? (
                                <img
                                  src={message.imageUrl}
                                  alt={t("Shared image")}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-center">
                                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">
                                    {t("Artwork Image")}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              {getMessageStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      )}

                      {message.messageType === "SYSTEM" && (
                        <div className="flex items-start space-x-2">
                          {getMessageStatusIcon(message.status)}
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-75">
                          {formatTimestamp(message.timestamp)}
                        </p>
                        {message.senderId === adminUser?.id && (
                          <div className="flex items-center space-x-1">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Admin support messages
                adminMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        message.isFromAdmin
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground'
                      } rounded-lg p-3 shadow-lg`}>
                      
                      <p className="text-sm">{message.message}</p>
                      
                      {/* File Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className={`rounded-lg p-2 border ${message.isFromAdmin ? 'bg-black/20 border-white/20' : 'bg-accent border-border'}`}>
                              {attachment.type === 'file' && attachment.url && (
                                <>
                                  {attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <div>
                                      <img 
                                        src={attachment.url} 
                                        alt={attachment.name}
                                        className="max-w-full h-auto rounded-lg mb-2"
                                        style={{ maxHeight: '200px' }}
                                        onError={(e) => {
                                          console.error('Failed to load image:', attachment.url);
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      <p className="text-xs opacity-80 mb-2">{attachment.name}</p>
                                      
                                      {/* Admin Control Buttons */}
                                      <div className="flex space-x-2 mt-2">
                                        <button
                                          onClick={() => handleDownloadImage(attachment.url, attachment.name)}
                                          className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md text-xs font-medium text-white transition-colors"
                                          title={t("Download Image")}>
                                          <Download className="h-3 w-3 mr-1" />
                                          {t("Download")}
                                        </button>
                                        <button
                                          onClick={() => handleCreatePoster(attachment.url, attachment.name)}
                                          className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-md text-xs font-medium text-white transition-colors"
                                          title={t("Create Marketing Poster")}>
                                          <Wand2 className="h-3 w-3 mr-1" />
                                          {t("Create Poster")}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <Paperclip className="h-4 w-4 mr-2" />
                                      <a 
                                        href={attachment.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline text-sm">
                                        {attachment.name}
                                      </a>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-75 mt-2">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/95">
              <div className="flex space-x-2">
                {isRegularChat && (
                  <button className="p-2 bg-accent hover:bg-accent/80 rounded-lg border border-border transition-all duration-200">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`${t("Message")} ${isRegularChat ? selectedUserData?.name : selectedArtisanData?.artisan_name}...`}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                  onKeyPress={(e) => e.key === "Enter" && (isRegularChat ? sendMessage() : sendAdminMessage())}
                />
                <button
                  onClick={isRegularChat ? sendMessage : sendAdminMessage}
                  className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-lg">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Users List View
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t("Support Center")}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t("Manage artisan support conversations and provide business assistance")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("Search artisans by name or specialty...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">{t("Active Conversations")}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {artisanConversations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm text-muted-foreground">{t("Pending Support")}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {artisanConversations.reduce((sum, c) => sum + c.unread_count, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">{t("Responded Today")}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {artisanConversations.filter(c => c.last_sender === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-muted-foreground">{t("Support Status")}</p>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {t("Active")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Artisan Support Conversations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtisanConversations.map((conversation) => (
              <div
                key={conversation.artisan_id}
                onClick={() => setSelectedArtisan(conversation.artisan_id)}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                        <span className="text-primary font-semibold">
                          {conversation.artisan_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {conversation.artisan_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{conversation.artisan_email}</p>
                    </div>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        {conversation.unread_count}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-foreground text-sm line-clamp-2">
                    {conversation.last_message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatLastSeen(conversation.last_message_time)}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      conversation.last_sender === "admin"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    }`}>
                    {conversation.last_sender === "admin" ? t("Admin replied") : t("Needs response")}
                  </span>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
