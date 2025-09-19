import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { createSampleUsersWithRoles } from '../../../../lib/db/auth';

// Direct query function using Neon serverless
const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    console.log('Creating chat tables in Neon database...');
    
    // Create users table (enhanced for multi-role authentication)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255), -- NULL for admin (uses passcode)
        name VARCHAR(255),
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'CUSTOMER', -- ADMIN, ARTISAN, CUSTOMER
        specialty VARCHAR(255), -- For artisans
        location VARCHAR(255), -- For artisans
        bio TEXT, -- For artisans
        avatar TEXT,
        status VARCHAR(20) DEFAULT 'OFFLINE',
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP WITH TIME ZONE,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create admin passcodes table (for secure admin authentication)
    await sql`
      CREATE TABLE IF NOT EXISTS admin_passcodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passcode VARCHAR(6) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        used_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 100
      );
    `;

    // Create refresh tokens table for JWT management
    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        revoked_at TIMESTAMP WITH TIME ZONE,
        device_info TEXT
      );
    `;

    // Create products table for artisan products
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artisan_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        story TEXT, -- AI generated cultural story
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        image_url TEXT,
        poster_url TEXT, -- AI generated poster
        instagram_url TEXT, -- Instagram post URL
        instagram_id VARCHAR(255), -- Instagram media ID
        category VARCHAR(100),
        materials TEXT, -- Product materials
        culture VARCHAR(100), -- Cultural heritage
        artist_name VARCHAR(255), -- Artist/creator name
        dimensions VARCHAR(100), -- Product dimensions
        weight VARCHAR(50), -- Product weight
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        stock_quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        shipping_address TEXT,
        billing_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create order items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create product inquiries table
    await sql`
      CREATE TABLE IF NOT EXISTS product_inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
        buyer_name VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(50),
        message TEXT NOT NULL,
        source VARCHAR(20) DEFAULT 'WEBSITE', -- WEBSITE, INSTAGRAM, WHATSAPP, EMAIL, PHONE
        status VARCHAR(20) DEFAULT 'NEW', -- NEW, CONTACTED, NEGOTIATING, CONVERTED, LOST
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create chat rooms table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        type VARCHAR(20) DEFAULT 'DIRECT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create chat room participants
    await sql`
      CREATE TABLE IF NOT EXISTS chat_room_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'MEMBER',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(room_id, user_id)
      );
    `;

    // Create chat messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        message_type VARCHAR(20) DEFAULT 'TEXT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'SENT',
        image_url TEXT,
        reply_to_id UUID REFERENCES chat_messages(id)
      );
    `;

    // Create read status table (this was missing!)
    await sql`
      CREATE TABLE IF NOT EXISTS chat_read_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(message_id, user_id)
      );
    `;

    // Note: users table already has the required authentication fields
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
      ON chat_messages(room_id, created_at);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender 
      ON chat_messages(sender_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_read_status_user 
      ON chat_read_status(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_status 
      ON users(status);
    `;

    // Create default admin passcode (123456) - hashed for security
    console.log('Creating default admin passcode...');
    const bcrypt = await import('bcryptjs');
    const hashedPasscode = await bcrypt.hash('123456', 10);
    
    await sql`
      INSERT INTO admin_passcodes (passcode, is_active, expires_at, max_uses, used_count, created_at)
      VALUES (${hashedPasscode}, true, NOW() + INTERVAL '1 year', 1000, 0, NOW())
      ON CONFLICT DO NOTHING;
    `;

    console.log('Creating sample users with different roles...');
    await createSampleUsersWithRoles();

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema created successfully with chat tables and sample data',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create database schema',
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Checking database status...');
    
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'users', 'admin_passcodes', 'refresh_tokens', 'products', 'orders', 
        'order_items', 'product_inquiries', 'chat_rooms', 'chat_messages', 
        'chat_room_participants', 'chat_read_status'
      )
      ORDER BY table_name
    `;

    return NextResponse.json({ 
      success: true, 
      tables: result.map((row: any) => row.table_name),
      count: result.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Database status check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to check database status'
    }, { status: 500 });
  }
}