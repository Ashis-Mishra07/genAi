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
        OR: [{ shipping_latitude: null }, { shipping_longitude: null }],
      },
      select: {
        id: true,
        order_number: true,
        shipping_address: true,
      },
    });

    console.log(`📋 Found ${orders.length} orders to geocode`);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      console.log(
        `\n🔄 Processing order ${i + 1}/${orders.length}: #${
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
        // Update order with coordinates
        await prisma.orders.update({
          where: { id: order.id },
          data: {
            shipping_latitude: coordinates.latitude,
            shipping_longitude: coordinates.longitude,
            location_geocoded_at: new Date(),
          },
        });

        console.log(
          `✅ Geocoded: ${coordinates.latitude}, ${coordinates.longitude}`
        );
        successCount++;
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
    const geocodedOrders = await prisma.orders.count({
      where: {
        shipping_latitude: { not: null },
        shipping_longitude: { not: null },
      },
    });

    console.log(`📊 Total orders with coordinates: ${geocodedOrders}`);
  } catch (error) {
    console.error("❌ Error geocoding orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the geocoding
geocodeAllOrders();
