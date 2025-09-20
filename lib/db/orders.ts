import { neon } from '@neondatabase/serverless';

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
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export async function createOrder(orderData: {
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
  status?: string;
}): Promise<Order | null> {
  try {
    console.log('DB Orders: Creating order for customer:', orderData.customerId);
    console.log('DB Orders: Order data:', {
      itemsCount: orderData.items.length,
      total: orderData.total,
      currency: orderData.currency,
      paymentMethod: orderData.paymentMethod,
      status: orderData.status
    });

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    console.log('DB Orders: Generated order number:', orderNumber);
    
    // Insert order into database
    console.log('DB Orders: Inserting order into database...');
    const [orderResult] = await sql`
      INSERT INTO orders (
        order_number, customer_id, status, total, currency, 
        shipping_address, payment_method, created_at
      ) VALUES (
        ${orderNumber}, ${orderData.customerId}, ${orderData.status || 'pending'}, 
        ${orderData.total}, ${orderData.currency}, ${JSON.stringify(orderData.shippingAddress)}, 
        ${orderData.paymentMethod}, NOW()
      ) 
      RETURNING id, order_number, customer_id, status, total, currency, 
               shipping_address, payment_method, created_at
    `;

    console.log('DB Orders: Order inserted, result:', orderResult);

    if (!orderResult) {
      console.error('DB Orders: No result from order insertion');
      throw new Error('Failed to create order');
    }

    // Insert order items
    console.log('DB Orders: Inserting order items...');
    for (const item of orderData.items) {
      console.log('DB Orders: Inserting item:', {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
      
      await sql`
        INSERT INTO order_items (
          order_id, product_id, name, price, quantity, artisan_name
        ) VALUES (
          ${orderResult.id}, ${item.productId}, ${item.name}, 
          ${item.price}, ${item.quantity}, ${item.artisanName || null}
        )
      `;
    }

    console.log('DB Orders: All order items inserted successfully');

    // Return the complete order
    const finalOrder = {
      id: orderResult.id,
      orderNumber: orderResult.order_number,
      customerId: orderResult.customer_id,
      status: orderResult.status,
      total: orderResult.total,
      currency: orderResult.currency,
      createdAt: orderResult.created_at,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderResult.payment_method,
    };

    console.log('DB Orders: Order created successfully:', finalOrder.orderNumber);
    return finalOrder;
  } catch (error) {
    console.error('Error creating order:', error);
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
               )
             ) as items,
             u.name as customer_name,
             u.email as customer_email
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE p.user_id = ${artisanId}
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
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    }));
  } catch (error) {
    console.error('Error fetching artisan orders:', error);
    return [];
  }
}
