"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  MailOpen,
  Search,
  Clock,
  Star,
  Reply,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  isRead: boolean;
  isImportant: boolean;
  productId?: string;
  productName?: string;
  createdAt: string;
  repliedAt?: string;
  status: "new" | "replied" | "pending" | "closed";
}

export default function ArtisanFeedbackPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // TODO: Replace with actual API call
        const mockMessages: Message[] = [
          {
            id: "1",
            customerName: "Sarah Johnson",
            customerEmail: "sarah@email.com",
            subject: "Question about custom pottery",
            message: "Hi! I saw your beautiful ceramic bowls and I'm interested in commissioning a custom set for my kitchen. Could you tell me more about your process and pricing?",
            isRead: false,
            isImportant: true,
            productId: "p1",
            productName: "Ceramic Bowl Set",
            createdAt: "2024-01-15T10:30:00Z",
            status: "new",
          },
          {
            id: "2",
            customerName: "Michael Chen",
            customerEmail: "michael@email.com",
            subject: "Shipping inquiry",
            message: "Hello, I ordered a handwoven scarf last week. Can you provide an update on the shipping status?",
            isRead: true,
            isImportant: false,
            productId: "p2",
            productName: "Handwoven Wool Scarf",
            createdAt: "2024-01-14T14:20:00Z",
            repliedAt: "2024-01-14T16:45:00Z",
            status: "replied",
          },
          {
            id: "3",
            customerName: "Emma Williams",
            customerEmail: "emma@email.com",
            subject: "Custom jewelry request",
            message: "I'm looking for a custom engagement ring. Do you work with specific gemstones provided by the customer?",
            isRead: true,
            isImportant: true,
            createdAt: "2024-01-13T09:15:00Z",
            status: "pending",
          },
          {
            id: "4",
            customerName: "David Brown",
            customerEmail: "david@email.com",
            subject: "Workshop inquiry",
            message: "Do you offer any pottery workshops? I'd love to learn from you!",
            isRead: true,
            isImportant: false,
            createdAt: "2024-01-12T11:45:00Z",
            repliedAt: "2024-01-12T13:30:00Z",
            status: "closed",
          },
        ];

        setMessages(mockMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Helper functions to get translated message content
  const getMessageSubject = useCallback((message: Message) => {
    switch (message.subject) {
      case "Question about custom pottery":
        return t("sampleSubject1");
      case "Shipping inquiry":
        return t("sampleSubject2");
      case "Custom jewelry request":
        return t("sampleSubject3");
      case "Workshop inquiry":
        return t("sampleSubject4");
      default:
        return message.subject;
    }
  }, [t]);

  const getMessageText = useCallback((message: Message) => {
    if (message.message === "Hi! I saw your beautiful ceramic bowls and I'm interested in commissioning a custom set for my kitchen. Could you tell me more about your process and pricing?") {
      return t("sampleMessage1");
    }
    if (message.message === "Hello, I ordered a handwoven scarf last week. Can you provide an update on the shipping status?") {
      return t("sampleMessage2");
    }
    if (message.message === "I'm looking for a custom engagement ring. Do you work with specific gemstones provided by the customer?") {
      return t("sampleMessage3");
    }
    if (message.message === "Do you offer any pottery workshops? I'd love to learn from you!") {
      return t("sampleMessage4");
    }
    return message.message;
  }, [t]);

  const getProductName = useCallback((productName: string | undefined) => {
    if (!productName) return productName;
    switch (productName) {
      case "Ceramic Bowl Set":
        return t("sampleProduct1");
      case "Handwoven Wool Scarf":
        return t("sampleProduct2");
      default:
        return productName;
    }
  }, [t]);

  const filteredMessages = messages.filter((message) => {
    const translatedSubject = getMessageSubject(message);
    const translatedMessage = getMessageText(message);
    const translatedProductName = getProductName(message.productName);
    
    const matchesSearch =
      message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translatedSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translatedMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (translatedProductName && translatedProductName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "replied":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "closed":
        return "bg-muted/20 text-muted-foreground border border-border";
      default:
        return "bg-muted/20 text-muted-foreground border border-border";
    }
  };

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "new":
        return t("new");
      case "replied":
        return t("replied");
      case "pending":
        return t("pending");
      case "closed":
        return t("closed");
      default:
        return status;
    }
  }, [t]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-3 w-3" />;
      case "replied":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "closed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg))
    );
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      // TODO: Implement actual reply API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === selectedMessage.id
            ? { ...msg, status: "replied", repliedAt: new Date().toISOString() }
            : msg
        )
      );

      setShowReplyModal(false);
      setReplyMessage("");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">{t("loadingMessages")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/artisan/dashboard")}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("backToDashboard")}
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("customerFeedback")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0
                  ? unreadCount === 1 
                    ? `1 ${t("unreadFeedback")}`
                    : `${unreadCount} ${t("unreadFeedbacks")}`
                  : t("allCaughtUp")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl shadow-sm">
              {/* Search and Filter */}
              <div className="p-6 border-b border-border">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("searchFeedback")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                  <option value="all" className="bg-background">
                    {t("allFeedback")}
                  </option>
                  <option value="new" className="bg-background">
                    {t("new")}
                  </option>
                  <option value="replied" className="bg-background">
                    {t("replied")}
                  </option>
                  <option value="pending" className="bg-background">
                    {t("pending")}
                  </option>
                  <option value="closed" className="bg-background">
                    {t("closed")}
                  </option>
                </select>
              </div>

              {/* Messages List */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>
                      {t("noMessagesFound")}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.isRead) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? "bg-primary/20 border-l-4 border-l-primary"
                          : ""
                      } ${!message.isRead ? "bg-blue-500/20" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {!message.isRead ? (
                              <Mail className="h-4 w-4 text-blue-400 mr-2" />
                            ) : (
                              <MailOpen className="h-4 w-4 text-muted-foreground mr-2" />
                            )}
                            {message.isImportant && (
                              <Star className="h-4 w-4 text-yellow-500 mr-2" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              !message.isRead ? "text-card-foreground" : "text-muted-foreground"
                            }`}>
                            {message.customerName}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              message.status
                            )}`}>
                            {getStatusIcon(message.status)}
                            <span className="ml-1">
                              {getStatusText(message.status)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <h3
                        className={`text-sm mb-1 ${
                          !message.isRead
                            ? "font-semibold text-card-foreground"
                            : "text-muted-foreground"
                        }`}>
                        {getMessageSubject(message)}
                      </h3>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {getMessageText(message)}
                      </p>

                      {message.productName && (
                        <div className="text-xs text-primary mb-2">
                          {t("about")}: {getProductName(message.productName)}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                        <Clock className="h-3 w-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-card backdrop-blur-sm rounded-lg border border-border">
                {/* Message Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium mr-3">
                        {selectedMessage.customerName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-card-foreground">
                          {selectedMessage.customerName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedMessage.customerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedMessage.status
                        )}`}>
                        {getStatusIcon(selectedMessage.status)}
                        <span className="ml-1">
                          {getStatusText(selectedMessage.status)}
                        </span>
                      </span>

                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      {getMessageSubject(selectedMessage)}
                    </h3>
                    {selectedMessage.productName && (
                      <div className="flex items-center text-sm text-primary mb-2">
                        <span>
                          {t("regarding")}: {getProductName(selectedMessage.productName)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                      {selectedMessage.repliedAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>
                            {t("replied")} {new Date(selectedMessage.repliedAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-card-foreground whitespace-pre-wrap">
                      {getMessageText(selectedMessage)}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <button
                      onClick={() => setShowReplyModal(true)}
                      className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200">
                      <Reply className="h-4 w-4 mr-2" />
                      {t("reply")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card backdrop-blur-sm rounded-lg border border-border p-12 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  {t("selectFeedback")}
                </h3>
                <p className="text-muted-foreground">
                  {t("selectFeedbackDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">
                {t("replyTo")} {selectedMessage.customerName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Re: {selectedMessage.subject}
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                placeholder={t("typeYourReply")}
              />
            </div>

            <div className="p-6 border-t border-border flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage("");
                }}
                className="px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors">
                {t("cancel")}
              </button>

              <button
                onClick={handleReply}
                disabled={isReplying || !replyMessage.trim()}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isReplying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                ) : (
                  <Reply className="h-4 w-4 mr-2" />
                )}
                {isReplying ? t("sending") : t("sendReply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
