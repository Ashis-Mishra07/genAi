import { NextResponse } from 'next/server';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST() {
  try {
    console.log('Initializing database schema...');
    
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        story TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        image_url TEXT,
        poster_url TEXT,
        category VARCHAR(100),
        tags TEXT[],
        is_active BOOLEAN DEFAULT true,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create chat_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        message TEXT NOT NULL,
        response TEXT,
        type VARCHAR(20) DEFAULT 'TEXT',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create categories table for better organization
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insert default categories
    await client.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Textiles', 'Handwoven fabrics, clothing, and textile arts'),
      ('Pottery', 'Clay pottery, ceramics, and earthenware'),
      ('Jewelry', 'Handcrafted jewelry and accessories'),
      ('Woodwork', 'Carved wooden items and furniture'),
      ('Metalwork', 'Brass, copper, and silver crafts'),
      ('Paintings', 'Traditional and folk art paintings'),
      ('Handicrafts', 'General handicrafts and decorative items')
      ON CONFLICT DO NOTHING;
    `);
    
    client.release();
    
    console.log('Database schema initialized successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully!',
      tables: ['users', 'products', 'orders', 'order_items', 'chat_history', 'categories'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database schema initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint to check schema status
export async function GET() {
  try {
    const client = await pool.connect();
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      tables: result.rows.map(row => row.table_name),
      message: 'Database schema status retrieved successfully'
    });
    
  } catch (error) {
    console.error('Database schema check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
