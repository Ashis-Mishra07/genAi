import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    console.log('Creating notifications table in Neon database...');
    
    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('order_placed', 'order_updated', 'product_sold', 'general')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `;

    // Insert some sample notifications for testing
    await sql`
      INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES 
      (
        'fc1c522a-1294-481b-945a-d3780a06e2b9', 
        'order_updated', 
        'Order Status Updated', 
        'Your order #ORD-001 has been updated to Processing status.',
        '{"orderId": "ORD-001", "status": "processing"}',
        false
      ),
      (
        'fc1c522a-1294-481b-945a-d3780a06e2b9', 
        'product_sold', 
        'Product Sold', 
        'Your product "Custom Art Piece" has been sold.',
        '{"productId": "PROD-123", "productName": "Custom Art Piece"}',
        false
      ),
      (
        'fc1c522a-1294-481b-945a-d3780a06e2b9', 
        'general', 
        'Welcome to Artisan Studio', 
        'Thank you for joining our platform. Start exploring amazing artisan products!',
        '{}',
        true
      )
      ON CONFLICT DO NOTHING;
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Notifications table created successfully with sample data',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Notifications table creation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create notifications table',
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Checking notifications table status...');
    
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `;

    const exists = result[0]?.exists || false;

    if (exists) {
      const count = await sql`SELECT COUNT(*) as count FROM notifications;`;
      return NextResponse.json({ 
        success: true, 
        exists: true,
        count: count[0]?.count || 0,
        message: 'Notifications table exists',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        exists: false,
        message: 'Notifications table does not exist',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Notifications table check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to check notifications table status'
    }, { status: 500 });
  }
}