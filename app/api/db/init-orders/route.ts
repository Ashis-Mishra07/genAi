import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Only create notifications table since others already exist
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('order_placed', 'order_updated', 'product_sold', 'general')),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          data JSONB DEFAULT '{}',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create notifications indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`;

    return NextResponse.json({
      success: true,
      message: 'Notifications table created successfully'
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize notifications table',
        details: error.message
      },
      { status: 500 }
    );
  }
}
