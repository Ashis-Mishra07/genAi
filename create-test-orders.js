const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestOrdersWithCoordinates() {
  try {
    console.log("🔄 Creating test orders with coordinates...");

    // Get the existing customer ID
    const existingOrder = await prisma.orders.findFirst({
      select: { customer_id: true },
    });

    if (!existingOrder) {
      console.log("❌ No existing order found to get customer ID");
      return;
    }

    const customerId = existingOrder.customer_id;

    // Sample coordinates in Odisha
    const locations = [
      { name: "Cuttack", lat: 20.4625, lng: 85.8828 },
      { name: "Bhubaneswar_2", lat: 20.2761, lng: 85.8145 },
      { name: "Puri", lat: 19.8135, lng: 85.8312 },
      { name: "Berhampur", lat: 19.3149, lng: 84.7941 },
      { name: "Rourkela", lat: 22.2604, lng: 84.8536 },
    ];

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const orderNumber = `ORD-2025-${String(Date.now() + i).slice(-6)}`;

      const newOrder = await prisma.orders.create({
        data: {
          order_number: orderNumber,
          customer_id: customerId,
          status: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"][
            Math.floor(Math.random() * 4)
          ],
          total: Math.floor(Math.random() * 50000) + 10000,
          shipping_address: `Test Address in ${location.name}, Odisha`,
          shipping_latitude: location.lat,
          shipping_longitude: location.lng,
          created_at: new Date(),
        },
      });

      console.log(
        `✅ Created order ${orderNumber} at ${location.name} (${location.lat}, ${location.lng})`
      );
    }

    // Count total orders with coordinates
    const coordsCount = await prisma.orders.count({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null },
      },
    });

    console.log(`🎉 Total orders with coordinates: ${coordsCount}`);
  } catch (error) {
    console.error("❌ Error creating test orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrdersWithCoordinates();
