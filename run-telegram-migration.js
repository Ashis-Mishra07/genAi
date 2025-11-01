const { neon } = require('@neondatabase/serverless');

async function runTelegramMigration() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Connecting to Neon database...');
    console.log('Running Telegram fields migration...');
    
    // Execute migrations one by one using unsafe() for raw SQL
    console.log('1. Adding Telegram fields to users table...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100),
      ADD COLUMN IF NOT EXISTS telegram_authorized BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS telegram_authorized_at TIMESTAMPTZ
    `;

    console.log('2. Creating indexes for telegram fields...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_telegram_authorized ON users(telegram_authorized) WHERE telegram_authorized = TRUE`;

    console.log('3. Creating telegram_auth_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS telegram_auth_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_chat_id VARCHAR(50) NOT NULL,
        telegram_username VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        verification_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('4. Creating indexes for telegram_auth_requests...');
    await sql`CREATE INDEX IF NOT EXISTS idx_telegram_auth_requests_chat_id ON telegram_auth_requests(telegram_chat_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_telegram_auth_requests_code ON telegram_auth_requests(verification_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_telegram_auth_requests_expires ON telegram_auth_requests(expires_at)`;
    
    console.log('\n✅ Telegram fields migration completed successfully!');

    // Verify the migration
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name IN ('telegram_chat_id', 'telegram_username', 'telegram_authorized', 'telegram_authorized_at')
      ORDER BY column_name
    `;

    console.log('\n📊 New Telegram fields added to users table:');
    result.forEach(row => {
      console.log(`  • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });

    // Check if telegram_auth_requests table was created
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'telegram_auth_requests'
    `;

    if (tableCheck.length > 0) {
      console.log('✅ telegram_auth_requests table created successfully');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run migration
runTelegramMigration().catch(console.error);