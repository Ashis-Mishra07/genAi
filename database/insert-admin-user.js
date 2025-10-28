// Script to insert the system admin user into the database
// This fixes the foreign key constraint error when adding items to cart

const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function insertAdminUser() {
  try {
    console.log('Inserting system admin user...');
    
    const result = await sql`
      INSERT INTO users (
        id,
        email,
        password,
        name,
        phone,
        role,
        specialty,
        location,
        bio,
        avatar,
        status,
        is_active,
        last_login_at,
        last_seen,
        language,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@system.local',
        NULL,
        'System Administrator',
        NULL,
        'ADMIN',
        'Platform Management',
        'System',
        'System administrator account for platform management',
        NULL,
        'ONLINE',
        true,
        NOW(),
        NOW(),
        'en',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        last_seen = NOW(),
        updated_at = NOW()
      RETURNING id, email, name, role;
    `;

    console.log('✅ Admin user created/updated successfully:');
    console.log(result[0]);

    // Verify the user exists
    const verification = await sql`
      SELECT id, email, name, role, is_active 
      FROM users 
      WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
    `;

    console.log('\n✅ Verification successful:');
    console.log(verification[0]);
    
    console.log('\n✨ Admin user is now ready for cart operations!');
    
  } catch (error) {
    console.error('❌ Error inserting admin user:', error);
    process.exit(1);
  }
}

// Run the script
insertAdminUser()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
