import { NextRequest, NextResponse } from 'next/server';

interface AIAssistantRequest {
  message: string;
  context?: string;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AIAssistantRequest = await request.json();
    
    if (!body.message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const message = body.message.toLowerCase();
    let response: AIResponse;

    // Simple rule-based responses (in production, you'd use a proper AI service)
    if (message.includes('track') && (message.includes('order') || message.includes('delivery'))) {
      response = {
        message: "I can help you track your order! Please go to the 'Orders' section in your dashboard where you can see real-time updates. Do you have your order number handy?",
        suggestions: [
          "Show me my recent orders",
          "I can't find my order number",
          "When will my order arrive?"
        ],
        actions: [
          {
            label: "Go to Orders",
            action: "navigate",
            url: "/customer/orders"
          }
        ]
      };
    } else if (message.includes('return') || message.includes('refund')) {
      response = {
        message: "Our return policy allows returns within 30 days of delivery. Items must be in original condition with tags attached. Would you like me to help you start a return process?",
        suggestions: [
          "Start a return",
          "What's your return policy?",
          "How do I get a refund?"
        ],
        actions: [
          {
            label: "Start Return Process",
            action: "navigate",
            url: "/customer/orders"
          }
        ]
      };
    } else if (message.includes('payment') || message.includes('charge') || message.includes('billing')) {
      response = {
        message: "For payment-related issues, I recommend checking your order details first. If you see any discrepancies, our billing support team can help resolve them quickly.",
        suggestions: [
          "Check my payment history",
          "I was charged twice",
          "Update payment method"
        ],
        actions: [
          {
            label: "Contact Billing Support",
            action: "contact",
            url: "/customer/help?section=contact"
          }
        ]
      };
    } else if (message.includes('artisan') || message.includes('seller') || message.includes('contact')) {
      response = {
        message: "You can contact artisans directly through their product pages or from your order details if you've already purchased from them. Each artisan has their own messaging system.",
        suggestions: [
          "How to message an artisan",
          "Find artisan contact info",
          "Report an issue with artisan"
        ]
      };
    } else if (message.includes('shipping') || message.includes('delivery') || message.includes('when')) {
      response = {
        message: "Standard shipping takes 5-7 business days, while express shipping takes 2-3 days. Custom handcrafted items may take additional processing time. Would you like to check a specific order's shipping status?",
        suggestions: [
          "Check shipping status",
          "What are shipping options?",
          "My order is delayed"
        ],
        actions: [
          {
            label: "Track Shipment",
            action: "navigate",
            url: "/customer/orders"
          }
        ]
      };
    } else if (message.includes('cancel') || message.includes('modify')) {
      response = {
        message: "You can modify or cancel orders within 2 hours of placement if the status is still 'pending'. After that, please contact our support team for assistance.",
        suggestions: [
          "Cancel my order",
          "Change delivery address",
          "Modify order items"
        ],
        actions: [
          {
            label: "View Orders",
            action: "navigate",
            url: "/customer/orders"
          },
          {
            label: "Contact Support",
            action: "contact",
            url: "/customer/help?section=contact"
          }
        ]
      };
    } else if (message.includes('account') || message.includes('profile') || message.includes('password')) {
      response = {
        message: "For account-related issues like password reset, profile updates, or account settings, you can manage everything from your profile page or contact our support team.",
        suggestions: [
          "Reset password",
          "Update profile",
          "Account security"
        ],
        actions: [
          {
            label: "Go to Profile",
            action: "navigate",
            url: "/customer/profile"
          }
        ]
      };
    } else if (message.includes('product') || message.includes('quality') || message.includes('defect')) {
      response = {
        message: "If you have concerns about product quality or received a defective item, please contact us immediately. We'll work with the artisan to resolve the issue quickly.",
        suggestions: [
          "Report product issue",
          "Request replacement",
          "Get quality assurance info"
        ],
        actions: [
          {
            label: "Report Issue",
            action: "contact",
            url: "/customer/help?section=contact"
          }
        ]
      };
    } else if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
      response = {
        message: "Hello! I'm here to help you with any questions about your orders, products, returns, or account. What can I assist you with today?",
        suggestions: [
          "Track my order",
          "Return policy",
          "Contact artisan",
          "Payment issues"
        ]
      };
    } else {
      response = {
        message: "I understand you need help with that. While I try to learn more about your specific question, you can browse our FAQ section or contact our human support team for detailed assistance.",
        suggestions: [
          "View FAQ",
          "Contact human support",
          "Browse help topics"
        ],
        actions: [
          {
            label: "View FAQ",
            action: "navigate",
            url: "/customer/help?section=faq"
          },
          {
            label: "Contact Support",
            action: "contact",
            url: "/customer/help?section=contact"
          }
        ]
      };
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return NextResponse.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}