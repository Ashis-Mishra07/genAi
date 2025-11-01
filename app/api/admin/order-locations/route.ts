import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCoordinatesFromAddress(address: any) {
  const city = address?.city?.toLowerCase();
  const state = address?.state?.toLowerCase();
  
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'cuttack': { lat: 20.4625, lng: 85.8828 },
    'puri': { lat: 19.8135, lng: 85.8312 },
    'balasore': { lat: 21.4942, lng: 86.9281 },
    'baleswar': { lat: 21.4942, lng: 86.9281 },
    'berhampur': { lat: 19.3149, lng: 84.7941 },
    'rourkela': { lat: 22.2604, lng: 84.8536 }
  };
  
  if (city && cityCoordinates[city]) {
    return cityCoordinates[city];
  }
  
  if (state && (state.includes('odisha') || state.includes('orissa'))) {
    return cityCoordinates['bhubaneswar'];
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'geocode_all') {
      const ordersToGeocode = await prisma.orders.findMany({
        where: {
          OR: [
            { shipping_latitude: null },
            { shipping_longitude: null }
          ]
        },
        select: {
          id: true,
          order_number: true,
          shipping_address: true
        }
      });

      if (ordersToGeocode.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'All orders already have coordinates!'
        });
      }

      let geocodedCount = 0;
      
      for (const order of ordersToGeocode) {
        if (order.shipping_address) {
          const coords = getCoordinatesFromAddress(order.shipping_address);
          
          if (coords) {
            await prisma.orders.update({
              where: { id: order.id },
              data: {
                shipping_latitude: coords.lat,
                shipping_longitude: coords.lng,
                location_geocoded_at: new Date()
              }
            });
            geocodedCount++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully geocoded ${geocodedCount} orders!`,
        geocoded: geocodedCount
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in admin order-locations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
