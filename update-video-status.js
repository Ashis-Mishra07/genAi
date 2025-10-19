// Update products that are stuck in PROCESSING with completed videos
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// These are the products shown in your frontend as "Processing"
const productsToUpdate = [
  {
    id: '7289fb25-f481-4ac8-a828-eea1c9bde78d', // cycle
    name: 'cycle',
    // We'll mark as FAILED since we don't have the video URL yet
    // Once you get the URL from Google Drive, run the other script
  },
  {
    id: '26c8da8f-cdb3-4d78-896e-f1b2cb0d13ca', // paint brush  
    name: 'paint brush',
  }
];

async function resetProcessingStatus() {
  console.log('🔄 Resetting PROCESSING products...\n');

  try {
    for (const product of productsToUpdate) {
      await sql`
        UPDATE products 
        SET video_status = 'NOT_GENERATED', 
            updated_at = NOW()
        WHERE id = ${product.id}
      `;
      console.log(`✅ Reset "${product.name}" to NOT_GENERATED`);
    }

    console.log('\n✨ Done! Products are ready for new video generation.');
    console.log('\n📋 Next steps:');
    console.log('1. Go to admin video generation page');
    console.log('2. Click "Generate Video" again');
    console.log('3. Make sure the n8n "Update Database" node has PostgreSQL credentials');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Alternative: If you have the Google Drive video URL from n8n
async function addVideoFromDrive(productId, googleDriveUrl) {
  console.log('📹 Adding video URL to product...\n');
  
  try {
    await sql`
      UPDATE products 
      SET video_url = ${googleDriveUrl},
          video_status = 'COMPLETED',
          updated_at = NOW()
      WHERE id = ${productId}
    `;
    
    console.log('✅ Video URL added successfully!');
    
    // Verify
    const product = await sql`
      SELECT name, video_status, video_url 
      FROM products 
      WHERE id = ${productId}
    `;
    
    console.log('\n📦 Updated Product:');
    console.log(product[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if user wants to add video URL or reset status
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎬 Video Status Update Tool\n');
console.log('Choose an option:');
console.log('1. Reset products to NOT_GENERATED (to try again)');
console.log('2. Add video URL from Google Drive (if you have it)\n');

readline.question('Enter choice (1 or 2): ', async (choice) => {
  if (choice === '1') {
    await resetProcessingStatus();
  } else if (choice === '2') {
    readline.question('Enter Product ID (cycle or paint brush): ', async (productName) => {
      const product = productsToUpdate.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
      
      if (!product) {
        console.log('❌ Product not found');
        readline.close();
        return;
      }
      
      readline.question('Enter Google Drive video URL: ', async (url) => {
        await addVideoFromDrive(product.id, url);
        readline.close();
      });
    });
    return;
  } else {
    console.log('❌ Invalid choice');
  }
  readline.close();
});
