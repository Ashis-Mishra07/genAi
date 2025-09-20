import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('Test Customer API: Starting test');
    
    // Check user authentication
    const user = await getCurrentUser(request);
    console.log('Test Customer API: User:', user);
    
    // Check database connectivity
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('orders', 'order_items', 'users', 'products')
      ORDER BY table_name
    `;
    console.log('Test Customer API: Available tables:', tablesCheck);
    
    // Check if user is a customer and can access orders
    let customerTestResult = null;
    if (user && user.role === 'CUSTOMER') {
      try {
        const ordersCount = await sql`
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE customer_id = ${user.id}
        `;
        customerTestResult = {
          customerOrdersCount: ordersCount[0].count,
          canAccessDatabase: true
        };
      } catch (dbError: any) {
        customerTestResult = {
          canAccessDatabase: false,
          error: dbError.message
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        } : null,
        availableTables: tablesCheck.map(t => t.table_name),
        customerTest: customerTestResult,
        databaseUrl: process.env.DATABASE_URL ? 'Present' : 'Missing',
        jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing'
      }
    });
  } catch (error: any) {
    console.error('Test Customer API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
