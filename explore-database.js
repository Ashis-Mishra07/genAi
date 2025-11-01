const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function exploreDatabase() {
  try {
    console.log("🔍 Exploring database structure...");

    // Check if there are more orders
    const totalOrders = await prisma.orders.count();
    console.log(`📊 Total orders: ${totalOrders}`);

    // Check different order statuses
    const ordersByStatus = await prisma.orders.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    console.log("📈 Orders by status:");
    ordersByStatus.forEach((group) => {
      console.log(`  - ${group.status || "NULL"}: ${group._count.status}`);
    });

    // Check if there are any other order-related tables
    // Let's see if there are cart items or other related data
    try {
      const cartItems = await prisma.cart_items.count();
      console.log(`🛒 Cart items: ${cartItems}`);
    } catch (e) {
      console.log("🛒 No cart_items table found");
    }

    // Check users to see if there are more customers
    const totalUsers = await prisma.users.count();
    console.log(`👥 Total users: ${totalUsers}`);

    // Get all users with their order counts
    const usersWithOrders = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            orders_orders_customer_idTousers: true,
          },
        },
      },
    });

    console.log("👥 Users and their order counts:");
    usersWithOrders.forEach((user) => {
      console.log(
        `  - ${user.name} (${user.email}): ${user._count.orders_orders_customer_idTousers} orders`
      );
    });
  } catch (error) {
    console.error("❌ Error exploring database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exploreDatabase();
