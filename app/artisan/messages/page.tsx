"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Shield,
  HeartHandshake,
  Lightbulb,
  TrendingUp,
  Package,
  Users,
  Clock,
  ShoppingBag,
  Image,
  DollarSign,
  Tag,
  X,
} from "lucide-react";

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

  const supportCategories: SupportCategory[] = [
    {
      id: "sales",
      name: "Sales Support",
      icon: TrendingUp,
      description: "Get help selling your products and reaching more customers",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "marketing",
      name: "Marketing Help",
      icon: Lightbulb,
      description: "Learn marketing strategies and promotional techniques",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "product",
      name: "Product Guidance",
      icon: Package,
      description: "Optimize your product listings and descriptions",
      color: "from-purple-500 to-violet-500"
    },
    {
      id: "platform",
      name: "Platform Support",
      icon: Shield,
      description: "Technical help and platform-related questions",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "community",
      name: "Community Connect",
      icon: Users,
      description: "Connect with other artisans and share experiences",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "general",
      name: "General Help",
      icon: HeartHandshake,
      description: "Any other questions or support needs",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const quickActions = [
    "Help me sell better",
    "Is my price good?",
    "How to get more customers?",
    "My product is not selling",
    "What should I change?",
    "Please give me advice"
  ];

  useEffect(() => {
    // Auto-initialize chat and load messages on page load
    const initializeAndLoad = async () => {
      try {
        await initializeChat();
        await loadMessages();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setIsLoading(false);
      }
    };

    initializeAndLoad();
    
    // Set up continuous polling every 2 seconds for real-time updates
    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const initializeChat = async () => {
    try {
      const response = await fetch("/api/db/init-admin-chat", {
        method: "POST",
      });
      
      if (response.ok) {
        setIsInitialized(true);
      } else {
        console.error("Failed to initialize chat");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/admin-chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      const newMessages = data.messages || [];
      
      console.log('Artisan messages loaded:', newMessages);
      
      // Parse product data from messages if present
      const messagesWithProducts = newMessages.map((msg: any) => {
        if (msg.message.startsWith('🛍️ Product Shared:')) {
          try {
            const productMatch = msg.message.match(/Product Data: (.*)/);
            if (productMatch) {
              const productData = JSON.parse(productMatch[1]);
              return { ...msg, productData };
            }
          } catch (e) {
            console.error('Failed to parse product data:', e);
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
      
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      console.log('Artisan sending message:', newMessage);

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log('Artisan message sent successfully:', data);
      
      // Add the new message to the state immediately for better UX
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
      
      // Reload messages to get any admin responses
      setTimeout(loadMessages, 1000);

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple file type check for village admin
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please share only images (JPG, PNG, GIF) or documents (PDF, TXT, DOC)');
      return;
    }

    // File size limit (10MB - Cloudinary can handle this easily)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too big. Please choose a file smaller than 10MB.');
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
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to cloud storage');
      }

      const uploadData = await uploadResponse.json();
      console.log('File uploaded to Cloudinary:', uploadData);

      // Send message with file attachment
      const fileMessage = `📎 Shared file: ${file.name}

${file.type.startsWith('image/') ? '🖼️ This is an image file' : '📄 This is a document'} (${Math.round(file.size / 1024)}KB)

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
      console.log('File shared successfully:', data);
      
      // Add the new message to the state immediately
      setMessages(prev => [...prev, data.message]);
      
      // Reload messages
      setTimeout(loadMessages, 1000);

    } catch (error) {
      console.error("Failed to share file:", error);
      alert('Failed to share file. Please check your internet connection and try again.');
    } finally {
      setUploadingFile(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShareProduct = async (product: Product) => {
    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      // Simple message for village admin - just photo and price
      const productMessage = `🛍️ My Product: ${product.name}

 Price: $${product.price}

Please help me sell this better!

Product Data: ${JSON.stringify(product)}`;

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: productMessage,
          attachmentUrl: product.imageUrl,
          attachmentName: `${product.name} - $${product.price}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share product");
      }

      const data = await response.json();
      console.log('Product shared successfully:', data);
      
      // Add the product data to the message
      const messageWithProduct = {
        ...data.message,
        productData: product
      };
      
      setMessages(prev => [...prev, messageWithProduct]);
      setShowProductModal(false);
      
      // Reload messages to get any admin responses
      setTimeout(loadMessages, 1000);

    } catch (error) {
      console.error("Failed to share product:", error);
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
    setNewMessage(`Hi! I need help with ${category.name.toLowerCase()}. ${category.description}`);
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
              Admin Support
            </h1>
            <p className="text-slate-400">Get help to grow your business</p>
          </div>
          <div className="flex items-center space-x-2">
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
            <h3 className="text-lg font-semibold text-white mb-4">How can we help you today?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:bg-slate-700 hover:border-orange-500/50 transition-all duration-200 group">
                    <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">{category.name}</h4>
                    <p className="text-sm text-slate-400">{category.description}</p>
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
                <h3 className="text-lg font-medium text-white mb-2">Welcome to Admin Support!</h3>
                <p className="text-slate-400 mb-4">Our team is here to help you succeed. Choose a category above or start typing your question.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromAdmin ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] ${
                    message.isFromAdmin
                      ? "bg-slate-700 border border-slate-600 text-white"
                      : "bg-orange-500 text-white"
                  } rounded-lg p-4`}>
                    {message.isFromAdmin && (
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <Shield className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-300">Admin Support</span>
                      </div>
                    )}
                    
                    {/* Simple Product Card for Village Admin - just photo and price */}
                    {message.productData && (
                      <div className="mb-3 bg-slate-600 rounded-lg p-3 border border-slate-500">
                        <div className="flex items-center mb-2">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">My Product</span>
                        </div>
                        <div className="text-center">
                          {message.productData.imageUrl && (
                            <div className="w-full max-w-48 mx-auto mb-3 rounded-lg overflow-hidden bg-slate-500">
                              <img 
                                src={message.productData.imageUrl} 
                                alt={message.productData.name}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <h4 className="font-bold text-lg mb-1">{message.productData.name}</h4>
                          <div className="text-2xl font-bold text-green-300">${message.productData.price}</div>
                        </div>
                      </div>
                    )}
                    
                    <p className="whitespace-pre-wrap">{message.productData ? 
                      message.message.split('Product Data:')[0].trim() : 
                      message.message
                    }</p>

                    {/* File Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="bg-slate-600 rounded-lg p-3 border border-slate-500">
                            {attachment.type === 'file' && attachment.url && (
                              <>
                                {attachment.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                  <div>
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.name}
                                      className="max-w-full h-auto rounded-lg mb-2"
                                      style={{ maxHeight: '200px' }}
                                    />
                                    <p className="text-xs opacity-80">{attachment.name}</p>
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
                          {message.status === "sent" && <Clock className="h-3 w-3 opacity-70" />}
                          {message.status === "delivered" && <div className="w-3 h-3 rounded-full bg-white/50" />}
                          {message.status === "read" && <div className="w-3 h-3 rounded-full bg-white" />}
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
              <label className="p-2 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer" title="Share a file">
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
                  placeholder="Type your message to admin support..."
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
                <h3 className="text-xl font-bold text-white">Share Product with Admin</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">Loading your products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">No Products Found</h4>
                  <p className="text-slate-400 mb-4">You don't have any products to share yet.</p>
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push('/artisan/products');
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200">
                    Create Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.filter(p => p.isActive).map((product) => (
                    <div key={product.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 hover:border-orange-500/50 transition-all duration-200 text-center">
                      {product.imageUrl && (
                        <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-slate-600">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-white mb-2">{product.name}</h4>
                      <div className="text-2xl font-bold text-green-300 mb-4">${product.price}</div>
                      <button
                        onClick={() => handleShareProduct(product)}
                        disabled={isSending}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center text-lg font-medium">
                        {isSending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Share This
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