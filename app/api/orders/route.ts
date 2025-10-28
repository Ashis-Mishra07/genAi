import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { 
  createOrder, 
  getOrdersByCustomerId, 
  getAllOrders, 
  getOrdersByArtisan,
  Order as DBOrder,
  OrderItem as DBOrderItem 
} from '../../../lib/db/orders';
import { createNotification } from '../../../lib/db/notifications';
import { getProductById } from '../../../lib/db/products-neon';
import { cache, setCache, getCache, deleteCache } from '../../../lib/redis';
import { 
  sendOrderConfirmationEmail, 
  sendArtisanNotificationsForOrder,
  calculateShipping
} from '../../../lib/email-service';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // REDIS DISABLED FOR PERFORMANCE - Direct database queries
    console.log(`Orders: Fetching directly from database for user ${user.email} (Redis disabled)`);
    let orders: DBOrder[] = [];

    // Get orders based on user role
    if (user.role === 'ADMIN') {
      orders = await getAllOrders();
    } else if (user.role === 'ARTISAN') {
      orders = await getOrdersByArtisan(user.id);
    } else if (user.role === 'CUSTOMER') {
      orders = await getOrdersByCustomerId(user.id);
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }

    // Apply pagination
    const paginatedOrders = orders.slice(offset, offset + limit);

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      deliveredOrders: orders.filter(order => order.status === 'delivered').length,
    };

    const responseData = {
      success: true,
      orders: paginatedOrders,
      stats: stats,
      count: orders.length,
      totalCount: orders.length
    };

    // REDIS CACHING DISABLED - Returns data immediately
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Customer authentication required' },
        { status: 401 }
      );
    }

    const orderData = await request.json();

    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!orderData.shippingAddress || !orderData.total) {
      return NextResponse.json(
        { error: 'Shipping address and total are required' },
        { status: 400 }
      );
    }

    // Create the order
    const order = await createOrder({
      customerId: user.id,
      items: orderData.items,
      total: orderData.total,
      currency: orderData.currency || 'INR',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'cod',
      status: orderData.status || 'pending'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // REDIS CACHING DISABLED - No cache invalidation needed
    console.log('Orders: Cache invalidation skipped (Redis disabled)');

    // Send notifications to artisans (skip if notifications table doesn't exist yet)
    try {
      // Collect unique artisan IDs from the order items
      const artisanIds = new Set<string>();
      
      for (const item of orderData.items) {
        if (item.productId) {
          const product = await getProductById(item.productId);
          if (product && product.userId) {
            artisanIds.add(product.userId);
          }
        }
      }

      // Notify each artisan about their products being ordered
      for (const artisanId of artisanIds) {
        await createNotification({
          userId: artisanId,
          type: 'product_sold',
          title: 'New Order Received!',
          message: `You have received a new order (${order.orderNumber}) for your products. Total value: ₹${order.total}`,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: orderData.shippingAddress.fullName,
            total: order.total,
            itemCount: orderData.items.length
          }
        });
      }

    } catch (notificationError) {
      console.error('Error sending notifications (notifications table may not exist):', notificationError);
      // Don't fail the order creation if notifications fail
    }

    // Send email notifications (don't fail order creation if emails fail)
    try {
      // Calculate shipping
      const subtotal = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const shipping = calculateShipping(subtotal);

      // Prepare customer order confirmation email
      const customerEmailData = {
        orderNumber: order.orderNumber,
        customerName: orderData.shippingAddress.fullName,
        customerEmail: user.email,
        items: orderData.items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
          artisanName: item.artisanName
        })),
        subtotal: subtotal,
        shipping: shipping,
        total: order.total,
        shippingAddress: {
          fullName: orderData.shippingAddress.fullName,
          addressLine1: orderData.shippingAddress.addressLine1 || orderData.shippingAddress.address,
          addressLine2: orderData.shippingAddress.addressLine2,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.pincode || orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country || 'India',
          phone: orderData.shippingAddress.phone
        },
        paymentMethod: orderData.paymentMethod,
        createdAt: order.createdAt,
        trackOrderUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/customer/orders`
      };

      // Send customer confirmation email
      await sendOrderConfirmationEmail(customerEmailData);

      // Prepare artisan notifications
      const artisanProductsMap = new Map<string, {
        artisanEmail: string;
        artisanName: string;
        products: Array<{
          id: string;
          name: string;
          quantity: number;
          price: number;
          imageUrl?: string;
        }>;
      }>();

      // Group products by artisan
      for (const item of orderData.items) {
        if (item.productId) {
          const product = await getProductById(item.productId);
          if (product && product.userId) {
            // Get artisan user details from database
            const artisanResult = await sql`
              SELECT id, email, name FROM users WHERE id = ${product.userId}
            `;
            
            if (artisanResult.length > 0) {
              const artisan = artisanResult[0];
              
              if (!artisanProductsMap.has(artisan.id)) {
                artisanProductsMap.set(artisan.id, {
                  artisanEmail: artisan.email,
                  artisanName: artisan.name || 'Artisan',
                  products: []
                });
              }

              artisanProductsMap.get(artisan.id)?.products.push({
                id: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl
              });
            }
          }
        }
      }

      // Send artisan notification emails
      await sendArtisanNotificationsForOrder(customerEmailData, artisanProductsMap);

      console.log('Order emails sent successfully for order:', order.orderNumber);
    } catch (emailError) {
      console.error('Error sending order emails (continuing without failing order):', emailError);
      // Don't fail the order creation if emails fail
    }

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order placed successfully'
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create order',
        details: error.message
      },
      { status: 500 }
    );
  }
}
