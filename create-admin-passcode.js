const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createAdminPasscode() {
  try {
    console.log('🔑 Creating admin passcode...\n');
    
    const passcode = process.env.PASSCODE || '123456';
    
    // Check if passcode already exists
    const existing = await sql`
      SELECT id, passcode FROM admin_passcodes WHERE is_active = true
    `;
    
    if (existing.length > 0) {
      console.log('⚠️  Active admin passcode already exists:');
      console.log(`   Passcode: ${existing[0].passcode}`);
      return;
    }
    
    // Create admin passcode
    const result = await sql`
      INSERT INTO admin_passcodes (
        passcode,
        is_active,
        expires_at,
        used_count,
        max_uses
      ) VALUES (
        ${passcode},
        true,
        ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}, -- Expires in 1 year
        0,
        1000
      )
      RETURNING id, passcode, is_active, max_uses
    `;
    
    console.log('✅ Admin passcode created successfully!\n');
    console.log('📋 Passcode Details:');
    console.log(`   Passcode: ${result[0].passcode}`);
    console.log(`   Max Uses: ${result[0].max_uses}`);
    console.log(`   Status: ${result[0].is_active ? 'Active' : 'Inactive'}`);
    
  } catch (error) {
    console.error('❌ Error creating passcode:', error);
  }
}

createAdminPasscode();
