import { db } from './index';

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency: string;
  image_url?: string;
  poster_url?: string;
  category?: string;
  tags: string[];
  is_active: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChatHistory {
  id: number;
  user_id?: number;
  message: string;
  response?: string;
  type: string;
  metadata?: any;
  created_at: Date;
}

// User operations
export const userOperations = {
  async create(email: string, name?: string, phone?: string, language = 'en'): Promise<User> {
    const result = await db.query(
      'INSERT INTO users (email, name, phone, language) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, name, phone, language]
    );
    return result.rows[0];
  },

  async findById(id: number): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async update(id: number, updates: Partial<User>): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const result = await db.query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0];
  }
};

// Product operations
export const productOperations = {
  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await db.query(
      `INSERT INTO products (name, description, story, price, currency, image_url, poster_url, category, tags, is_active, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        productData.name,
        productData.description,
        productData.story,
        productData.price,
        productData.currency,
        productData.image_url,
        productData.poster_url,
        productData.category,
        productData.tags,
        productData.is_active,
        productData.user_id
      ]
    );
    return result.rows[0];
  },

  async findById(id: number): Promise<Product | null> {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByUserId(userId: number): Promise<Product[]> {
    const result = await db.query('SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  },

  async findAll(limit = 20, offset = 0): Promise<Product[]> {
    const result = await db.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  async update(id: number, updates: Partial<Product>): Promise<Product> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const result = await db.query(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0];
  }
};

// Order operations
export const orderOperations = {
  async create(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const result = await db.query(
      'INSERT INTO orders (order_number, status, total_amount, currency, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderData.order_number, orderData.status, orderData.total_amount, orderData.currency, orderData.user_id]
    );
    return result.rows[0];
  },

  async findById(id: number): Promise<Order | null> {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByUserId(userId: number): Promise<Order[]> {
    const result = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  },

  async getStats(userId: number) {
    const totalOrders = await db.query('SELECT COUNT(*) as count FROM orders WHERE user_id = $1', [userId]);
    const totalRevenue = await db.query('SELECT SUM(total_amount) as revenue FROM orders WHERE user_id = $1 AND status = $2', [userId, 'DELIVERED']);
    const monthlyRevenue = await db.query(
      `SELECT SUM(total_amount) as revenue FROM orders 
       WHERE user_id = $1 AND status = $2 AND created_at >= date_trunc('month', CURRENT_DATE)`,
      [userId, 'DELIVERED']
    );

    return {
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].revenue || 0),
      monthlyRevenue: parseFloat(monthlyRevenue.rows[0].revenue || 0)
    };
  }
};

// Chat history operations
export const chatOperations = {
  async create(chatData: Omit<ChatHistory, 'id' | 'created_at'>): Promise<ChatHistory> {
    const result = await db.query(
      'INSERT INTO chat_history (user_id, message, response, type, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chatData.user_id, chatData.message, chatData.response, chatData.type, JSON.stringify(chatData.metadata)]
    );
    return result.rows[0];
  },

  async findByUserId(userId: number, limit = 50): Promise<ChatHistory[]> {
    const result = await db.query(
      'SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }
};
