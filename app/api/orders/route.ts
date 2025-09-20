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

    // Create cache key based on user role and parameters
    const cacheKey = `orders:${user.role}:${user.id}:${status || 'all'}:${limit}:${offset}`;
    
    // Try to get from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log(`Orders: Serving from cache for user ${user.email}`);
      return NextResponse.json(cachedData);
    }

    console.log(`Orders: Cache miss, fetching from database for user ${user.email}`);
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

    // Cache the result for 5 minutes (300 seconds)
    try {
      await setCache(cacheKey, responseData, 300);
      console.log(`Orders: Cached result for user ${user.email}`);
    } catch (error) {
      console.log(`Orders: Failed to cache result, continuing without cache:`, error);
    }

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

    // Invalidate relevant caches after creating order
    try {
      const cacheKeysToInvalidate = [
        `orders:CUSTOMER:${user.id}:*`,
        `orders:ADMIN:*:*`,
        `orders:ARTISAN:*:*`,
        'products:*'
      ];

      // Clear cache for this customer and admin views
      for (const pattern of cacheKeysToInvalidate) {
        const keys = await cache.getKeys(pattern);
        for (const key of keys) {
          await deleteCache(key);
        }
      }
      console.log('Orders: Invalidated cache after creating new order');
    } catch (error) {
      console.log('Orders: Failed to invalidate cache, continuing without cache cleanup:', error);
    }

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
