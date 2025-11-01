const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function geocodeRealAddresses() {
  try {
    console.log(
      "🔄 Adding coordinates to real orders based on their actual addresses..."
    );

    // Update the Cuttack order with real Cuttack coordinates
    const cuttackOrder = await prisma.orders.findFirst({
      where: { order_number: "ORD-2025-394110" },
    });

    if (cuttackOrder && !cuttackOrder.shipping_latitude) {
      await prisma.orders.update({
        where: { order_number: "ORD-2025-394110" },
        data: {
          shipping_latitude: 20.4625, // Real Cuttack coordinates
          shipping_longitude: 85.8828,
          location_geocoded_at: new Date(),
        },
      });

      console.log("✅ Added real Cuttack coordinates to ORD-2025-394110");
      console.log("   Address: Scr-15, Sec-2, Markatnagar, Cuttack, Odisha");
      console.log("   Coordinates: 20.4625, 85.8828");
    }

    // Verify both orders now have coordinates
    const finalOrders = await prisma.orders.findMany({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null },
      },
      select: {
        order_number: true,
        shipping_latitude: true,
        shipping_longitude: true,
        users_orders_customer_idTousers: {
          select: { name: true },
        },
      },
    });

    console.log(
      `\n📊 Final result: ${finalOrders.length} real orders with coordinates:`
    );
    finalOrders.forEach((order) => {
      console.log(
        `  ✅ ${order.order_number} - ${order.users_orders_customer_idTousers?.name}`
      );
      console.log(
        `     Coordinates: ${order.shipping_latitude}, ${order.shipping_longitude}`
      );
    });

    console.log(`\n🎉 Map will now show ${finalOrders.length} real orders!`);
  } catch (error) {
    console.error("❌ Error geocoding real addresses:", error);
  } finally {
    await prisma.$disconnect();
  }
}

geocodeRealAddresses();
