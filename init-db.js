const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Test connection first
    console.log('📡 Testing database connection...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Create users table
    console.log('📋 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'CUSTOMER',
        specialty VARCHAR(255),
        location VARCHAR(255),
        bio TEXT,
        avatar TEXT,
        status VARCHAR(20) DEFAULT 'OFFLINE',
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Users table created');

    // Create refresh tokens table
    console.log('📋 Creating refresh tokens table...');
    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        revoked_at TIMESTAMP WITH TIME ZONE
      );
    `;
    console.log('✅ Refresh tokens table created');

    // Create your user account
    console.log('👤 Creating your user account...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Tejash@1234', 10);
    
    await sql`
      INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
      VALUES ('tejash@gmail.com', ${hashedPassword}, 'tejash kumar', 'CUSTOMER', true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        updated_at = NOW();
    `;
    console.log('✅ Your user account created/updated');

    // Create sample artisan user
    console.log('👤 Creating sample artisan user...');
    const artisanPassword = await bcrypt.hash('password123', 10);
    await sql`
      INSERT INTO users (email, password, name, role, specialty, location, is_active, created_at, updated_at)
      VALUES ('priya@example.com', ${artisanPassword}, 'Priya Sharma', 'ARTISAN', 'Textile & Embroidery', 'Rajasthan', true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        specialty = EXCLUDED.specialty,
        location = EXCLUDED.location,
        updated_at = NOW();
    `;
    console.log('✅ Sample artisan user created/updated');

    // Create admin passcodes table
    console.log('📋 Creating admin passcodes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_passcodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passcode VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const adminPasscodeHash = await bcrypt.hash('123456', 10);
    await sql`
      INSERT INTO admin_passcodes (passcode, is_active, created_at)
      VALUES (${adminPasscodeHash}, true, NOW())
      ON CONFLICT DO NOTHING;
    `;
    console.log('✅ Admin passcode created');

    // Create products table
    console.log('📋 Creating products table...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Products table created');

    // Create orders table
    console.log('📋 Creating orders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Orders table created');

    // Verify the setup
    console.log('🔍 Verifying database setup...');
    const userCheck = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Users table has ${userCheck[0].count} records`);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📊 Database tables created:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));

    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('🔐 Your login credentials:');
    console.log('  Email: tejash@gmail.com');
    console.log('  Password: Tejash@1234');
    console.log('  Role: CUSTOMER');
    console.log('');
    console.log('🚀 You can now sign in to the application!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

initializeDatabase();