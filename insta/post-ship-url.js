const InstagramPoster = require("./instagram-poster");
const path = require("path");
const fs = require("fs");

async function postShipImageViaUrl() {
  try {
    console.log("🚀 Starting Instagram post with ship.jpg via URL method...");

    // Initialize Instagram poster
    const poster = new InstagramPoster();

    // Test connection first
    console.log("\n=== Testing API Connection ===");
    const connectionOk = await poster.testConnection();

    if (!connectionOk) {
      console.log("❌ API connection failed. Please check your credentials.");
      return;
    }

    // For demonstration, let's use a sample image URL
    // In production, you'd upload your local image to a CDN or image hosting service
    const imageUrl =
      "https://images.unsplash.com/photo-1757417983938-2c2a931d41aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8";
    const caption =
      "🚢 Beautiful ship sailing the waters! ⚓ #ship #sailing #ocean #travel #adventure #instagram #automated";

    console.log("\n=== Posting Ship Image Via URL ===");
    console.log(`🌐 Image URL: ${imageUrl}`);
    console.log(`📝 Caption: ${caption}`);

    // Post the image using URL method
    const mediaId = await poster.postImageByUrl(imageUrl, caption);

    console.log("\n🎉 SUCCESS! Your ship image has been posted to Instagram!");
    console.log(`📱 Media ID: ${mediaId}`);
    console.log("✨ Check your Instagram account to see the post!");
  } catch (error) {
    console.error("\n💥 Error posting to Instagram:", error.message);
    console.error("Full error:", error.response?.data || error);
  }
}

// Run the function
if (require.main === module) {
  postShipImageViaUrl();
}

module.exports = postShipImageViaUrl;
