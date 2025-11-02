// Check artisan photograph in database
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkArtisanPhotograph() {
  console.log('🔍 Checking artisan photographs in database...\n');

  try {
    const artisans = await sql`
      SELECT 
        id,
        name,
        email,
        photograph,
        avatar,
        specialty,
        created_at
      FROM users
      WHERE role = 'ARTISAN'
      ORDER BY created_at DESC
    `;

    console.log(`📊 Found ${artisans.length} artisan(s)\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    artisans.forEach((artisan, index) => {
      console.log(`${index + 1}. ${artisan.name}`);
      console.log(`   Email: ${artisan.email}`);
      console.log(`   Specialty: ${artisan.specialty || 'N/A'}`);
      console.log(`   Photograph: ${artisan.photograph ? '✅ EXISTS' : '❌ NULL'}`);
      if (artisan.photograph) {
        console.log(`   Photo URL: ${artisan.photograph.substring(0, 60)}...`);
      }
      console.log(`   Avatar: ${artisan.avatar ? '✅ EXISTS' : '❌ NULL'}`);
      if (artisan.avatar) {
        console.log(`   Avatar URL: ${artisan.avatar.substring(0, 60)}...`);
      }
      console.log(`   Created: ${new Date(artisan.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check if any artisans have no photograph
    const noPhoto = artisans.filter(a => !a.photograph && !a.avatar);
    if (noPhoto.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`⚠️  ${noPhoto.length} artisan(s) have no photograph or avatar:`);
      noPhoto.forEach(a => console.log(`   - ${a.name} (${a.email})`));
      console.log('\n💡 Tip: Upload a photograph during signup or update the profile');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkArtisanPhotograph();
