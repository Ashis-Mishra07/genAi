"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Headphones,
  HelpCircle,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Send,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTyping?: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  date: string;
  priority: "low" | "medium" | "high";
}

const faqData = [
  {
    id: 1,
    question: "How do I track my order?",
    answer:
      "You can track your order by going to the 'Orders' section in your dashboard or by clicking the 'Track My Order' button below. You'll receive email updates at each stage of delivery.",
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Handcrafted custom items may have different return terms. Please contact the artisan directly for custom orders.",
  },
  {
    id: 3,
    question: "How can I contact an artisan directly?",
    answer:
      "You can contact artisans through their product pages using the 'Message Artisan' button, or through the order details page if you've already purchased from them.",
  },
  {
    id: 4,
    question: "How long does shipping take?",
    answer:
      "Shipping typically takes 5-7 business days for standard delivery and 2-3 days for express delivery. Custom handcrafted items may take additional processing time.",
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    id: 6,
    question: "Can I modify or cancel my order?",
    answer:
      "You can modify or cancel orders within 2 hours of placement if the status is still 'pending'. After that, please contact our support team for assistance.",
  },
];

export default function CustomerHelpPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "ai" | "faq" | "contact" | "tickets" | "refund"
  >("ai");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "👋 Welcome to our AI Support Assistant!\n\n**Quick Help:** Click on the common questions above for instant answers.\n\n**Specific Questions:** Type detailed questions below (like 'Where is my order #ORD-123?') for personalized help.\n\nHow can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "general",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const [refundForm, setRefundForm] = useState({
    orderId: "",
    reason: "damaged_product",
    amount: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    ticketId: "",
    refundId: "",
    customerEmail: "",
    rating: 0,
    feedback: "",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch support tickets when tickets section is active
  useEffect(() => {
    if (activeSection === "tickets") {
      fetchSupportTickets();
    }
  }, [activeSection]);

  const fetchSupportTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch("/api/support/ticket?limit=5");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentTickets(data.tickets);
        }
      } else {
        console.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Placeholder functions for backend integration
  const sendSupportEmail = async () => {
    setIsSubmittingEmail(true);
    try {
      // TODO: Integrate with email API
      const response = await fetch("/api/support/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supportForm),
      });

      if (response.ok) {
        alert(
          "Support email sent successfully! We'll get back to you within 24 hours."
        );
        setSupportForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          priority: "medium",
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("Failed to send email. Please try again later.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const createSupportTicket = async () => {
    setIsSubmittingTicket(true);
    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Support ticket created successfully! Ticket ID: ${result.ticketId}`
        );
        setTicketForm({
          subject: "",
          category: "general",
          priority: "medium",
          description: "",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
        });
        // Refresh tickets if we're on the tickets section
        if (activeSection === "tickets") {
          fetchSupportTickets();
        }
      } else {
        throw new Error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Ticket creation error:", error);
      alert("Failed to create ticket. Please try again later.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const submitRefundRequest = async () => {
    setIsSubmittingRefund(true);
    try {
      const response = await fetch("/api/support/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...refundForm,
          amount: parseFloat(refundForm.amount) || 0,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Refund request submitted successfully! Request ID: ${result.refundId}`
        );
        setRefundForm({
          orderId: "",
          reason: "damaged_product",
          amount: "",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          description: "",
          priority: "medium",
        });
      } else {
        throw new Error("Failed to submit refund request");
      }
    } catch (error) {
      console.error("Refund request error:", error);
      alert("Failed to submit refund request. Please try again later.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const submitRating = async () => {
    try {
      const response = await fetch("/api/support/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Thank you for your feedback!");
        setShowRatingModal(false);
        setRatingData({
          ticketId: "",
          refundId: "",
          customerEmail: "",
          rating: 0,
          feedback: "",
        });
      } else {
        throw new Error("Failed to submit rating");
      }
    } catch (error) {
      console.error("Rating submission error:", error);
      alert("Failed to submit rating. Please try again.");
    }
  };

  const handleViewTicketDetails = async (ticketId: string) => {
    try {
      // First try to fetch ticket details
      const response = await fetch(`/api/support/ticket/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ticket) {
          // Create a detailed popup or modal with ticket information
          const ticketDetails = `
Ticket Details:

Ticket ID: #${data.ticket.id}
Subject: ${data.ticket.subject}
Category: ${data.ticket.category || "General"}
Status: ${data.ticket.status.toUpperCase()}
Priority: ${data.ticket.priority.toUpperCase()}
Created: ${new Date(data.ticket.created_at).toLocaleString()}
Updated: ${new Date(data.ticket.updated_at).toLocaleString()}

Customer Details:
Name: ${data.ticket.customer_name || "N/A"}
Email: ${data.ticket.customer_email || "N/A"}
Phone: ${data.ticket.customer_phone || "N/A"}

Description:
${data.ticket.description || "No description available"}
`;
          alert(ticketDetails);
        } else {
          alert("Ticket details not found.");
        }
      } else {
        throw new Error("Failed to fetch ticket details");
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      // Fallback to basic ticket info
      const ticket = recentTickets.find((t) => t.id === ticketId);
      if (ticket) {
        const basicDetails = `
Ticket Information:

Ticket ID: #${ticket.id}
Subject: ${ticket.subject}
Status: ${ticket.status.toUpperCase()}
Priority: ${ticket.priority.toUpperCase()}
Created: ${new Date(ticket.date).toLocaleString()}

For more details or to update this ticket, please contact our support team.
`;
        alert(basicDetails);
      } else {
        alert(
          "Unable to view ticket details. Please try again or contact support."
        );
      }
    }
  };

  const openRatingModal = (ticketId?: string, refundId?: string) => {
    setRatingData({
      ticketId: ticketId || "",
      refundId: refundId || "",
      customerEmail:
        supportForm.email ||
        ticketForm.customerEmail ||
        refundForm.customerEmail ||
        "",
      rating: 0,
      feedback: "",
    });
    setShowRatingModal(true);
  };

  // Handle quick FAQ questions
  const handleQuickQuestion = (
    action: string,
    question: string,
    redirect: string | null
  ) => {
    // Add user question to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    setIsAiTyping(true);

    // Generate professional response based on action
    setTimeout(() => {
      let response = "";
      let shouldRedirect = false;
      let redirectUrl = "";

      switch (action) {
        case "track-order":
          response = `📦 Order Tracking

To track your order:

1. Go to Orders section in your dashboard
2. Click on the order you want to track
3. View real-time status updates

You can also use your order number to track via SMS. If you need immediate assistance, I can redirect you to your orders page.`;
          shouldRedirect = true;
          redirectUrl = "/customer/orders";
          break;

        case "return-policy":
          response = `↩️ Return Policy

✅ 30-day return window from delivery date
✅ Items must be in original condition with tags
✅ Free returns for damaged/incorrect items
✅ Custom items may have different terms

Return Process:
1. Go to Orders → Select item → Request Return
2. Choose reason and upload photos if needed
3. We'll send a prepaid return label
4. Refund processed within 5-7 days after we receive the item

Would you like to start a return request?`;
          break;

        case "contact-artisan":
          response = `👨‍🎨 Contacting Artisans

Before Purchase:
• Visit any product page
• Click "Message Artisan" button
• Ask about customization, size, materials, etc.

After Purchase:
• Go to your Orders section
• Click on the order
• Use "Contact Seller" option

Response Time: Most artisans reply within 2-4 hours

I can redirect you to browse products where you can contact artisans directly.`;
          shouldRedirect = true;
          redirectUrl = "/customer/products";
          break;

        case "payment-methods":
          response = `💳 Payment Methods

We Accept:
✅ All major credit cards (Visa, MasterCard, AmEx)
✅ Debit cards
✅ UPI (Google Pay, PhonePe, Paytm)
✅ Net Banking
✅ Digital wallets
✅ EMI options available

Security:
🔒 256-bit SSL encryption
🔒 PCI DSS compliant
🔒 No card details stored

Payment Issues? Contact support immediately for assistance.`;
          break;

        case "shipping-time":
          response = `🚚 Shipping Information

Standard Delivery: 5-7 business days (₹49)
Express Delivery: 2-3 business days (₹99)
Free Shipping: Orders above ₹999

Custom/Handmade Items:
• Additional 2-5 days processing time
• Artisan will specify timeline

Tracking:
• SMS & email updates at every step
• Real-time tracking in your dashboard

Note: Rural areas may take 1-2 extra days`;
          break;

        case "modify-order":
          response = `✏️ Order Modification

Within 2 hours of placing order:
✅ Modify items, quantity, address
✅ Cancel completely
✅ Change payment method

After 2 hours:
❌ Limited modifications possible
✅ Address changes (before shipping)
✅ Contact artisan for custom orders

How to Modify:
1. Go to Orders → Find your order
2. Click "Modify Order" if available
3. Or contact support for assistance

Should I redirect you to your orders?`;
          shouldRedirect = true;
          redirectUrl = "/customer/orders";
          break;

        case "tech-support":
          response = `🔧 Technical Support

Common Issues & Solutions:

Login Problems:
• Reset password via "Forgot Password"
• Clear browser cache
• Try incognito mode

Payment Failures:
• Check card details
• Ensure sufficient balance
• Try different payment method

Website Issues:
• Refresh page (Ctrl+F5)
• Update your browser
• Disable ad blockers

Still need help?
Create a support ticket with details about the issue, your browser, and device type.`;
          break;

        case "refund-help":
          response = `💰 Refund Process

Automatic Refunds:
✅ Order cancelled within 2 hours
✅ Payment failed but amount deducted
✅ Seller cancels order

Manual Refund Process:
1. Go to Orders → Select order
2. Click "Request Refund"
3. Choose reason and provide details
4. Upload photos if item is damaged
5. Submit request

Timeline:
• Request reviewed: 1-2 business days
• Refund processed: 5-7 business days
• Bank credit: 2-5 days (varies by bank)

Would you like me to redirect you to the refund request form?`;
          break;

        default:
          response = `I'm here to help! Please select one of the common questions above, or type a specific question in the message box below. I work best when you ask about specific topics like orders, returns, payments, or technical issues.`;
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "ai",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);

      // Add redirect option if applicable
      if (shouldRedirect && redirectUrl) {
        setTimeout(() => {
          const redirectMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: `🔗 Would you like me to redirect you there now?`,
            sender: "ai",
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, redirectMessage]);

          // Auto-redirect after showing the option (optional)
          setTimeout(() => {
            const confirmRedirect = window.confirm(
              `Redirect to ${redirectUrl
                .split("/")
                .pop()
                ?.replace("-", " ")} page?`
            );
            if (confirmRedirect) {
              router.push(redirectUrl);
            }
          }, 2000);
        }, 1000);
      }
    }, 1500); // Simulate AI thinking time
  };

  const callAIHelpAssistant = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsAiTyping(true);

    // Check if this is a specific query that needs detailed response
    const isSpecificQuery = checkIfSpecificQuery(message);

    if (!isSpecificQuery) {
      // For general queries, redirect to FAQ buttons
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `I understand you're looking for help with that topic. For quick answers, please use the helpful buttons above, or be more specific about your question.\n\n**Examples of specific questions:**\n• "Where is my order #ORD-123?"\n• "How do I return item XYZ?"\n• "My payment failed for order ABC"\n• "I can't login to my account"\n\n**For general topics:** Use the quick-answer buttons above! 👆`,
          sender: "ai",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setIsAiTyping(false);
      }, 1000);
      return;
    }

    try {
      // For specific queries, try API first, then fallback to intelligent response
      const response = await fetch("/api/support/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, isSpecificQuery: true }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response.message,
          sender: "ai",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);

        // Add suggestions as quick reply buttons (optional)
        if (data.response.suggestions && data.response.suggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              text:
                "**Related topics you might find helpful:**\n• " +
                data.response.suggestions.join("\n• "),
              sender: "ai",
              timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, suggestionMessage]);
          }, 1500);
        }
      } else {
        throw new Error("API not available");
      }
    } catch (error) {
      console.error("AI assistant error:", error);
      // Fallback to intelligent local response for specific queries
      const intelligentResponse = getIntelligentResponse(message);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: intelligentResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Check if the query is specific enough to warrant a detailed response
  const checkIfSpecificQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();

    // Look for specific indicators
    const specificIndicators = [
      // Order-related specifics
      /order\s*#?\s*[a-z0-9\-]+/i,
      /tracking\s*(number|id|code)/i,
      /\b(ord|ref|txn)\-\d+/i,

      // Technical issues
      /can't|cannot|won't|doesn't work|not working|error|failed|problem with/i,
      /login|password|reset|account|checkout|payment/i,

      // Specific actions
      /(how do i|how can i|where do i|where can i)\s+\w+/i,
      /\b(refund|return|cancel|modify|change|update)\s+.{10,}/i,

      // Questions with details
      /\?\s*.{15,}/i, // Question with substantial detail
      /\b(my|mine|i have|i need|i want)\s+.{10,}/i,
    ];

    return (
      specificIndicators.some((pattern) => pattern.test(message)) ||
      message.length > 20
    );
  };

  // Intelligent response for specific queries
  const getIntelligentResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    // Order tracking queries
    if (/order.*#.*\w+/i.test(message) || /track.*order/i.test(message)) {
      return `🔍 **Order Tracking Help**\n\nI can see you're asking about a specific order. Here's how to track it:\n\n**Option 1: Dashboard**\n• Go to **Orders** section in your dashboard\n• Search for your order number\n• View real-time tracking\n\n**Option 2: Direct Tracking**\n• Use the tracking number sent via SMS/email\n• Check with the delivery partner directly\n\n**Need immediate help?** If your order is delayed or there's an issue, please contact our support team with your order details.\n\n🔗 Should I redirect you to your Orders page?`;
    }

    // Login/Account issues
    if (/login|password|account|sign.*in/i.test(message)) {
      return `🔐 **Account & Login Help**\n\n**Reset Password:**\n1. Go to login page\n2. Click "Forgot Password?"\n3. Enter your registered email\n4. Check email for reset link\n\n**Still can't login?**\n• Clear browser cache and cookies\n• Try incognito/private mode\n• Check if Caps Lock is on\n• Ensure you're using the correct email\n\n**Account locked?** Contact support immediately - we'll help you regain access within minutes.`;
    }

    // Payment issues
    if (/payment|pay|charged|money|refund|billing/i.test(message)) {
      return `💳 **Payment Issue Support**\n\nI understand you're having a payment-related concern. Here's what you can do:\n\n**Payment Failed:**\n• Try a different payment method\n• Check card details and expiry\n• Ensure sufficient balance\n\n**Unexpected Charge:**\n• Check your order history\n• Look for confirmation emails\n• Contact support with transaction details\n\n**Refund Status:**\n• Check Orders → Refunds section\n• Refunds take 5-7 business days\n\n**Immediate Help:** For urgent payment issues, please contact our support team directly.`;
    }

    // Return/Refund queries
    if (/return|refund|cancel|send.*back/i.test(message)) {
      return `↩️ **Return & Refund Assistance**\n\nI can help you with returns! Here's the process:\n\n**Easy Returns:**\n1. Go to **Orders** → Select item\n2. Click **"Return Item"**\n3. Choose reason & upload photos\n4. Get instant prepaid return label\n5. Pack & schedule pickup\n\n**Refund Timeline:**\n• Return approved: 1-2 days after we receive item\n• Money refunded: 5-7 business days\n\n**Custom Items:** Contact the artisan directly first - they may offer exchanges or partial refunds.\n\n🔗 Want me to guide you to start a return?`;
    }

    // Technical/Website issues
    if (
      /not working|error|bug|problem|issue|can't|cannot|won't|doesn't/i.test(
        message
      )
    ) {
      return `🔧 **Technical Support**\n\nI see you're experiencing a technical issue. Let's try these solutions:\n\n**Quick Fixes:**\n1. **Refresh the page** (Ctrl+F5 or Cmd+R)\n2. **Clear browser cache** and cookies\n3. **Try incognito mode**\n4. **Disable ad blockers** temporarily\n5. **Update your browser** to latest version\n\n**Still not working?**\n• Try a different browser or device\n• Check your internet connection\n• Restart your device\n\n**Need more help?** Please create a support ticket with:\n• Description of the issue\n• Browser & device info\n• Screenshots if possible\n\nOur tech team will resolve it quickly!`;
    }

    // Default for other specific queries
    return `🤖 **Personalized Help**\n\nI can see you have a specific question, and I want to make sure you get the best help possible!\n\n**For immediate assistance:**\n• **Use the quick-answer buttons above** for common topics\n• **Create a support ticket** for detailed help\n• **Call our support line** for urgent issues\n\n**Or try rephrasing your question** to include:\n• Specific order numbers\n• Error messages you're seeing\n• What you were trying to do when the issue occurred\n\nThis helps me provide more targeted assistance! 😊`;
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
      case "open":
        return "bg-blue-500/20 text-blue-400";
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400";
      case "resolved":
        return "bg-green-500/20 text-green-400";
      case "closed":
        return "bg-slate-500/20 text-muted-foreground";
      default:
        return "bg-slate-500/20 text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6 -mx-4 -mt-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Need Help?</h1>
              <p className="text-muted-foreground mt-1">
                Get support and find answers to your questions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-muted/50 border border-border rounded-xl px-4 py-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  Support Center
                </p>
                <p className="text-xs text-primary font-medium">
                  24/7 Available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push("/customer/orders")}
            className="bg-card rounded-2xl p-6 border border-border transition-all duration-200 hover:shadow-sm shadow-sm text-left group">
            <div className="bg-primary/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Track My Order
            </h3>
            <p className="text-muted-foreground text-sm">
              Check status and delivery updates
            </p>
          </button>

          <button
            onClick={() => setActiveSection("refund")}
            className="bg-card rounded-2xl p-6 border border-border transition-all duration-200 hover:shadow-sm shadow-sm text-left group">
            <div className="bg-green-500/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
              <RefreshCw className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Request Refund
            </h3>
            <p className="text-muted-foreground text-sm">
              Start return or refund process
            </p>
          </button>

          <button
            onClick={() => setActiveSection("contact")}
            className="bg-card rounded-2xl p-6 border border-border transition-all duration-200 hover:shadow-sm shadow-sm text-left group">
            <div className="bg-purple-500/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Headphones className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Contact Support
            </h3>
            <p className="text-muted-foreground text-sm">
              Get direct help from our team
            </p>
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-1 bg-card border border-border p-1 rounded-xl mb-8 max-w-md">
          {[
            { key: "ai", label: "AI Assistant", icon: Bot },
            { key: "faq", label: "FAQ", icon: HelpCircle },
            { key: "contact", label: "Contact", icon: Mail },
            { key: "tickets", label: "Tickets", icon: FileText },
            { key: "refund", label: "Refund", icon: RefreshCw },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeSection === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* AI Assistant Section */}
            {activeSection === "ai" && (
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        AI Shopping Assistant
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Click on common questions below or ask something
                        specific
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick FAQ Buttons */}
                <div className="p-6 border-b border-border bg-muted/20">
                  <h4 className="text-foreground font-medium mb-4">
                    💡 Common Questions - Click to get instant answers:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        q: "How do I track my order?",
                        action: "track-order",
                        icon: "📦",
                        redirect: "/customer/orders",
                      },
                      {
                        q: "What's your return policy?",
                        action: "return-policy",
                        icon: "↩️",
                        redirect: null,
                      },
                      {
                        q: "How to contact an artisan?",
                        action: "contact-artisan",
                        icon: "👨‍🎨",
                        redirect: "/customer/products",
                      },
                      {
                        q: "Payment methods accepted?",
                        action: "payment-methods",
                        icon: "💳",
                        redirect: null,
                      },
                      {
                        q: "How long does shipping take?",
                        action: "shipping-time",
                        icon: "🚚",
                        redirect: null,
                      },
                      {
                        q: "Can I modify my order?",
                        action: "modify-order",
                        icon: "✏️",
                        redirect: "/customer/orders",
                      },
                      {
                        q: "Need technical support",
                        action: "tech-support",
                        icon: "🔧",
                        redirect: null,
                      },
                      {
                        q: "Request a refund",
                        action: "refund-help",
                        icon: "💰",
                        redirect: null,
                      },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleQuickQuestion(
                            item.action,
                            item.q,
                            item.redirect
                          )
                        }
                        className="flex items-center space-x-3 p-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-left group border border-border hover:border-primary/30">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-foreground text-sm group-hover:text-primary">
                          {item.q}
                        </span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border"
                        }`}>
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted border border-border text-foreground max-w-xs lg:max-w-md px-4 py-3 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                            <div
                              className="h-2 w-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}></div>
                            <div
                              className="h-2 w-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            AI is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Section */}
                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground text-center">
                      💬 For specific questions, type your message below. For
                      quick help, use the buttons above.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Ask a specific question... (e.g., 'Where is my order #ORD-123?')"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isAiTyping}
                      className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground p-2.5 rounded-xl transition-colors min-w-[44px] flex items-center justify-center"
                      title="Send message">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {activeSection === "faq" && (
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <HelpCircle className="h-6 w-6 text-primary mr-3" />
                    Frequently Asked Questions
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Find quick answers to common questions
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {faqData.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-border rounded-xl">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors">
                          <h4 className="font-medium text-foreground">
                            {faq.question}
                          </h4>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>

                        {expandedFaq === faq.id && (
                          <div className="px-4 pb-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === "contact" && (
              <div className="space-y-6">
                {/* Email Support */}
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <Mail className="h-6 w-6 text-orange-500 mr-3" />
                      Send Support Email
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Get help directly from our support team
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={supportForm.name}
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={supportForm.email}
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={supportForm.subject}
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Brief description of your issue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Priority
                        </label>
                        <select
                          value={supportForm.priority}
                          onChange={(e) =>
                            setSupportForm({
                              ...supportForm,
                              priority: e.target.value as any,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <textarea
                        value={supportForm.message}
                        onChange={(e) =>
                          setSupportForm({
                            ...supportForm,
                            message: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Describe your issue in detail..."
                      />
                    </div>

                    <button
                      onClick={sendSupportEmail}
                      disabled={
                        isSubmittingEmail ||
                        !supportForm.email ||
                        !supportForm.subject ||
                        !supportForm.message
                      }
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-foreground px-6 py-2 rounded-xl font-medium transition-colors flex items-center">
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
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground flex items-center">
                      <FileText className="h-6 w-6 text-orange-500 mr-3" />
                      Raise Support Ticket
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Create a trackable support ticket
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={ticketForm.subject}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              subject: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Ticket subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Category
                        </label>
                        <select
                          value={ticketForm.category}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500">
                          <option value="general">General Support</option>
                          <option value="orders">Order Issues</option>
                          <option value="payments">Payment Problems</option>
                          <option value="technical">Technical Issues</option>
                          <option value="returns">Returns & Refunds</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Priority
                      </label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) =>
                          setTicketForm({
                            ...ticketForm,
                            priority: e.target.value as any,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={ticketForm.customerName}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              customerName: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={ticketForm.customerEmail}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              customerEmail: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={ticketForm.customerPhone}
                          onChange={(e) =>
                            setTicketForm({
                              ...ticketForm,
                              customerPhone: e.target.value,
                            })
                          }
                          className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) =>
                          setTicketForm({
                            ...ticketForm,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                        placeholder="Detailed description of your issue..."
                      />
                    </div>

                    <button
                      onClick={createSupportTicket}
                      disabled={
                        isSubmittingTicket ||
                        !ticketForm.subject ||
                        !ticketForm.description
                      }
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-foreground px-6 py-2 rounded-xl font-medium transition-colors flex items-center">
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
            {activeSection === "refund" && (
              <div className="bg-card rounded-xl border border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <RefreshCw className="h-6 w-6 text-orange-500 mr-3" />
                    Request Refund
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Submit a refund request for your order
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Order ID
                      </label>
                      <input
                        type="text"
                        value={refundForm.orderId}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            orderId: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="ORD-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Refund Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={refundForm.amount}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            amount: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Reason for Refund
                      </label>
                      <select
                        value={refundForm.reason}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            reason: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500">
                        <option value="damaged_product">Damaged Product</option>
                        <option value="wrong_item">Wrong Item Received</option>
                        <option value="not_as_described">
                          Not as Described
                        </option>
                        <option value="defective">Defective Product</option>
                        <option value="late_delivery">Late Delivery</option>
                        <option value="changed_mind">Changed Mind</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Priority
                      </label>
                      <select
                        value={refundForm.priority}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            priority: e.target.value as any,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={refundForm.customerName}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={refundForm.customerEmail}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            customerEmail: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={refundForm.customerPhone}
                        onChange={(e) =>
                          setRefundForm({
                            ...refundForm,
                            customerPhone: e.target.value,
                          })
                        }
                        className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={refundForm.description}
                      onChange={(e) =>
                        setRefundForm({
                          ...refundForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Please provide details about why you're requesting a refund..."
                    />
                  </div>

                  <div className="bg-muted rounded-xl p-4 mb-6">
                    <h4 className="text-foreground font-medium mb-2">
                      📋 Refund Process Information
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>
                        • Refund requests are typically processed within 2-3
                        business days
                      </li>
                      <li>
                        • You'll receive email and SMS updates on your request
                        status
                      </li>
                      <li>
                        • Approved refunds are credited within 5-7 business days
                      </li>
                      <li>
                        • Original payment method will be used for refunds
                      </li>
                      <li>
                        • Custom/personalized items may have different refund
                        terms
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={submitRefundRequest}
                    disabled={
                      isSubmittingRefund ||
                      !refundForm.orderId ||
                      !refundForm.amount ||
                      !refundForm.customerEmail ||
                      !refundForm.customerName
                    }
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-600 text-foreground px-6 py-2 rounded-xl font-medium transition-colors flex items-center">
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
            {activeSection === "tickets" && (
              <div className="bg-card rounded-xl border border-border">
                <div className="p-6 border-b border-border">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <FileText className="h-6 w-6 text-orange-500 mr-3" />
                    Your Support Tickets
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Track your support requests
                  </p>
                </div>

                <div className="p-6">
                  {loadingTickets ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="border border-border rounded-xl p-4 animate-pulse">
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
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No support tickets
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't created any support tickets yet
                      </p>
                      <button
                        onClick={() => setActiveSection("contact")}
                        className="bg-orange-500 text-foreground px-6 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors">
                        Create Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="border border-border rounded-xl p-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-mono text-muted-foreground">
                                #{ticket.id}
                              </span>
                              <h4 className="font-medium text-foreground">
                                {ticket.subject}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getTicketStatusColor(
                                  ticket.status
                                )}`}>
                                {ticket.status.replace("-", " ").toUpperCase()}
                              </span>
                              <span
                                className={`text-xs font-medium ${getPriorityColor(
                                  ticket.priority
                                )}`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                              Created:{" "}
                              {new Date(ticket.date).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => handleViewTicketDetails(ticket.id)}
                              className="text-orange-500 hover:text-primary flex items-center transition-colors">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-foreground font-medium">Email Support</p>
                  <p className="text-muted-foreground text-sm">
                    mishralucky074@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-foreground font-medium">Phone Support</p>
                  <p className="text-muted-foreground text-sm">+16693123723</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-foreground font-medium">Support Hours</p>
                  <p className="text-muted-foreground text-sm">
                    24/7 Available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Support Queries */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Recent Queries
              </h3>
              <button
                onClick={() => openRatingModal()}
                className="text-orange-500 hover:text-primary text-sm flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Rate Experience
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm">
                    Order tracking issue
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Resolved • 2 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm">
                    Payment refund request
                  </p>
                  <p className="text-muted-foreground text-xs">
                    In Progress • 1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm">
                    Product quality inquiry
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Resolved • 5 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Quick Tips
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">💡</span> Use the AI
                assistant for instant answers to common questions
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">📱</span> Check your
                order status anytime in the Orders section
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">🎯</span> For urgent
                issues, create a high-priority support ticket
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">
                Rate Your Experience
              </h3>
              <p className="text-muted-foreground mt-2">
                How satisfied are you with our support?
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setRatingData({ ...ratingData, rating: star })
                      }
                      className={`h-8 w-8 transition-colors ${
                        star <= ratingData.rating
                          ? "text-yellow-400 fill-current"
                          : "text-slate-600 hover:text-muted-foreground"
                      }`}>
                      <Star className="h-full w-full" />
                    </button>
                  ))}
                  <span className="ml-3 text-foreground font-medium">
                    {ratingData.rating > 0
                      ? `${ratingData.rating}/5`
                      : "Select rating"}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={ratingData.customerEmail}
                  onChange={(e) =>
                    setRatingData({
                      ...ratingData,
                      customerEmail: e.target.value,
                    })
                  }
                  className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={ratingData.feedback}
                  onChange={(e) =>
                    setRatingData({ ...ratingData, feedback: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-muted border border-slate-600 rounded-xl px-3 py-2 text-foreground placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRatingData({
                      ticketId: "",
                      refundId: "",
                      customerEmail: "",
                      rating: 0,
                      feedback: "",
                    });
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                  Skip
                </button>
                <button
                  onClick={submitRating}
                  disabled={ratingData.rating === 0}
                  className="bg-orange-500 text-foreground px-6 py-2 rounded-xl hover:bg-orange-600 disabled:bg-slate-600 transition-colors flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
