import { prisma } from '@/lib/db/prisma';

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

interface AddressComponent {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export class GeocodingService {
  private static readonly GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
  
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const encodedAddress = encodeURIComponent(address);
      const url = `${this.GOOGLE_GEOCODING_API_URL}?address=${encodedAddress}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0] as AddressComponent;
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng
        };
      }
      
      console.warn(`Geocoding failed for address: ${address}. Status: ${data.status}`);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static async geocodeOrderAddress(orderId: string): Promise<boolean> {
    try {
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          shipping_address: true,
          shipping_latitude: true,
          shipping_longitude: true,
          location_geocoded_at: true
        }
      });

      if (!order || !order.shipping_address) {
        return false;
      }

      // Skip if already geocoded recently (within 30 days)
      if (order.location_geocoded_at) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (order.location_geocoded_at > thirtyDaysAgo) {
          return true;
        }
      }

      // Extract address string from JSON
      let addressString = '';
      if (typeof order.shipping_address === 'string') {
        addressString = order.shipping_address;
      } else if (typeof order.shipping_address === 'object' && order.shipping_address !== null) {
        const addr = order.shipping_address as any;
        addressString = `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.country || ''} ${addr.zipCode || ''}`.trim();
      }

      if (!addressString) {
        return false;
      }

      const coordinates = await this.geocodeAddress(addressString);
      if (!coordinates) {
        return false;
      }

      // Update order with coordinates
      await prisma.orders.update({
        where: { id: orderId },
        data: {
          shipping_latitude: coordinates.latitude,
          shipping_longitude: coordinates.longitude,
          location_geocoded_at: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error(`Failed to geocode order ${orderId}:`, error);
      return false;
    }
  }

  static async geocodeAllPendingOrders(): Promise<{ success: number; failed: number }> {
    const pendingOrders = await prisma.orders.findMany({
      where: {
        OR: [
          { shipping_latitude: null },
          { shipping_longitude: null },
          { location_geocoded_at: null }
        ],
        shipping_address: { not: null }
      },
      select: { id: true }
    });

    let success = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      const result = await this.geocodeOrderAddress(order.id);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
  }
}