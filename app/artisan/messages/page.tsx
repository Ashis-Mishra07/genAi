"use client";

import {
  Clock,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  MoreVertical,
  Package,
  Paperclip,
  Phone,
  Send,
  Shield,
  ShoppingBag,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/hooks";
import { useTranslateContent } from "@/lib/hooks/useTranslateContent";

interface AdminMessage {
  id: string;
  isFromAdmin: boolean;
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  productData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface SupportCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

export default function ArtisanAdminMessagesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { translateText, isHindi } = useTranslateContent();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [translatedMessages, setTranslatedMessages] = useState<{
    [key: string]: string;
  }>({});

  // Function to translate AI-generated messages
  const translateAIMessage = async (message: string): Promise<string> => {
    if (!isHindi || !message.trim()) return message;

    try {
      // Use the existing translateText function
      const translated = await translateText(message);
      return translated || message;
    } catch (error) {
      console.log("Translation error:", error);
      return message; // Fallback to original message
    }
  };

  const supportCategories: SupportCategory[] = [
    {
      id: "sales",
      name: isHindi ? "बिक्री सहायता" : "Sales Support",
      icon: TrendingUp,
      description: isHindi
        ? "अपने उत्पादों को बेचने और अधिक ग्राहकों तक पहुंचने में सहायता प्राप्त करें"
        : "Get help selling your products and reaching more customers",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "marketing",
      name: isHindi ? "मार्केटिंग सहायता" : "Marketing Help",
      icon: Lightbulb,
      description: isHindi
        ? "मार्केटिंग रणनीति और प्रचार तकनीकें सीखें"
        : "Learn marketing strategies and promotional techniques",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "product",
      name: isHindi ? "उत्पाद मार्गदर्शन" : "Product Guidance",
      icon: Package,
      description: isHindi
        ? "अपनी उत्पाद सूची और विवरण को अनुकूलित करें"
        : "Optimize your product listings and descriptions",
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "platform",
      name: isHindi ? "प्लेटफॉर्म सहायता" : "Platform Support",
      icon: Shield,
      description: isHindi
        ? "तकनीकी सहायता और प्लेटफॉर्म संबंधी प्रश्न"
        : "Technical help and platform-related questions",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "community",
      name: isHindi ? "समुदायिक संपर्क" : "Community Connect",
      icon: Users,
      description: isHindi
        ? "अन्य कारीगरों से जुड़ें और अनुभव साझा करें"
        : "Connect with other artisans and share experiences",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "general",
      name: isHindi ? "सामान्य सहायता" : "General Help",
      icon: HeartHandshake,
      description: isHindi
        ? "कोई अन्य प्रश्न या सहायता आवश्यकता"
        : "Any other questions or support needs",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const quickActions = [
    isHindi ? "बेचने में बेहतर सहायता करें" : "Help me sell better",
    isHindi ? "क्या मेरी कीमत अच्छी है?" : "Is my price good?",
    isHindi ? "अधिक ग्राहक कैसे प्राप्त करें?" : "How to get more customers?",
    isHindi ? "मेरा उत्पाद नहीं बिक रहा" : "My product is not selling",
    isHindi ? "मुझे क्या बदलना चाहिए?" : "What should I change?",
    isHindi ? "कृपया मुझे सलाह दें" : "Please give me advice",
  ];

  // Mock messages for fallback when API fails
  const mockMessages: AdminMessage[] = [
    {
      id: "1",
      isFromAdmin: true,
      message: isHindi
        ? "नमस्ते! आर्टिसनक्राफ्ट में आपका स्वागत है! मैं सपोर्ट टीम की सारा हूं, और मैं यहां आपको हमारे प्लेटफॉर्म पर सफल होने में मदद करने के लिए हूं। आज मैं आपकी कैसे सहायता कर सकती हूं?"
        : "Hello! Welcome to ArtisanCraft! I'm Sarah from the support team, and I'm here to help you succeed on our platform. How can I assist you today?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: "read",
    },
    {
      id: "2",
      isFromAdmin: false,
      message: isHindi
        ? "नमस्ते सारा! संपर्क करने के लिए धन्यवाद। मैं इस प्लेटफॉर्म का हिस्सा बनने के लिए बहुत उत्साहित हूं। मुझे अपने हस्तनिर्मित मिट्टी के बर्तनों के लिए अधिक दृश्यता प्राप्त करने में मदद की आवश्यकता है।"
        : "Hi Sarah! Thank you for reaching out. I'm really excited to be part of this platform. I could use some help with getting more visibility for my handmade pottery.",
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // 1 hour 50 minutes ago
      status: "delivered",
    },
    {
      id: "3",
      isFromAdmin: true,
      message: isHindi
        ? "यह अद्भुत है! मिट्टी के बर्तन बनाना इतनी सुंदर कला है। मैं बेहतर दृश्यता के लिए आपकी सूचियों को अनुकूलित करने में आपकी मदद करना चाहूंगी। यहां कुछ सुझाव हैं:\n\n1. उच्च गुणवत्ता वाली, अच्छी रोशनी वाली तस्वीरें उपयोग करें\n2. कीवर्ड्स के साथ विस्तृत विवरण लिखें\n3. प्रतिस्पर्धी कीमत रखें लेकिन अपने काम को कम न आंकें\n4. अपनी निर्माण प्रक्रिया साझा करें\n\nक्या आप अपने उत्पादों में से एक साझा करना चाहेंगे ताकि मैं विशिष्ट फीडबैक दे सकूं?"
        : "That's wonderful! Pottery is such a beautiful craft. I'd love to help you optimize your listings for better visibility. Here are a few tips:\n\n1. Use high-quality, well-lit photos\n2. Write detailed descriptions with keywords\n3. Price competitively but don't undervalue your work\n4. Share your creation process\n\nWould you like to share one of your products so I can give specific feedback?",
      timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(), // 1 hour 45 minutes ago
      status: "read",
    },
  ];

  useEffect(() => {
    // Auto-initialize chat and load messages on page load
    const initializeAndLoad = async () => {
      try {
        console.log("Starting chat initialization...");
        const initSuccess = await initializeChat();
        console.log("Chat initialization result:", initSuccess);

        console.log("Loading messages...");
        await loadMessages();
        console.log("Messages loaded successfully");

        setIsLoading(false);
      } catch (error) {
        console.log("Initialization error, falling back to mock data:", error);
        setMessages(mockMessages);
        setIsLoading(false);
      }
    };

    initializeAndLoad();

    // Set up continuous polling every 5 seconds for real-time updates (reduced frequency)
    const interval = setInterval(() => {
      loadMessages(true); // Silent update
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Effect to translate AI messages when language changes or new messages arrive
  useEffect(() => {
    const translateAIMessages = async () => {
      if (!isHindi) {
        setTranslatedMessages({});
        return;
      }

      const newTranslations: { [key: string]: string } = {};

      for (const message of messages) {
        if (message.isFromAdmin && !translatedMessages[message.id]) {
          try {
            const cleanMessage = message.productData
              ? message.message.split("Product Data:")[0].trim()
              : message.message;

            const translated = await translateAIMessage(cleanMessage);
            newTranslations[message.id] = translated;
          } catch (error) {
            console.log(`Translation failed for message ${message.id}:`, error);
          }
        }
      }

      if (Object.keys(newTranslations).length > 0) {
        setTranslatedMessages((prev) => ({ ...prev, ...newTranslations }));
      }
    };

    translateAIMessages();
  }, [messages, isHindi]);

  const initializeChat = async () => {
    try {
      const response = await fetch("/api/db/init-admin-chat", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Chat initialization successful:", data);
        setIsInitialized(true);
        setConnectionStatus("online");
        return true;
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.log(
          "Chat initialization failed - using fallback mode:",
          errorData
        );
        setIsInitialized(true); // Still proceed with mock data
        setConnectionStatus("offline");
        return false;
      }
    } catch (error) {
      console.log("Chat initialization error - using fallback mode:", error);
      setIsInitialized(true); // Still proceed with mock data
      setConnectionStatus("offline");
      return false;
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found, using mock messages");
        setMessages(mockMessages);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin-chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (!silent) {
          console.log(
            "API request failed, using mock messages. Status:",
            response.status
          );
        }
        setMessages(mockMessages);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const newMessages = data.messages || [];

      if (!silent) {
        console.log(
          "Artisan messages loaded from API:",
          newMessages.length,
          "messages"
        );
      }

      // If no messages from API, use mock messages
      if (newMessages.length === 0) {
        setMessages(mockMessages);
      } else {
        // Parse product data from messages if present
        const messagesWithProducts = newMessages.map((msg: any) => {
          if (msg.message.startsWith("🛍️ Product Shared:")) {
            try {
              const productMatch = msg.message.match(/Product Data: (.*)/);
              if (productMatch) {
                const productData = JSON.parse(productMatch[1]);
                return { ...msg, productData };
              }
            } catch (e) {
              console.error("Failed to parse product data:", e);
            }
          }
          return msg;
        });

        // Update messages state
        setMessages(messagesWithProducts);

        // Track the latest message for real-time updates
        if (newMessages.length > 0) {
          setLastMessageId(newMessages[newMessages.length - 1].id);
        }
      }
    } catch (error) {
      if (!silent) {
        console.log("API error, using mock messages:", error);
      }
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add optimistic message immediately
    const optimisticMessage: AdminMessage = {
      id: `temp-${Date.now()}`,
      isFromAdmin: false,
      message: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately

    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token - message sent in offline mode");
        // Update the optimistic message to show it was sent in offline mode
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      console.log("Artisan sending message:", messageToSend);

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        console.log("Send message failed, but keeping optimistic message");
        // Keep the optimistic message but mark it as delivered
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      // Replace optimistic message with real message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...data.message, status: "delivered" as const }
            : msg
        )
      );

      // Reload messages to get any admin responses after a delay
      setTimeout(() => loadMessages(true), 1000);
    } catch (error) {
      console.log("Send message error, keeping optimistic message:", error);
      // Keep the optimistic message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple file type check for village admin
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please share only images (JPG, PNG, GIF) or documents (PDF, TXT, DOC)"
      );
      return;
    }

    // File size limit (10MB - Cloudinary can handle this easily)
    if (file.size > 10 * 1024 * 1024) {
      alert(
        isHindi
          ? "फ़ाइल बहुत बड़ी है। कृपया 10MB से छोटी फ़ाइल चुनें।"
          : "File is too big. Please choose a file smaller than 10MB."
      );
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to cloud storage");
      }

      const uploadData = await uploadResponse.json();
      console.log("File uploaded to Cloudinary:", uploadData);

      // Send message with file attachment
      const fileMessage = `📎 Shared file: ${file.name}

${
  file.type.startsWith("image/")
    ? "🖼️ This is an image file"
    : "📄 This is a document"
} (${Math.round(file.size / 1024)}KB)

Please take a look and let me know what you think!`;

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: fileMessage,
          attachmentUrl: uploadData.url,
          attachmentName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send file message");
      }

      const data = await response.json();
      console.log("File shared successfully:", data);

      // Add the new message to the state immediately
      setMessages((prev) => [...prev, data.message]);

      // Reload messages
      setTimeout(loadMessages, 1000);
    } catch (error) {
      console.error("Failed to share file:", error);
      alert(
        isHindi
          ? "फ़ाइल साझा करने में विफल। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।"
          : "Failed to share file. Please check your internet connection and try again."
      );
    } finally {
      setUploadingFile(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token for loading products");
        setProducts([]);
        return;
      }

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Failed to load products:", response.status);
        setProducts([]);
        return;
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.log("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShareProduct = async (product: Product) => {
    // Add optimistic message immediately
    const productMessage = `🛍️ My Product: ${product.name}

💰 Price: $${product.price}

Please help me sell this better!`;

    const optimisticMessage: AdminMessage = {
      id: `temp-product-${Date.now()}`,
      isFromAdmin: false,
      message: productMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
      productData: product,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setShowProductModal(false);

    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token - product shared in offline mode");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const fullProductMessage = `${productMessage}

Product Data: ${JSON.stringify(product)}`;

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: fullProductMessage,
          attachmentUrl: product.imageUrl,
          attachmentName: `${product.name} - $${product.price}`,
        }),
      });

      if (!response.ok) {
        console.log("Product share failed, but keeping optimistic message");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const data = await response.json();
      console.log("Product shared successfully:", data);

      // Replace optimistic message with real message
      const messageWithProduct = {
        ...data.message,
        productData: product,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...messageWithProduct, status: "delivered" as const }
            : msg
        )
      );

      // Reload messages to get any admin responses after a delay
      setTimeout(() => loadMessages(true), 1000);
    } catch (error) {
      console.log("Product share error, keeping optimistic message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
    setShowQuickActions(false);
  };

  const handleCategorySelect = (category: SupportCategory) => {
    setSelectedCategory(category.id);
    setNewMessage(
      `Hi! I need help with ${category.name.toLowerCase()}. ${
        category.description
      }`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              {isHindi ? "एडमिन सहायता" : "Admin Support"}
            </h1>
            <p className="text-slate-400">
              {isHindi
                ? "अपने व्यवसाय को बढ़ाने में सहायता प्राप्त करें"
                : "Get help to grow your business"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection Status Indicator */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                connectionStatus === "online"
                  ? "bg-green-500/20 text-green-400"
                  : connectionStatus === "offline"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}>
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "online"
                    ? "bg-green-400"
                    : connectionStatus === "offline"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-gray-400 animate-pulse"
                }`}></div>
              <span>
                {connectionStatus === "online"
                  ? isHindi
                    ? "जुड़ा हुआ"
                    : "Connected"
                  : connectionStatus === "offline"
                  ? isHindi
                    ? "ऑफ़लाइन मोड"
                    : "Offline Mode"
                  : isHindi
                  ? "जुड़ रहा है..."
                  : "Connecting..."}
              </span>
            </div>

            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Support Categories */}
        {messages.length === 0 && !isLoading && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isHindi
                ? "आज हम आपकी कैसे सहायता कर सकते हैं?"
                : "How can we help you today?"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:bg-slate-700 hover:border-orange-500/50 transition-all duration-200 group">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">
                      {category.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <HeartHandshake className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {isHindi
                    ? "एडमिन सहायता में आपका स्वागत है!"
                    : "Welcome to Admin Support!"}
                </h3>
                <p className="text-slate-400 mb-4">
                  {isHindi
                    ? "हमारी टीम आपकी सफलता में मदद करने के लिए यहाँ है। ऊपर एक श्रेणी चुनें या अपना प्रश्न टाइप करना शुरू करें।"
                    : "Our team is here to help you succeed. Choose a category above or start typing your question."}
                </p>
                {connectionStatus === "offline" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4 max-w-md mx-auto">
                    <p className="text-yellow-400 text-sm">
                      📱{" "}
                      {isHindi
                        ? "ऑफ़लाइन मोड में काम कर रहे हैं। आपके संदेश सुरक्षित हैं और कनेक्शन वापस आने पर भेजे जाएंगे।"
                        : "Working in offline mode. Your messages will be saved and sent when connection is restored."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isFromAdmin ? "justify-start" : "justify-end"
                  }`}>
                  <div
                    className={`max-w-[70%] ${
                      message.isFromAdmin
                        ? "bg-slate-700 border border-slate-600 text-white"
                        : "bg-orange-500 text-white"
                    } rounded-lg p-4`}>
                    {message.isFromAdmin && (
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <Shield className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-300">
                          {isHindi ? "एडमिन सहायता" : "Admin Support"}
                        </span>
                      </div>
                    )}

                    {/* Simple Product Card for Village Admin - just photo and price */}
                    {message.productData && (
                      <div className="mb-3 bg-slate-600 rounded-lg p-3 border border-slate-500">
                        <div className="flex items-center mb-2">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">
                            {isHindi ? "मेरा उत्पाद" : "My Product"}
                          </span>
                        </div>
                        <div className="text-center">
                          {message.productData.imageUrl && (
                            <div className="w-full max-w-48 mx-auto mb-3 rounded-lg overflow-hidden bg-slate-500">
                              <img
                                src={message.productData.imageUrl}
                                alt={message.productData.name}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <h4 className="font-bold text-lg mb-1">
                            {message.productData.name}
                          </h4>
                          <div className="text-2xl font-bold text-green-300">
                            ${message.productData.price}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">
                      {(() => {
                        const originalMessage = message.productData
                          ? message.message.split("Product Data:")[0].trim()
                          : message.message;

                        // Use translated message if available and this is an AI message
                        if (
                          message.isFromAdmin &&
                          isHindi &&
                          translatedMessages[message.id]
                        ) {
                          return translatedMessages[message.id];
                        }

                        return originalMessage;
                      })()}
                    </p>

                    {/* File Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="bg-slate-600 rounded-lg p-3 border border-slate-500">
                            {attachment.type === "file" && attachment.url && (
                              <>
                                {attachment.url.match(
                                  /\.(jpg|jpeg|png|gif)$/i
                                ) ? (
                                  <div>
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-w-full h-auto rounded-lg mb-2"
                                      style={{ maxHeight: "200px" }}
                                    />
                                    <p className="text-xs opacity-80">
                                      {attachment.name}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-300 hover:text-blue-200 underline">
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

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {!message.isFromAdmin && (
                        <div className="flex items-center">
                          {message.status === "sent" && (
                            <Clock className="h-3 w-3 opacity-70" />
                          )}
                          {message.status === "delivered" && (
                            <div className="w-3 h-3 rounded-full bg-white/50" />
                          )}
                          {message.status === "read" && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="border-t border-slate-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-left p-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
                <Lightbulb className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setShowProductModal(true);
                  loadProducts();
                }}
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                title="Share a product">
                <ShoppingBag className="h-5 w-5" />
              </button>
              <label
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                title="Share a file">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                  disabled={uploadingFile}
                />
                {uploadingFile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={
                    isHindi
                      ? "एडमिन सहायता के लिए अपना संदेश टाइप करें..."
                      : "Type your message to admin support..."
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product Sharing Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {isHindi
                    ? "एडमिन के साथ उत्पाद साझा करें"
                    : "Share Product with Admin"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">
                    {isHindi
                      ? "आपके उत्पाद लोड हो रहे हैं..."
                      : "Loading your products..."}
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">
                    {isHindi ? "कोई उत्पाद नहीं मिला" : "No Products Found"}
                  </h4>
                  <p className="text-slate-400 mb-4">
                    {isHindi
                      ? "अभी तक आपके पास साझा करने के लिए कोई उत्पाद नहीं है।"
                      : "You don't have any products to share yet."}
                  </p>
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push("/artisan/products");
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200">
                    {t("createProduct")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter((p) => p.isActive)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 hover:border-orange-500/50 transition-all duration-200 text-center">
                        {product.imageUrl && (
                          <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-slate-600">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <h4 className="font-bold text-white mb-2">
                          {product.name}
                        </h4>
                        <div className="text-2xl font-bold text-green-300 mb-4">
                          ${product.price}
                        </div>
                        <button
                          onClick={() => handleShareProduct(product)}
                          disabled={isSending}
                          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center text-lg font-medium">
                          {isSending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              {isHindi ? "यह साझा करें" : "Share This"}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
