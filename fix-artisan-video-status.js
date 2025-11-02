// Fix Artisan Video Status - Reset from PROCESSING to NOT_GENERATED
// Run this when video generation gets stuck

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function fixArtisanVideoStatus() {
  console.log('🔧 Fixing stuck artisan video generation statuses...\n');

  try {
    // Find artisans with PROCESSING status
    const stuckArtisans = await sql`
      SELECT id, name, email, specialty, documentation_video_status
      FROM users
      WHERE role = 'ARTISAN' 
      AND documentation_video_status = 'PROCESSING'
    `;

    console.log(`📊 Found ${stuckArtisans.length} artisan(s) with PROCESSING status\n`);

    if (stuckArtisans.length === 0) {
      console.log('✅ No stuck video generations found. All clear!');
      return;
    }

    // Display stuck artisans
    console.log('🎬 Stuck Artisan Videos:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    stuckArtisans.forEach((artisan, index) => {
      console.log(`${index + 1}. ${artisan.name}`);
      console.log(`   Email: ${artisan.email}`);
      console.log(`   Specialty: ${artisan.specialty || 'N/A'}`);
      console.log(`   Current Status: ${artisan.documentation_video_status}`);
      console.log('');
    });

    // Ask for confirmation (in non-interactive mode, we'll auto-confirm)
    console.log('🔄 Resetting all stuck videos to NOT_GENERATED status...\n');

    // Reset to NOT_GENERATED
    const result = await sql`
      UPDATE users
      SET documentation_video_status = 'NOT_GENERATED',
          updated_at = NOW()
      WHERE role = 'ARTISAN' 
      AND documentation_video_status = 'PROCESSING'
      RETURNING id, name, documentation_video_status
    `;

    console.log('✅ Successfully reset video statuses:\n');
    result.forEach((artisan, index) => {
      console.log(`${index + 1}. ${artisan.name} → ${artisan.documentation_video_status}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Done! You can now retry video generation from the admin panel.');
    console.log('📍 Go to: /video-generation → Artisan Documentation tab');
    console.log('🎯 Click "Generate Video" button for the artisan');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

// Also export a function to reset a specific artisan by email
async function fixSpecificArtisan(email) {
  console.log(`🔧 Fixing video status for artisan: ${email}\n`);

  try {
    const result = await sql`
      UPDATE users
      SET documentation_video_status = 'NOT_GENERATED',
          updated_at = NOW()
      WHERE email = ${email} AND role = 'ARTISAN'
      RETURNING id, name, email, documentation_video_status
    `;

    if (result.length === 0) {
      console.log('❌ No artisan found with that email');
      return;
    }

    console.log('✅ Successfully reset video status:');
    console.log(`   Name: ${result[0].name}`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   New Status: ${result[0].documentation_video_status}`);
    console.log('\n✨ You can now retry video generation!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Also function to set to FAILED status
async function markAsFailed() {
  console.log('🔧 Marking stuck artisan videos as FAILED...\n');

  try {
    const result = await sql`
      UPDATE users
      SET documentation_video_status = 'FAILED',
          updated_at = NOW()
      WHERE role = 'ARTISAN' 
      AND documentation_video_status = 'PROCESSING'
      RETURNING id, name, documentation_video_status
    `;

    console.log(`✅ Marked ${result.length} artisan video(s) as FAILED\n`);
    result.forEach((artisan, index) => {
      console.log(`${index + 1}. ${artisan.name} → ${artisan.documentation_video_status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the main function
const args = process.argv.slice(2);

if (args[0] === '--email' && args[1]) {
  // Fix specific artisan by email
  fixSpecificArtisan(args[1]);
} else if (args[0] === '--failed') {
  // Mark as FAILED instead of NOT_GENERATED
  markAsFailed();
} else {
  // Fix all stuck artisans
  fixArtisanVideoStatus();
}
