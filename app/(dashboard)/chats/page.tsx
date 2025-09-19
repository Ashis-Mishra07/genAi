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
} from "lucide-react";

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
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to connect to chat service");
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
        return "Now";
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.log("Error parsing timestamp:", timestamp, error);
      return "Now";
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUserData = users.find((user) => user.id === selectedUser);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    // Individual Chat View
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button Header */}
          <div className="mb-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Chats</span>
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedUserData?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(
                    selectedUserData?.status || "OFFLINE"
                  )}`}></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                  {selectedUserData?.name}
                </h1>
                <p className="text-orange-400">{selectedUserData?.specialty}</p>
                <p className="text-gray-400 text-sm">
                  {selectedUserData?.location}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full w-32"></div>
          </div>

          {/* Chat Container */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-xl border border-orange-500/20 h-[70vh] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm flex items-center space-x-1 ${
                      selectedUserData?.status === "ONLINE"
                        ? "text-green-400"
                        : selectedUserData?.status === "AWAY"
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}>
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        selectedUserData?.status || "OFFLINE"
                      )}`}></div>
                    <span>{selectedUserData?.status.toLowerCase()}</span>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-all duration-200">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </button>
                  <button className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg border border-pink-500/30 transition-all duration-200">
                    <Instagram className="h-4 w-4 text-pink-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
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
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : message.messageType === "SYSTEM"
                        ? "bg-gradient-to-r from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-purple-300"
                        : "bg-gray-700 text-white"
                    } rounded-lg p-3 shadow-lg`}>
                    {message.messageType === "TEXT" && message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {message.messageType === "IMAGE" && (
                      <div className="space-y-2">
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-600 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-500">
                            {message.imageUrl ? (
                              <img
                                src={message.imageUrl}
                                alt="Shared image"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">
                                  Artwork Image
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
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-all duration-200">
                  <Camera className="h-4 w-4 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUserData?.name}...`}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 shadow-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              Artisan Chats
            </h1>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full w-32"></div>
          <p className="text-gray-400 mt-2">
            Chat with artisans and manage their artwork enhancement requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artisans by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-400 font-medium">
                Online: {users.filter((u) => u.status === "ONLINE").length}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400 font-medium">
                Away: {users.filter((u) => u.status === "AWAY").length}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium">
                Total Unread: {users.reduce((sum, u) => sum + u.unreadCount, 0)}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400 font-medium">
                Total Artisans: {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer group hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:from-orange-400 group-hover:to-orange-500 transition-all duration-300">
                      <span className="text-white font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(
                        user.status
                      )}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg group-hover:text-orange-300 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-orange-400 text-sm">{user.specialty}</p>
                    <p className="text-gray-400 text-xs">{user.location}</p>
                  </div>
                </div>
                {user.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[24px] text-center font-medium">
                    {user.unreadCount}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <p className="text-gray-300 text-sm line-clamp-2">
                  {user.lastMessage}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatLastSeen(user.lastSeen)}</span>
                <span
                  className={`px-2 py-1 rounded-full ${
                    user.status === "ONLINE"
                      ? "bg-green-500/20 text-green-400"
                      : user.status === "AWAY"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}>
                  {user.status.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
