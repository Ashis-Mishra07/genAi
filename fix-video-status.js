// Manual Database Update Script
// Use this when n8n generates a video but doesn't update the database

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function updateProductVideo() {
  console.log('🔍 Checking for products with PROCESSING status...\n');

  try {
    // Find products with PROCESSING status
    const processingProducts = await sql`
      SELECT id, name, video_status, video_url 
      FROM products 
      WHERE video_status = 'PROCESSING'
      ORDER BY updated_at DESC
    `;

    if (processingProducts.length === 0) {
      console.log('✅ No products stuck in PROCESSING state');
      
      // Show all products with their video status
      const allProducts = await sql`
        SELECT id, name, video_status, video_url 
        FROM products 
        ORDER BY updated_at DESC 
        LIMIT 10
      `;
      
      console.log('\n📋 Recent products:');
      allProducts.forEach(p => {
        console.log(`  - ${p.name}: ${p.video_status || 'NOT_GENERATED'} ${p.video_url ? '✅' : '❌'}`);
      });
      
      return;
    }

    console.log(`Found ${processingProducts.length} product(s) in PROCESSING state:\n`);
    
    processingProducts.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Status: ${product.video_status}`);
      console.log(`   Current URL: ${product.video_url || 'None'}\n`);
    });

    // Prompt for manual update
    console.log('─────────────────────────────────────────────');
    console.log('📝 To manually update a product with video URL:');
    console.log('─────────────────────────────────────────────\n');
    
    console.log('Option 1: Mark as FAILED (if generation actually failed)');
    console.log('Run this in your terminal:\n');
    processingProducts.forEach(product => {
      console.log(`await sql\`UPDATE products SET video_status = 'FAILED' WHERE id = '${product.id}'\`;\n`);
    });

    console.log('\nOption 2: Add video URL (if you have the Google Drive link)');
    console.log('Replace VIDEO_URL with your actual Google Drive URL:\n');
    processingProducts.forEach(product => {
      console.log(`await sql\`UPDATE products SET video_url = 'VIDEO_URL', video_status = 'COMPLETED' WHERE id = '${product.id}'\`;\n`);
    });

    // Ask if user wants to mark as failed
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nDo you want to mark these products as FAILED? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        for (const product of processingProducts) {
          await sql`
            UPDATE products 
            SET video_status = 'FAILED', updated_at = NOW()
            WHERE id = ${product.id}
          `;
          console.log(`✅ Marked "${product.name}" as FAILED`);
        }
        console.log('\n✨ All products updated!');
      } else {
        console.log('\n❌ No changes made. Add video URLs manually.');
      }
      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Also export a function to add video URL
async function addVideoUrl(productId, videoUrl) {
  try {
    await sql`
      UPDATE products 
      SET video_url = ${videoUrl},
          video_status = 'COMPLETED',
          updated_at = NOW()
      WHERE id = ${productId}
    `;
    console.log('✅ Video URL updated successfully!');
    
    // Verify the update
    const updated = await sql`
      SELECT name, video_status, video_url 
      FROM products 
      WHERE id = ${productId}
    `;
    
    console.log('\n📦 Updated product:');
    console.log(updated[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
updateProductVideo();

// Export for manual use
module.exports = { addVideoUrl };
