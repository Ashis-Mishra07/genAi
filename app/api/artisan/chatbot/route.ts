import { NextRequest, NextResponse } from 'next/server';
import { geminiService, ConversationContext } from '@/lib/gemini-service';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/utils/jwt';

// Helper function to fetch artisan data from database
async function fetchArtisanData(artisanId: string, query: string) {
  const lowerQuery = query.toLowerCase();
  const data: any = {};

  try {
    // Fetch products if query is about products
    if (lowerQuery.includes('product') || lowerQuery.includes('item') || lowerQuery.includes('उत्पाद')) {
      data.products = await prisma.products.findMany({
        where: {
          user_id: artisanId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          is_active: true,
          image_url: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      });
    }

    // Fetch orders if query is about orders, sales, or earnings
    if (lowerQuery.includes('order') || lowerQuery.includes('sale') || lowerQuery.includes('earn') || 
        lowerQuery.includes('ऑर्डर') || lowerQuery.includes('बिक्री')) {
      data.orders = await prisma.orders.findMany({
        where: {
          order_items: {
            some: {
              products: {
                user_id: artisanId,
              },
            },
          },
        },
        select: {
          id: true,
          order_number: true,
          status: true,
          total: true,
          currency: true,
          created_at: true,
          updated_at: true,
          order_items: {
            where: {
              products: {
                user_id: artisanId,
              },
            },
            select: {
              id: true,
              quantity: true,
              price: true,
              products: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  user_id: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 20,
      });

      // Calculate earnings
      data.totalEarnings = data.orders.reduce((sum: number, order: any) => {
        const artisanItems = order.order_items.filter((item: any) => item.products?.user_id === artisanId);
        return sum + artisanItems.reduce((itemSum: number, item: any) => 
          itemSum + (parseFloat(item.price.toString()) * item.quantity), 0
        );
      }, 0);
    }

    // Fetch analytics/statistics if query is about performance, stats, analytics
    if (lowerQuery.includes('analytic') || lowerQuery.includes('stat') || lowerQuery.includes('performance') ||
        lowerQuery.includes('how') || lowerQuery.includes('doing')) {
      
      const [productCount, activeProductCount, orderCount, totalOrders] = await Promise.all([
        prisma.products.count({
          where: { user_id: artisanId },
        }),
        prisma.products.count({
          where: { user_id: artisanId, is_active: true },
        }),
        prisma.orders.count({
          where: {
            order_items: {
              some: {
                products: {
                  user_id: artisanId,
                },
              },
            },
          },
        }),
        prisma.order_items.findMany({
          where: {
            products: {
              user_id: artisanId,
            },
          },
          select: {
            price: true,
            quantity: true,
          },
        }),
      ]);

      data.analytics = {
        totalProducts: productCount,
        activeProducts: activeProductCount,
        totalOrders: orderCount,
        totalRevenue: totalOrders.reduce((sum: number, item: any) => 
          sum + (parseFloat(item.price.toString()) * item.quantity), 0
        ),
      };
    }

    // Fetch notifications if query is about notifications, messages, alerts
    if (lowerQuery.includes('notification') || lowerQuery.includes('message') || lowerQuery.includes('alert') ||
        lowerQuery.includes('सूचना')) {
      data.notifications = await prisma.notifications.findMany({
        where: {
          user_id: artisanId,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      });
    }

    // Fetch inquiries if query is about customer questions, inquiries
    if (lowerQuery.includes('inquir') || lowerQuery.includes('question') || lowerQuery.includes('customer')) {
      data.inquiries = await prisma.product_inquiries.findMany({
        where: {
          products: {
            user_id: artisanId,
          },
        },
        include: {
          products: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching artisan data:', error);
    return {};
  }
}

// Helper function to create context for AI based on database data
function createDatabaseContext(data: any, language: string): string {
  let context = '';

  if (data.products && data.products.length > 0) {
    context += `\n\n**Products Information:**\n`;
    context += `Total products: ${data.products.length}\n`;
    data.products.forEach((product: any, index: number) => {
      context += `${index + 1}. ${product.name} - ${product.currency || 'INR'} ${product.price} (${product.isActive ? 'Active' : 'Inactive'})\n`;
      if (product.description) {
        context += `   Description: ${product.description.substring(0, 100)}...\n`;
      }
    });
  }

  if (data.orders && data.orders.length > 0) {
    context += `\n\n**Orders Information:**\n`;
    context += `Total orders: ${data.orders.length}\n`;
    data.orders.slice(0, 5).forEach((order: any, index: number) => {
      context += `${index + 1}. Order #${order.order_number} - ${order.status} - Total: ${order.currency || 'INR'} ${order.total}\n`;
      if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
        const itemNames = order.order_items
          .filter((item: any) => item.products && item.products.name)
          .map((item: any) => item.products.name)
          .join(', ');
        if (itemNames) {
          context += `   Items: ${itemNames}\n`;
        }
      }
    });
    if (data.totalEarnings) {
      context += `\nTotal earnings from orders: INR ${data.totalEarnings.toFixed(2)}\n`;
    }
  }

  if (data.analytics) {
    context += `\n\n**Business Analytics:**\n`;
    context += `- Total Products: ${data.analytics.totalProducts}\n`;
    context += `- Active Products: ${data.analytics.activeProducts}\n`;
    context += `- Total Orders: ${data.analytics.totalOrders}\n`;
    context += `- Total Revenue: INR ${data.analytics.totalRevenue.toFixed(2)}\n`;
  }

  if (data.notifications && data.notifications.length > 0) {
    context += `\n\n**Recent Notifications:**\n`;
    data.notifications.slice(0, 5).forEach((notif: any, index: number) => {
      context += `${index + 1}. ${notif.title} - ${notif.message}\n`;
    });
  }

  if (data.inquiries && data.inquiries.length > 0) {
    context += `\n\n**Customer Inquiries:**\n`;
    data.inquiries.slice(0, 5).forEach((inquiry: any, index: number) => {
      context += `${index + 1}. ${inquiry.product.name} - ${inquiry.message.substring(0, 100)}...\n`;
      context += `   Status: ${inquiry.status}\n`;
    });
  }

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser(request);
    
    if (!authUser) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized. Please login again.',
      }, { status: 401 });
    }

    if (authUser.role !== 'ARTISAN') {
      return NextResponse.json({
        success: false,
        error: 'This chatbot is only available for artisans.',
      }, { status: 403 });
    }

    const { message, conversationHistory = [], language = 'en' } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required',
      }, { status: 400 });
    }

    // Fetch relevant data from database based on the query
    const dbData = await fetchArtisanData(authUser.id, message);
    const databaseContext = createDatabaseContext(dbData, language);

    // Create system prompt with database context and multilingual support
    const systemPrompt = `You are an AI assistant for ${authUser.name || 'an artisan'}, a local artisan on a marketplace platform. 
You have access to their complete business data and can answer questions in multiple languages.

**Important Instructions:**
1. Respond in the same language as the user's question (${language})
2. Be conversational, friendly, and supportive
3. Use the database context provided below to answer specific questions accurately
4. If asked about products, orders, sales, or analytics, use the exact data provided
5. For local artisans who may not be tech-savvy, explain things in simple terms
6. Always be encouraging and positive about their business
7. Format numbers with proper currency (INR) and use clear formatting

**Available Database Context:**
${databaseContext}

If the user asks a question that requires data not in the context above, politely explain what information you can provide and suggest they check the relevant dashboard section.`;

    // Build conversation context
    const context: ConversationContext[] = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const response = await geminiService.generateResponse(message, context, systemPrompt);

    if (response.success) {
      return NextResponse.json({
        success: true,
        content: response.content,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.error || 'Failed to generate response',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Artisan chatbot API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again.',
    }, { status: 500 });
  }
}
