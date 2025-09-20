import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('Test Orders API: Starting database check');
    
    // Check if orders table exists and has data
    const ordersCount = await sql`SELECT COUNT(*) as count FROM orders`;
    console.log('Test Orders API: Orders count:', ordersCount);
    
    // Check if users table has any admins
    const adminCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`;
    console.log('Test Orders API: Admin count:', adminCount);
    
    // Get sample orders (limit 3)
    const sampleOrders = await sql`
      SELECT o.id, o.order_number, o.status, o.total, o.customer_id, o.created_at,
             u.email as customer_email, u.role as customer_role
      FROM orders o 
      LEFT JOIN users u ON o.customer_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 3
    `;
    console.log('Test Orders API: Sample orders:', sampleOrders);
    
    // Get sample users
    const sampleUsers = await sql`
      SELECT id, email, role, name, is_active 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    console.log('Test Orders API: Sample users:', sampleUsers);
    
    return NextResponse.json({
      success: true,
      data: {
        ordersCount: ordersCount[0].count,
        adminCount: adminCount[0].count,
        sampleOrders,
        sampleUsers,
        databaseUrl: process.env.DATABASE_URL ? 'Present' : 'Missing',
        jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing'
      }
    });
  } catch (error: any) {
    console.error('Test Orders API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        databaseUrl: process.env.DATABASE_URL ? 'Present' : 'Missing'
      },
      { status: 500 }
    );
  }
}
