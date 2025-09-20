'use client';

import {
    AlertCircle,
    ArrowLeft,
    Bot,
    CheckCircle,
    ChevronDown, ChevronUp,
    Clock,
    ExternalLink, FileText,
    Headphones,
    HelpCircle,
    Mail,
    Package,
    Phone,
    RefreshCw,
    Send,
    Star,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

const faqData = [
  {
    id: 1,
    question: "How do I track my order?",
    answer: "You can track your order by going to the 'Orders' section in your dashboard or by clicking the 'Track My Order' button below. You'll receive email updates at each stage of delivery."
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Handcrafted custom items may have different return terms. Please contact the artisan directly for custom orders."
  },
  {
    id: 3,
    question: "How can I contact an artisan directly?",
    answer: "You can contact artisans through their product pages using the 'Message Artisan' button, or through the order details page if you've already purchased from them."
  },
  {
    id: 4,
    question: "How long does shipping take?",
    answer: "Shipping typically takes 5-7 business days for standard delivery and 2-3 days for express delivery. Custom handcrafted items may take additional processing time."
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are secured with 256-bit SSL encryption."
  },
  {
    id: 6,
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel orders within 2 hours of placement if the status is still 'pending'. After that, please contact our support team for assistance."
  }
];

export default function CustomerHelpPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'ai' | 'faq' | 'contact' | 'tickets' | 'refund'>('ai');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi there! I'm your AI shopping assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [refundForm, setRefundForm] = useState({
    orderId: '',
    reason: 'damaged_product',
    amount: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    ticketId: '',
    refundId: '',
    customerEmail: '',
    rating: 0,
    feedback: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch support tickets when tickets section is active
  useEffect(() => {
    if (activeSection === 'tickets') {
      fetchSupportTickets();
    }
  }, [activeSection]);

  const fetchSupportTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch('/api/support/ticket?limit=5');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentTickets(data.tickets);
        }
      } else {
        console.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Placeholder functions for backend integration
  const sendSupportEmail = async () => {
    setIsSubmittingEmail(true);
    try {
      // TODO: Integrate with email API
      const response = await fetch('/api/support/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm)
      });
      
      if (response.ok) {
        alert('Support email sent successfully! We\'ll get back to you within 24 hours.');
        setSupportForm({ name: '', email: '', subject: '', message: '', priority: 'medium' });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Failed to send email. Please try again later.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const createSupportTicket = async () => {
    setIsSubmittingTicket(true);
    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Support ticket created successfully! Ticket ID: ${result.ticketId}`);
        setTicketForm({ subject: '', category: 'general', priority: 'medium', description: '', customerName: '', customerEmail: '', customerPhone: '' });
        // Refresh tickets if we're on the tickets section
        if (activeSection === 'tickets') {
          fetchSupportTickets();
        }
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Ticket creation error:', error);
      alert('Failed to create ticket. Please try again later.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const submitRefundRequest = async () => {
    setIsSubmittingRefund(true);
    try {
      const response = await fetch('/api/support/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...refundForm,
          amount: parseFloat(refundForm.amount) || 0
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Refund request submitted successfully! Request ID: ${result.refundId}`);
        setRefundForm({ orderId: '', reason: 'damaged_product', amount: '', customerName: '', customerEmail: '', customerPhone: '', description: '', priority: 'medium' });
      } else {
        throw new Error('Failed to submit refund request');
      }
    } catch (error) {
      console.error('Refund request error:', error);
      alert('Failed to submit refund request. Please try again later.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const submitRating = async () => {
    try {
      const response = await fetch('/api/support/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Thank you for your feedback!');
        setShowRatingModal(false);
        setRatingData({ ticketId: '', refundId: '', customerEmail: '', rating: 0, feedback: '' });
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const openRatingModal = (ticketId?: string, refundId?: string) => {
    setRatingData({
      ticketId: ticketId || '',
      refundId: refundId || '',
      customerEmail: supportForm.email || ticketForm.customerEmail || refundForm.customerEmail || '',
      rating: 0,
      feedback: ''
    });
    setShowRatingModal(true);
  };

  const callAIHelpAssistant = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/support/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response.message,
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);

        // Add suggestions as quick reply buttons (optional)
        if (data.response.suggestions && data.response.suggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              text: "Here are some related topics you might want to explore:\n• " + data.response.suggestions.join('\n• '),
              sender: 'ai',
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, suggestionMessage]);
          }, 1000);
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('AI assistant error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again or contact our human support team for immediate assistance.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') && lowerMessage.includes('track')) {
      return "I can help you track your order! Please go to the 'Orders' section in your dashboard, or I can direct you there. Do you have your order number handy?";
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "Our return policy allows returns within 30 days of delivery. Items must be in original condition. Would you like me to help you start a return process or connect you with our support team?";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('charge')) {
      return "For payment-related issues, I recommend checking your order details first. If there's a discrepancy, I can help you contact our billing support team directly.";
    } else if (lowerMessage.includes('artisan') || lowerMessage.includes('seller')) {
      return "You can contact artisans directly through their product pages or order details. Each artisan has their own messaging system for direct communication.";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return "Standard shipping takes 5-7 business days, express takes 2-3 days. Custom items may take longer. Would you like to check a specific order's shipping status?";
    } else {
      return "I understand you need help with that. Let me connect you with the right resources. You can also browse our FAQ section below or contact our human support team for more detailed assistance.";
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      callAIHelpAssistant(currentMessage.trim());
    }
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      case 'closed': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <HelpCircle className="h-8 w-8 text-orange-500 mr-3" />
                Need Help?
              </h1>
              <p className="text-slate-400">Get support and find answers to your questions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-700 rounded-lg px-3 py-2">
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">Support Center</p>
              <p className="text-xs text-slate-400">24/7 Available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/customer/orders')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <Package className="h-8 w-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Track My Order</h3>
            <p className="text-blue-100 text-sm">Check status and delivery updates</p>
          </button>

          <button
            onClick={() => setActiveSection('refund')}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-left hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <RefreshCw className="h-8 w-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Request Refund</h3>
            <p className="text-green-100 text-sm">Start return or refund process</p>
          </button>

          <button
            onClick={() => setActiveSection('contact')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-left hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <Headphones className="h-8 w-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white">Contact Support</h3>
            <p className="text-purple-100 text-sm">Get direct help from our team</p>
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-8 max-w-md">
          {[
            { key: 'ai', label: 'AI Assistant', icon: Bot },
            { key: 'faq', label: 'FAQ', icon: HelpCircle },
            { key: 'contact', label: 'Contact', icon: Mail },
            { key: 'tickets', label: 'Tickets', icon: FileText },
            { key: 'refund', label: 'Refund', icon: RefreshCw }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* AI Assistant Section */}
            {activeSection === 'ai' && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 h-[600px] flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Shopping Assistant</h3>
                      <p className="text-slate-400 text-sm">Ask me anything about your orders, products, or policies</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-slate-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-slate-400 ml-2">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your question here..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isAiTyping}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <HelpCircle className="h-6 w-6 text-orange-500 mr-3" />
                    Frequently Asked Questions
                  </h3>
                  <p className="text-slate-400 mt-2">Find quick answers to common questions</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {faqData.map((faq) => (
                      <div key={faq.id} className="border border-slate-700 rounded-lg">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700 transition-colors"
                        >
                          <h4 className="font-medium text-white">{faq.question}</h4>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="px-4 pb-4">
                            <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                {/* Email Support */}
                <div className="bg-slate-800 rounded-lg border border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <Mail className="h-6 w-6 text-orange-500 mr-3" />
                      Send Support Email
                    </h3>
                    <p className="text-slate-400 mt-2">Get help directly from our support team</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Name</label>
                        <input
                          type="text"
                          value={supportForm.name}
                          onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Email</label>
                        <input
                          type="email"
                          value={supportForm.email}
                          onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Subject</label>
                        <input
                          type="text"
                          value={supportForm.subject}
                          onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Brief description of your issue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Priority</label>
                        <select
                          value={supportForm.priority}
                          onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value as any })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-2">Message</label>
                      <textarea
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Describe your issue in detail..."
                      />
                    </div>

                    <button
                      onClick={sendSupportEmail}
                      disabled={isSubmittingEmail || !supportForm.email || !supportForm.subject || !supportForm.message}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isSubmittingEmail ? (
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Email
                    </button>
                  </div>
                </div>

                {/* Ticket Creation */}
                <div className="bg-slate-800 rounded-lg border border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FileText className="h-6 w-6 text-orange-500 mr-3" />
                      Raise Support Ticket
                    </h3>
                    <p className="text-slate-400 mt-2">Create a trackable support ticket</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Subject</label>
                        <input
                          type="text"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Ticket subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Category</label>
                        <select
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="general">General Support</option>
                          <option value="orders">Order Issues</option>
                          <option value="payments">Payment Problems</option>
                          <option value="technical">Technical Issues</option>
                          <option value="returns">Returns & Refunds</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white mb-2">Priority</label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Your Name</label>
                        <input
                          type="text"
                          value={ticketForm.customerName}
                          onChange={(e) => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Email</label>
                        <input
                          type="email"
                          value={ticketForm.customerEmail}
                          onChange={(e) => setTicketForm({ ...ticketForm, customerEmail: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={ticketForm.customerPhone}
                          onChange={(e) => setTicketForm({ ...ticketForm, customerPhone: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-white mb-2">Description</label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Detailed description of your issue..."
                      />
                    </div>

                    <button
                      onClick={createSupportTicket}
                      disabled={isSubmittingTicket || !ticketForm.subject || !ticketForm.description}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                    >
                      {isSubmittingTicket ? (
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Create Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Section */}
            {activeSection === 'refund' && (
              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <RefreshCw className="h-6 w-6 text-orange-500 mr-3" />
                    Request Refund
                  </h3>
                  <p className="text-slate-400 mt-2">Submit a refund request for your order</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Order ID</label>
                      <input
                        type="text"
                        value={refundForm.orderId}
                        onChange={(e) => setRefundForm({ ...refundForm, orderId: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="ORD-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Refund Amount (₹)</label>
                      <input
                        type="number"
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Reason for Refund</label>
                      <select
                        value={refundForm.reason}
                        onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="damaged_product">Damaged Product</option>
                        <option value="wrong_item">Wrong Item Received</option>
                        <option value="not_as_described">Not as Described</option>
                        <option value="defective">Defective Product</option>
                        <option value="late_delivery">Late Delivery</option>
                        <option value="changed_mind">Changed Mind</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Priority</label>
                      <select
                        value={refundForm.priority}
                        onChange={(e) => setRefundForm({ ...refundForm, priority: e.target.value as any })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Your Name</label>
                      <input
                        type="text"
                        value={refundForm.customerName}
                        onChange={(e) => setRefundForm({ ...refundForm, customerName: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input
                        type="email"
                        value={refundForm.customerEmail}
                        onChange={(e) => setRefundForm({ ...refundForm, customerEmail: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={refundForm.customerPhone}
                        onChange={(e) => setRefundForm({ ...refundForm, customerPhone: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      value={refundForm.description}
                      onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Please provide details about why you're requesting a refund..."
                    />
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-2">📋 Refund Process Information</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Refund requests are typically processed within 2-3 business days</li>
                      <li>• You'll receive email and SMS updates on your request status</li>
                      <li>• Approved refunds are credited within 5-7 business days</li>
                      <li>• Original payment method will be used for refunds</li>
                      <li>• Custom/personalized items may have different refund terms</li>
                    </ul>
                  </div>

                  <button
                    onClick={submitRefundRequest}
                    disabled={isSubmittingRefund || !refundForm.orderId || !refundForm.amount || !refundForm.customerEmail || !refundForm.customerName}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isSubmittingRefund ? (
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Submit Refund Request
                  </button>
                </div>
              </div>
            )}

            {/* Tickets Section */}
            {activeSection === 'tickets' && (
              <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FileText className="h-6 w-6 text-orange-500 mr-3" />
                    Your Support Tickets
                  </h3>
                  <p className="text-slate-400 mt-2">Track your support requests</p>
                </div>

                <div className="p-6">
                  {loadingTickets ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-slate-700 rounded-lg p-4 animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="h-4 bg-slate-600 rounded w-16"></div>
                              <div className="h-4 bg-slate-600 rounded w-32"></div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-4 bg-slate-600 rounded w-20"></div>
                              <div className="h-4 bg-slate-600 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-slate-600 rounded w-24"></div>
                            <div className="h-3 bg-slate-600 rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No support tickets</h3>
                      <p className="text-slate-400 mb-4">You haven't created any support tickets yet</p>
                      <button
                        onClick={() => setActiveSection('contact')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        Create Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTickets.map((ticket) => (
                        <div key={ticket.id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-mono text-slate-400">#{ticket.id}</span>
                              <h4 className="font-medium text-white">{ticket.subject}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                                {ticket.status.replace('-', ' ').toUpperCase()}
                              </span>
                              <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>Created: {new Date(ticket.date).toLocaleDateString()}</span>
                            <button className="text-orange-500 hover:text-orange-400 flex items-center">
                              View Details
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Email Support</p>
                    <p className="text-slate-400 text-sm">mishralucky074@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Phone Support</p>
                    <p className="text-slate-400 text-sm">+16693123723</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-white font-medium">Support Hours</p>
                    <p className="text-slate-400 text-sm">24/7 Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Support Queries */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Queries</h3>
                <button
                  onClick={() => openRatingModal()}
                  className="text-orange-500 hover:text-orange-400 text-sm flex items-center"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate Experience
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm">Order tracking issue</p>
                    <p className="text-slate-400 text-xs">Resolved • 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm">Payment refund request</p>
                    <p className="text-slate-400 text-xs">In Progress • 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm">Product quality inquiry</p>
                    <p className="text-slate-400 text-xs">Resolved • 5 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Tips</h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-300">
                  <span className="font-medium text-orange-400">💡</span> Use the AI assistant for instant answers to common questions
                </p>
                <p className="text-slate-300">
                  <span className="font-medium text-orange-400">📱</span> Check your order status anytime in the Orders section
                </p>
                <p className="text-slate-300">
                  <span className="font-medium text-orange-400">🎯</span> For urgent issues, create a high-priority support ticket
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
              <p className="text-slate-400 mt-2">How satisfied are you with our support?</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-3">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingData({...ratingData, rating: star})}
                      className={`h-8 w-8 transition-colors ${
                        star <= ratingData.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className="h-full w-full" />
                    </button>
                  ))}
                  <span className="ml-3 text-white font-medium">
                    {ratingData.rating > 0 ? `${ratingData.rating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={ratingData.customerEmail}
                  onChange={(e) => setRatingData({...ratingData, customerEmail: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Feedback (Optional)</label>
                <textarea
                  value={ratingData.feedback}
                  onChange={(e) => setRatingData({...ratingData, feedback: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRatingData({ ticketId: '', refundId: '', customerEmail: '', rating: 0, feedback: '' });
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={submitRating}
                  disabled={ratingData.rating === 0}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-slate-600 transition-colors flex items-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}