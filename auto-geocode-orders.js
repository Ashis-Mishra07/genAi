const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Simple geocoding function using the addresses in your orders
function getCoordinatesFromAddress(address) {
  // Extract city from the address object
  const city = address.city?.toLowerCase();
  const state = address.state?.toLowerCase();

  // Real coordinates for Indian cities
  const cityCoordinates = {
    bhubaneswar: { lat: 20.2961, lng: 85.8245 },
    cuttack: { lat: 20.4625, lng: 85.8828 },
    puri: { lat: 19.8135, lng: 85.8312 },
    berhampur: { lat: 19.3149, lng: 84.7941 },
    rourkela: { lat: 22.2604, lng: 84.8536 },
    sambalpur: { lat: 21.4669, lng: 83.9812 },
    balasore: { lat: 21.4942, lng: 86.9281 },
  };

  // Return coordinates if city is found
  if (city && cityCoordinates[city]) {
    return cityCoordinates[city];
  }

  // Default to Bhubaneswar if city not found but state is Odisha/Orissa
  if (state && (state.includes("odisha") || state.includes("orissa"))) {
    return cityCoordinates["bhubaneswar"];
  }

  return null;
}

async function autoGeocodeOrders() {
  try {
    console.log(
      "🔄 Auto-geocoding orders based on their shipping addresses..."
    );

    // Get orders without coordinates
    const ordersToGeocode = await prisma.orders.findMany({
      where: {
        OR: [{ shipping_latitude: null }, { shipping_longitude: null }],
      },
      select: {
        id: true,
        order_number: true,
        shipping_address: true,
      },
    });

    console.log(
      `📍 Found ${ordersToGeocode.length} orders that need geocoding`
    );

    for (const order of ordersToGeocode) {
      if (order.shipping_address) {
        const coords = getCoordinatesFromAddress(order.shipping_address);

        if (coords) {
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              shipping_latitude: coords.lat,
              shipping_longitude: coords.lng,
              location_geocoded_at: new Date(),
            },
          });

          const city = order.shipping_address.city || "Unknown";
          console.log(
            `✅ Geocoded ${order.order_number} - ${city} (${coords.lat}, ${coords.lng})`
          );
        } else {
          console.log(
            `⚠️ Could not geocode ${order.order_number} - unknown location`
          );
        }
      }
    }

    // Show final count
    const totalWithCoords = await prisma.orders.count({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null },
      },
    });

    console.log(
      `\n🎉 ${totalWithCoords} orders now have coordinates and will show on map!`
    );
  } catch (error) {
    console.error("❌ Error auto-geocoding orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

autoGeocodeOrders();
