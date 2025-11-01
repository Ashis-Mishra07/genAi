import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Fetching orders with coordinates from database...');
    
    // Get all orders that have coordinates (from our previous geocoding)
    const orders = await prisma.orders.findMany({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null }
      },
      select: {
        id: true,
        order_number: true,
        status: true,
        total: true,
        shipping_latitude: true,
        shipping_longitude: true,
        created_at: true,
        users_orders_customer_idTousers: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📍 Found ${orders.length} orders with coordinates`);

    // Transform the data to match our frontend interface
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status || 'PENDING',
      total_amount: Number(order.total),
      shipping_latitude: order.shipping_latitude,
      shipping_longitude: order.shipping_longitude,
      created_at: order.created_at,
      customer: {
        name: order.users_orders_customer_idTousers?.name || 'Unknown Customer',
        email: order.users_orders_customer_idTousers?.email || 'unknown@email.com'
      }
    }));

    const stats = {
      total: transformedOrders.length,
      geocoded: transformedOrders.length,
      pending: 0,
      by_status: {} as Record<string, number>
    };

    // Calculate status distribution
    transformedOrders.forEach(order => {
      stats.by_status[order.status] = (stats.by_status[order.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}