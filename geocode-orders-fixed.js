const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env.local" });

const prisma = new PrismaClient();

async function geocodeAddress(address) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key not found");
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
    }

    console.warn(
      `Geocoding failed for address: ${address}. Status: ${data.status}`
    );
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function geocodeAllOrders() {
  try {
    console.log("🔍 Fetching orders from database...");

    const orders = await prisma.orders.findMany({
      where: {
        shipping_address: { not: null },
      },
      select: {
        id: true,
        order_number: true,
        shipping_address: true,
        shipping_latitude: true,
        shipping_longitude: true,
      },
    });

    console.log(`📋 Found ${orders.length} orders total`);

    const ordersToGeocode = orders.filter(
      (order) => !order.shipping_latitude || !order.shipping_longitude
    );

    console.log(`📋 Found ${ordersToGeocode.length} orders to geocode`);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < ordersToGeocode.length; i++) {
      const order = ordersToGeocode[i];
      console.log(
        `\n🔄 Processing order ${i + 1}/${ordersToGeocode.length}: #${
          order.order_number
        }`
      );

      // Extract address string from JSON
      let addressString = "";
      if (typeof order.shipping_address === "string") {
        addressString = order.shipping_address;
      } else if (
        typeof order.shipping_address === "object" &&
        order.shipping_address !== null
      ) {
        const addr = order.shipping_address;
        const parts = [
          addr.street || addr.address || "",
          addr.city || "",
          addr.state || "",
          addr.country || "",
          addr.zipCode || addr.zip || addr.postal_code || "",
        ].filter((part) => part && part.trim());
        addressString = parts.join(", ");
      }

      if (!addressString) {
        console.log(
          `❌ No valid address found for order #${order.order_number}`
        );
        failedCount++;
        continue;
      }

      console.log(`📍 Address: ${addressString}`);

      // Geocode the address
      const coordinates = await geocodeAddress(addressString);

      if (coordinates) {
        try {
          // Update order with coordinates using raw SQL to avoid schema issues
          await prisma.$executeRaw`
            UPDATE orders 
            SET 
              shipping_latitude = ${coordinates.latitude}, 
              shipping_longitude = ${coordinates.longitude},
              location_geocoded_at = ${new Date()}
            WHERE id = ${order.id}
          `;

          console.log(
            `✅ Geocoded: ${coordinates.latitude}, ${coordinates.longitude}`
          );
          successCount++;
        } catch (updateError) {
          console.log(
            `❌ Failed to update order ${order.order_number}:`,
            updateError.message
          );
          failedCount++;
        }
      } else {
        console.log(`❌ Failed to geocode address`);
        failedCount++;
      }

      // Rate limiting - wait 200ms between requests to avoid hitting API limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\n🎉 Geocoding complete!`);
    console.log(`✅ Successfully geocoded: ${successCount} orders`);
    console.log(`❌ Failed to geocode: ${failedCount} orders`);

    // Verify results
    const geocodedOrders = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE shipping_latitude IS NOT NULL 
      AND shipping_longitude IS NOT NULL
    `;

    console.log(`📊 Total orders with coordinates: ${geocodedOrders[0].count}`);
  } catch (error) {
    console.error("❌ Error geocoding orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the geocoding
geocodeAllOrders();
