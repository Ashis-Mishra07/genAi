import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Check if orders table exists
    const ordersTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      )
    `;

    // Check if order_items table exists
    const orderItemsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      )
    `;

    // Check if notifications table exists
    const notificationsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      )
    `;

    // Check if all main tables exist
    const usersTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `;

    const productsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )
    `;

    const tablesStatus = {
      users: usersTableExists[0]?.exists || false,
      products: productsTableExists[0]?.exists || false,
      orders: ordersTableExists[0]?.exists || false,
      order_items: orderItemsTableExists[0]?.exists || false,
      notifications: notificationsTableExists[0]?.exists || false,
    };

    const allTablesExist = Object.values(tablesStatus).every(exists => exists);

    return NextResponse.json({
      success: true,
      tablesInitiated: allTablesExist,
      tablesStatus,
      message: allTablesExist 
        ? 'All required tables exist in the database' 
        : 'Some tables are missing. Run the initialization endpoint.'
    });
  } catch (error: any) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check database status',
        details: error.message
      },
      { status: 500 }
    );
  }
}
