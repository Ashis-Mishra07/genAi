const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...\n');
    
    const adminEmail = 'admin@artisan.com';
    const adminPassword = 'Admin@123'; // Change this to your preferred password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin already exists
    const existing = await sql`
      SELECT id, email FROM users WHERE email = ${adminEmail}
    `;
    
    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   ID: ${existing[0].id}`);
      return;
    }
    
    // Create admin user
    const result = await sql`
      INSERT INTO users (
        email, 
        name, 
        password, 
        role, 
        is_active,
        status,
        phone,
        specialty,
        location
      ) VALUES (
        ${adminEmail},
        'Admin User',
        ${hashedPassword},
        'ADMIN',
        true,
        'ONLINE',
        '+91-1234567890',
        'Platform Administrator',
        'Headquarters'
      )
      RETURNING id, email, name, role
    `;
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Name: ${result[0].name}`);
    console.log(`   Role: ${result[0].role}`);
    console.log(`   ID: ${result[0].id}`);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log(`\n🔗 Login at: http://localhost:3000/auth/admin`);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();
