const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(
  "postgresql://neondb_owner:npg_1BMoUENWdu7s@ep-holy-math-ahngx8rr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
);

async function createAllTables() {
  console.log("🚀 Creating tables directly in Neon database...\n");

  try {
    // 1. Create users table
    console.log("📦 Creating users table...");
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        specialty VARCHAR(255),
        location VARCHAR(255),
        avatar TEXT,
        status VARCHAR(20) DEFAULT 'OFFLINE',
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'CUSTOMER',
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMPTZ,
        bio TEXT,
        telegram_chat_id VARCHAR(255),
        telegram_authorized BOOLEAN DEFAULT false,
        telegram_authorized_at TIMESTAMPTZ
      )
    `;
    console.log("✅ Users table created");

    // 2. Create products table
    console.log("📦 Creating products table...");
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        story TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        image_url TEXT,
        poster_url TEXT,
        video_url TEXT,
        video_status VARCHAR(20) DEFAULT 'NOT_GENERATED',
        video_generation_id TEXT,
        category VARCHAR(100),
        tags TEXT[],
        is_active BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT 0,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Products table created");

    // 3. Create orders table
    console.log("📦 Creating orders table...");
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        total DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES users(id),
        shipping_address JSONB,
        shipping_latitude DOUBLE PRECISION,
        shipping_longitude DOUBLE PRECISION,
        location_geocoded_at TIMESTAMPTZ,
        payment_method VARCHAR(20) DEFAULT 'cod',
        payment_status VARCHAR(20) DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      )
    `;
    console.log("✅ Orders table created");

    // 4. Create order_items table
    console.log("📦 Creating order_items table...");
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        name VARCHAR(255),
        artisan_name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Order items table created");

    // 5. Create cart_items table
    console.log("📦 Creating cart_items table...");
    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `;
    console.log("✅ Cart items table created");

    // 6. Create chat_rooms table
    console.log("📦 Creating chat_rooms table...");
    await sql`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        type VARCHAR(20) DEFAULT 'DIRECT',
        last_message TEXT,
        last_message_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Chat rooms table created");

    // 7. Create chat_messages table
    console.log("📦 Creating chat_messages table...");
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message_type VARCHAR(20) DEFAULT 'TEXT',
        content TEXT,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'SENT',
        metadata JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Chat messages table created");

    // 8. Create notifications table
    console.log("📦 Creating notifications table...");
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Notifications table created");

    // 9. Create admin_passcodes table
    console.log("📦 Creating admin_passcodes table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_passcodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passcode VARCHAR(6) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        used_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 100
      )
    `;
    console.log("✅ Admin passcodes table created");

    // 10. Create product_inquiries table
    console.log("📦 Creating product_inquiries table...");
    await sql`
      CREATE TABLE IF NOT EXISTS product_inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES users(id),
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(50),
        message TEXT NOT NULL,
        source VARCHAR(20) DEFAULT 'WEBSITE',
        status VARCHAR(20) DEFAULT 'NEW',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("✅ Product inquiries table created");

    // 11. Create additional helper tables
    console.log("📦 Creating additional tables...");

    await sql`
      CREATE TABLE IF NOT EXISTS chat_room_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'MEMBER',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        last_read_at TIMESTAMPTZ,
        UNIQUE(room_id, user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        revoked_at TIMESTAMPTZ,
        device_info TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS telegram_auth_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_chat_id VARCHAR(255) UNIQUE NOT NULL,
        telegram_username VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        verification_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log("✅ Additional tables created");

    // Create indexes for better performance
    console.log("📦 Creating indexes...");

    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_coordinates ON orders(shipping_latitude, shipping_longitude)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_geocoded ON orders(location_geocoded_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_telegram_auth_chat_id ON telegram_auth_requests(telegram_chat_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_telegram_auth_email ON telegram_auth_requests(email)`;

    console.log("✅ Indexes created");

    console.log("\n🎉 All tables created successfully!");

    // Verify tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log("\n📊 Created tables:");
    tables.forEach((table) => console.log(`   ✓ ${table.table_name}`));

    // Create admin user after all tables are set up
    console.log("\n👑 Creating admin user...");
    await createAdminUser();
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    console.log("📦 Setting up admin user...");

    // Check if admin already exists
    const existing = await sql`
      SELECT id, email, name, role FROM users WHERE role = 'ADMIN' LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("✓ Admin user already exists:");
      console.log("  ID:", existing[0].id);
      console.log("  Email:", existing[0].email);
      console.log("  Name:", existing[0].name);
      return;
    }

    // Create admin user with the same ID used in admin_messages table
    const result = await sql`
      INSERT INTO users (
        id,
        email, 
        name, 
        role, 
        status,
        specialty,
        location,
        is_active,
        password
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'admin@system.local',
        'System Administrator',
        'ADMIN',
        'ONLINE',
        'Platform Management',
        'Headquarters',
        true,
        '$2b$10$defaultAdminPasswordHash'
      )
      ON CONFLICT (id) DO UPDATE SET
        role = 'ADMIN',
        is_active = true,
        status = 'ONLINE'
      RETURNING id, email, name, role
    `;

    console.log("✅ Admin user created successfully:");
    console.log("  ID:", result[0].id);
    console.log("  Email:", result[0].email);
    console.log("  Name:", result[0].name);
    console.log("  Role:", result[0].role);
    console.log("\n🎯 You can now use the admin features!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
}

createAllTables();
