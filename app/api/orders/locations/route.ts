import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple function to get coordinates from address using Gemini or fallback
async function getCoordinatesFromAddress(address: any) {
  try {
    // Extract address components
    const addressStr = `${address.address || ''}, ${address.city || ''}, ${address.state || ''}, ${address.country || ''}`.trim();
    
    // Simple coordinate mapping for common Indian cities
    const cityCoords: any = {
  // Odisha
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'cuttack': { lat: 20.4625, lng: 85.8828 },
  'puri': { lat: 19.8135, lng: 85.8312 },
  'balasore': { lat: 21.4942, lng: 86.9281 },
  'baleswar': { lat: 21.4942, lng: 86.9281 },
  'berhampur': { lat: 19.3149, lng: 84.7941 },
  'rourkela': { lat: 22.2604, lng: 84.8536 },
  'sambalpur': { lat: 21.4669, lng: 83.9812 },
  'baripada': { lat: 21.9330, lng: 86.7512 },
  'angul': { lat: 20.8400, lng: 85.1000 },
  'kendrapara': { lat: 20.5000, lng: 86.4200 },
  'jeypore': { lat: 18.8586, lng: 82.5715 },

  // Metro Cities
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },

  // Other Indian Cities
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'haridwar': { lat: 29.9457, lng: 78.1642 },
  'meerut': { lat: 28.9845, lng: 77.7064 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'shillong': { lat: 25.5788, lng: 91.8933 },
  'aizawl': { lat: 23.7271, lng: 92.7176 },
  'imphal': { lat: 24.8170, lng: 93.9368 },
  'kohima': { lat: 25.6751, lng: 94.1086 },
  'itanagar': { lat: 27.0844, lng: 93.6053 },
  'gangtok': { lat: 27.3314, lng: 88.6138 },
  'silchar': { lat: 24.8333, lng: 92.7789 },
  'dimapur': { lat: 25.9063, lng: 93.7274 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'margao': { lat: 15.2720, lng: 73.9581 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'nellore': { lat: 14.4426, lng: 79.9865 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'warangal': { lat: 17.9784, lng: 79.5941 },
  'nizamabad': { lat: 18.6725, lng: 78.0941 },

  // International (optional but useful)
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'tokyo': { lat: 35.6895, lng: 139.6917 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'dubai': { lat: 25.2769, lng: 55.2962 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6511, lng: -79.3839 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'hong kong': { lat: 22.3193, lng: 114.1694 }
};

    
    const city = (address.city || '').toLowerCase();
    if (cityCoords[city]) {
      return cityCoords[city];
    }
    
    // Default to Bhubaneswar if no match
    return { lat: 20.2961, lng: 85.8245 };
    
  } catch (error) {
    console.error('Error geocoding:', error);
    return { lat: 20.2961, lng: 85.8245 }; // Default coordinates
  }
}

export async function GET() {
  try {
    console.log('🔍 Fetching ALL orders and geocoding them...');
    
    // Get ALL orders from database
    const allOrders = await prisma.orders.findMany({
      select: {
        id: true,
        order_number: true,
        status: true,
        total: true,
        shipping_address: true,
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

    console.log(`📍 Found ${allOrders.length} total orders`);

    // Process each order and get coordinates
    const ordersWithCoords = [];
    
    for (const order of allOrders) {
      let lat = order.shipping_latitude;
      let lng = order.shipping_longitude;
      
      // If no coordinates, get them from address
      if (!lat || !lng) {
        if (order.shipping_address) {
          const coords = await getCoordinatesFromAddress(order.shipping_address);
          lat = coords.lat;
          lng = coords.lng;
          
          // Update database with new coordinates
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              shipping_latitude: lat,
              shipping_longitude: lng,
              location_geocoded_at: new Date()
            }
          });
          
          console.log(`✅ Geocoded ${order.order_number}: ${lat}, ${lng}`);
        }
      }
      
      // Add to result if has coordinates
      if (lat && lng) {
        ordersWithCoords.push({
          id: order.id,
          order_number: order.order_number,
          status: order.status || 'PENDING',
          total_amount: Number(order.total),
          shipping_latitude: lat,
          shipping_longitude: lng,
          created_at: order.created_at,
          customer: {
            name: order.users_orders_customer_idTousers?.name || 'Unknown Customer',
            email: order.users_orders_customer_idTousers?.email || 'unknown@email.com'
          }
        });
      }
    }

    const stats = {
      total: ordersWithCoords.length,
      geocoded: ordersWithCoords.length,
      pending: 0,
      by_status: {} as Record<string, number>
    };

    // Calculate status distribution
    ordersWithCoords.forEach(order => {
      stats.by_status[order.status] = (stats.by_status[order.status] || 0) + 1;
    });

    console.log(`🎉 Returning ${ordersWithCoords.length} orders with coordinates`);

    return NextResponse.json({
      success: true,
      orders: ordersWithCoords,
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