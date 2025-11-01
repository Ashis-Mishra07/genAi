const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addCoordinatesToExistingOrder() {
  try {
    console.log("🔄 Adding coordinates to existing order...");

    // Update the existing order with Bhubaneswar coordinates
    const updatedOrder = await prisma.orders.update({
      where: {
        order_number: "ORD-2025-061705",
      },
      data: {
        shipping_latitude: 20.2961,
        shipping_longitude: 85.8245,
      },
    });

    console.log(
      "✅ Updated order with coordinates:",
      updatedOrder.order_number
    );
    console.log(
      `   Coordinates: ${updatedOrder.shipping_latitude}, ${updatedOrder.shipping_longitude}`
    );

    // Verify the update
    const verifyOrder = await prisma.orders.findUnique({
      where: { order_number: "ORD-2025-061705" },
      select: {
        order_number: true,
        shipping_latitude: true,
        shipping_longitude: true,
      },
    });

    console.log("🔍 Verification:", verifyOrder);
  } catch (error) {
    console.error("❌ Error updating order:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addCoordinatesToExistingOrder();
