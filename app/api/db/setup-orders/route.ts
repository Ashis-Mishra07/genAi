import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('DB Setup: Starting comprehensive database setup');
    
    // Create orders table with proper structure
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id UUID REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'pending',
        total DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'cod',
        tracking_number VARCHAR(100),
        estimated_delivery DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('DB Setup: Orders table created/verified');
    
    // Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        artisan_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('DB Setup: Order items table created/verified');
    
    // Create notifications table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('DB Setup: Notifications table created/verified');
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `;
    
    console.log('DB Setup: Indexes created/verified');
    
    // Check final table structures
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const orderItemsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const notificationsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables: {
        orders: ordersColumns,
        order_items: orderItemsColumns,
        notifications: notificationsColumns
      }
    });
  } catch (error: any) {
    console.error('DB Setup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
