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

export async function GET(request: NextRequest) {
  try {
    console.log('Orders API: Starting request processing');
    
    // Log headers for debugging
    const authHeader = request.headers.get('authorization');
    console.log('Orders API: Auth header present:', !!authHeader);
    console.log('Orders API: Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
    
    const user = await getCurrentUser(request);
    console.log('Orders API: User from token:', user);
    
    if (!user) {
      console.log('Orders API: No user found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Orders API: User authenticated successfully:', user.email, user.role);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orders: DBOrder[] = [];

    // Get orders based on user role
    console.log('Orders API: Fetching orders for role:', user.role);
    if (user.role === 'ADMIN') {
      orders = await getAllOrders();
    } else if (user.role === 'ARTISAN') {
      orders = await getOrdersByArtisan(user.id);
    } else if (user.role === 'CUSTOMER') {
      orders = await getOrdersByCustomerId(user.id);
    }

    console.log('Orders API: Found orders count:', orders.length);

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

    console.log('Orders API: Returning success response with', paginatedOrders.length, 'orders');

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      stats: stats,
      count: orders.length,
      totalCount: orders.length
    });
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
    console.log('Orders API POST: Starting order creation process');
    
    const user = await getCurrentUser(request);
    console.log('Orders API POST: User from token:', user);
    
    if (!user || user.role !== 'CUSTOMER') {
      console.log('Orders API POST: Authentication failed or not a customer', { user });
      return NextResponse.json(
        { error: 'Customer authentication required' },
        { status: 401 }
      );
    }

    console.log('Orders API POST: Customer authenticated successfully:', user.email);

    const orderData = await request.json();
    console.log('Orders API POST: Order data received:', {
      itemsCount: orderData.items?.length,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress ? 'Present' : 'Missing',
      paymentMethod: orderData.paymentMethod
    });

    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.log('Orders API POST: Validation failed - no items');
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!orderData.shippingAddress || !orderData.total) {
      console.log('Orders API POST: Validation failed - missing shipping address or total');
      return NextResponse.json(
        { error: 'Shipping address and total are required' },
        { status: 400 }
      );
    }

    console.log('Orders API POST: Validation passed, creating order...');

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

    console.log('Orders API POST: Order creation result:', order ? 'Success' : 'Failed');

    if (!order) {
      console.log('Orders API POST: Order creation returned null');
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    console.log('Orders API POST: Order created successfully:', order.orderNumber);

    // Send notifications to artisans (skip if notifications table doesn't exist yet)
    try {
      console.log('Orders API POST: Starting notification process...');
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

      console.log('Orders API POST: Found artisan IDs:', Array.from(artisanIds));

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

      console.log('Orders API POST: Notifications sent successfully');

    } catch (notificationError) {
      console.error('Error sending notifications (notifications table may not exist):', notificationError);
      // Don't fail the order creation if notifications fail
    }

    console.log('Orders API POST: Returning success response');

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
