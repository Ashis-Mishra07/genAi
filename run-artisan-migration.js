const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Adding artisan documentation fields...\n');

    // Add columns one by one
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photograph TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS artistry_description TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS work_process TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise_areas TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS origin_place VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS artisan_story TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_url TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS documentation_video_status VARCHAR(20) DEFAULT 'NOT_GENERATED'`;

    console.log('✅ Successfully added artisan documentation fields!\n');

    // Verify the changes
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN (
        'gender', 'photograph', 'artistry_description', 'work_process',
        'expertise_areas', 'origin_place', 'artisan_story',
        'documentation_video_url', 'documentation_video_status'
      )
      ORDER BY column_name
    `;

    console.log('📋 Added columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''})`);
    });

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
