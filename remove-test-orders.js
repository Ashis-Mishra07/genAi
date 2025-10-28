const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function removeTestOrders() {
  try {
    console.log("🔄 Removing test orders...");

    // Remove test orders I created
    const testOrderNumbers = [
      "ORD-2025-869757",
      "ORD-2025-871395",
      "ORD-2025-871900",
      "ORD-2025-872306",
      "ORD-2025-872742",
    ];

    for (const orderNumber of testOrderNumbers) {
      try {
        await prisma.orders.delete({
          where: { order_number: orderNumber },
        });
        console.log(`✅ Deleted test order: ${orderNumber}`);
      } catch (error) {
        console.log(
          `⚠️ Test order ${orderNumber} not found or already deleted`
        );
      }
    }

    // Verify remaining orders
    const remainingOrders = await prisma.orders.findMany({
      select: {
        order_number: true,
        status: true,
        users_orders_customer_idTousers: {
          select: { name: true },
        },
      },
    });

    console.log(`\n📊 Remaining orders: ${remainingOrders.length}`);
    remainingOrders.forEach((order) => {
      console.log(
        `  - ${order.order_number} (${order.status}) - ${
          order.users_orders_customer_idTousers?.name || "Unknown"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error removing test orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestOrders();
