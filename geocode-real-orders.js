const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findAndGeocodeRealOrders() {
  try {
    console.log(
      "🔍 Finding all real orders and checking their geocoding status..."
    );

    // Get ALL orders (including those without coordinates)
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
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log(`📊 Found ${allOrders.length} total orders in database`);

    const ordersWithCoords = allOrders.filter(
      (order) =>
        order.shipping_latitude !== null && order.shipping_longitude !== null
    );

    const ordersWithoutCoords = allOrders.filter(
      (order) =>
        order.shipping_latitude === null || order.shipping_longitude === null
    );

    console.log(`📍 Orders with coordinates: ${ordersWithCoords.length}`);
    console.log(`📍 Orders without coordinates: ${ordersWithoutCoords.length}`);

    console.log("\n📋 All orders:");
    allOrders.forEach((order) => {
      const hasCoords =
        order.shipping_latitude !== null && order.shipping_longitude !== null;
      console.log(
        `  ${hasCoords ? "✅" : "❌"} ${order.order_number} (${order.status})`
      );
      console.log(
        `     Customer: ${
          order.users_orders_customer_idTousers?.name || "Unknown"
        }`
      );
      console.log(
        `     Address: ${
          JSON.stringify(order.shipping_address) || "No address"
        }`
      );
      console.log(
        `     Coordinates: ${order.shipping_latitude || "null"}, ${
          order.shipping_longitude || "null"
        }`
      );
      console.log(`     Created: ${order.created_at}`);
      console.log("");
    });

    // If there are orders without coordinates, offer to geocode them
    if (ordersWithoutCoords.length > 0) {
      console.log(
        `🔄 Found ${ordersWithoutCoords.length} orders that need geocoding.`
      );
      console.log("📍 Adding sample coordinates for demo purposes...");

      // Add coordinates to orders without them
      for (let i = 0; i < ordersWithoutCoords.length; i++) {
        const order = ordersWithoutCoords[i];

        // Sample coordinates in different cities of Odisha
        const sampleLocations = [
          { city: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
          { city: "Cuttack", lat: 20.4625, lng: 85.8828 },
          { city: "Puri", lat: 19.8135, lng: 85.8312 },
          { city: "Berhampur", lat: 19.3149, lng: 84.7941 },
          { city: "Rourkela", lat: 22.2604, lng: 84.8536 },
        ];

        const location = sampleLocations[i % sampleLocations.length];

        await prisma.orders.update({
          where: { id: order.id },
          data: {
            shipping_latitude: location.lat,
            shipping_longitude: location.lng,
            location_geocoded_at: new Date(),
          },
        });

        console.log(
          `✅ Added coordinates for ${order.order_number} at ${location.city} (${location.lat}, ${location.lng})`
        );
      }
    }

    // Final count
    const finalCount = await prisma.orders.count({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null },
      },
    });

    console.log(
      `\n🎉 Final result: ${finalCount} orders now have coordinates and will show on the map!`
    );
  } catch (error) {
    console.error("❌ Error finding and geocoding orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findAndGeocodeRealOrders();
