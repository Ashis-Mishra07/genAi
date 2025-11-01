import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // No need for SSL config - Neon serverless handles it automatically
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to Neon database via serverless driver');
});

pool.on('error', (err: Error) => {
  console.error('Database pool error:', err);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
  end: () => pool.end(),
};

// Initialize database tables
export async function initializeDatabase() {
  try {
    await db.query(`
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

    await db.query(`
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
        materials VARCHAR(255),
        artist_name VARCHAR(255),
        cultural_origin VARCHAR(255),
        dimensions VARCHAR(100),
        weight VARCHAR(50),
        instagram_post_id VARCHAR(100),
        instagram_media_id VARCHAR(100),
        instagram_url TEXT,
        is_active BOOLEAN DEFAULT true,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await db.query(`
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

    await db.query(`
      CREATE TABLE IF NOT EXISTS product_inquiries (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        instagram_username VARCHAR(100),
        message TEXT,
        inquiry_type VARCHAR(50) DEFAULT 'PURCHASE',
        status VARCHAR(20) DEFAULT 'PENDING',
        source VARCHAR(50) DEFAULT 'INSTAGRAM',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
