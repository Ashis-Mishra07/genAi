import { neon } from '@neondatabase/serverless';
import { getCoordinatesFromAddress } from '../geocoding-service';

const sql = neon(process.env.DATABASE_URL!);

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  artisanName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus?: string;
  paymentDetails?: any;
  transactionId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerName?: string;
  customerEmail?: string;
}

export async function createOrder(orderData: {
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
  paymentStatus?: string;
  paymentDetails?: any;
  transactionId?: string;
  status?: string;
}): Promise<Order | null> {
  try {
    console.log('🔄 Creating order for customer:', orderData.customerId);
    console.log('   Items count:', orderData.items.length);
    console.log('   Total:', orderData.total);
    console.log('   Payment method:', orderData.paymentMethod);
    
    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Get coordinates from shipping address (synchronous function)
    let coordinates: { lat: number; lng: number } | null = null;
    try {
      coordinates = getCoordinatesFromAddress(orderData.shippingAddress);
      console.log('   Geocoding result:', coordinates || 'No coordinates found');
    } catch (geoError) {
      console.warn('⚠️  Geocoding failed, continuing without coordinates:', geoError);
    }
    
    console.log('🔄 Executing database INSERT...');
    
    // Insert order into database with coordinates and payment details
    // Use separate queries based on whether we have coordinates to avoid SQL issues
    let orderResult;
    
    if (coordinates) {
      orderResult = await sql`
        INSERT INTO orders (
          order_number, customer_id, status, total, currency, 
          shipping_address, payment_method, payment_status, payment_details, transaction_id,
          created_at, shipping_latitude, shipping_longitude, location_geocoded_at
        ) VALUES (
          ${orderNumber}, 
          ${orderData.customerId}, 
          ${orderData.status || 'pending'}, 
          ${orderData.total}, 
          ${orderData.currency}, 
          ${JSON.stringify(orderData.shippingAddress)}, 
          ${orderData.paymentMethod}, 
          ${orderData.paymentStatus || 'pending'}, 
          ${orderData.paymentDetails ? JSON.stringify(orderData.paymentDetails) : null},
          ${orderData.transactionId || null},
          NOW(),
          ${coordinates.lat}, 
          ${coordinates.lng}, 
          NOW()
        ) 
        RETURNING id, order_number, customer_id, status, total, currency, 
                 shipping_address, payment_method, payment_status, payment_details, 
                 transaction_id, created_at, shipping_latitude, shipping_longitude
      `;
    } else {
      orderResult = await sql`
        INSERT INTO orders (
          order_number, customer_id, status, total, currency, 
          shipping_address, payment_method, payment_status, payment_details, transaction_id,
          created_at, shipping_latitude, shipping_longitude, location_geocoded_at
        ) VALUES (
          ${orderNumber}, 
          ${orderData.customerId}, 
          ${orderData.status || 'pending'}, 
          ${orderData.total}, 
          ${orderData.currency}, 
          ${JSON.stringify(orderData.shippingAddress)}, 
          ${orderData.paymentMethod}, 
          ${orderData.paymentStatus || 'pending'}, 
          ${orderData.paymentDetails ? JSON.stringify(orderData.paymentDetails) : null},
          ${orderData.transactionId || null},
          NOW(),
          NULL,
          NULL,
          NULL
        ) 
        RETURNING id, order_number, customer_id, status, total, currency, 
                 shipping_address, payment_method, payment_status, payment_details, 
                 transaction_id, created_at, shipping_latitude, shipping_longitude
      `;
    }

    console.log('✅ Database INSERT completed, checking result...');

    if (!orderResult || orderResult.length === 0) {
      console.error('❌ Order creation failed - no result returned from database');
      throw new Error('Failed to create order - no result returned from database');
    }

    const order = orderResult[0];
    console.log(`✅ Order ${orderNumber} created successfully (ID: ${order.id})`);
    console.log(`   Payment status: ${orderData.paymentStatus || 'pending'}`);

    // Insert order items
    console.log(`🔄 Inserting ${orderData.items.length} order items...`);
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, name, price, quantity, artisan_name
        ) VALUES (
          ${order.id}, 
          ${item.productId}, 
          ${item.name}, 
          ${item.price}, 
          ${item.quantity}, 
          ${item.artisanName || null}
        )
      `;
    }
    console.log(`✅ All order items inserted successfully`);

    // Return the complete order
    return {
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: order.payment_method,
    };
  } catch (error) {
    console.error('❌ ============================================');
    console.error('❌ CRITICAL ERROR IN createOrder FUNCTION');
    console.error('❌ ============================================');
    console.error('❌ Raw error:', error);
    
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Stack trace:');
      console.error(error.stack);
    }
    
    // Check if it's a database error (Neon/PostgreSQL)
    if (error && typeof error === 'object') {
      const dbError = error as any;
      if (dbError.code) console.error('   Database error code:', dbError.code);
      if (dbError.detail) console.error('   Database detail:', dbError.detail);
      if (dbError.hint) console.error('   Database hint:', dbError.hint);
      if (dbError.position) console.error('   Error position:', dbError.position);
      if (dbError.constraint) console.error('   Constraint violated:', dbError.constraint);
      if (dbError.table) console.error('   Table:', dbError.table);
      if (dbError.column) console.error('   Column:', dbError.column);
    }
    
    // Log the order data for debugging (but redact sensitive info)
    console.error('   === Order Data Debug ===');
    console.error('   Customer ID:', orderData.customerId);
    console.error('   Items count:', orderData.items?.length);
    console.error('   Total:', orderData.total);
    console.error('   Currency:', orderData.currency);
    console.error('   Payment method:', orderData.paymentMethod);
    console.error('   Payment status:', orderData.paymentStatus);
    console.error('   Order status:', orderData.status);
    console.error('   Has shipping address:', !!orderData.shippingAddress);
    
    if (orderData.shippingAddress) {
      console.error('   Shipping city:', orderData.shippingAddress.city);
      console.error('   Shipping state:', orderData.shippingAddress.state);
      console.error('   Full address object:', JSON.stringify(orderData.shippingAddress, null, 2));
    }
    
    if (orderData.items && orderData.items.length > 0) {
      console.error('   First item:', JSON.stringify(orderData.items[0], null, 2));
    }
    
    console.error('❌ ============================================');
    
    return null;
  }
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  try {
    // Get orders
    const orders = await sql`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'artisanName', oi.artisan_name
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ${customerId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      items: order.items || [],
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDetails: order.payment_details,
      transactionId: order.transaction_id,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    // Get all orders for admin
    const orders = await sql`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'artisanName', oi.artisan_name
               )
             ) as items,
             u.name as customer_name,
             u.email as customer_email
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.customer_id = u.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `;

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      items: order.items || [],
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDetails: order.payment_details,
      transactionId: order.transaction_id,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

export async function getOrdersByArtisan(artisanId: string): Promise<Order[]> {
  try {
    console.log(`🔍 Fetching orders for artisan: ${artisanId}`);
    
    // Get orders containing products from specific artisan
    const orders = await sql`
      SELECT DISTINCT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'artisanName', oi.artisan_name
               ) ORDER BY oi.id
             ) FILTER (WHERE oi.id IS NOT NULL) as items,
             u.name as customer_name,
             u.email as customer_email
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE p.user_id = ${artisanId}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `;

    console.log(`✅ Found ${orders.length} orders for artisan ${artisanId}`);

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerId: order.customer_id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      items: order.items || [],
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      paymentDetails: order.payment_details,
      transactionId: order.transaction_id,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    }));
  } catch (error) {
    console.error('Error fetching artisan orders:', error);
    console.error('Error details:', error);
    return [];
  }
}
