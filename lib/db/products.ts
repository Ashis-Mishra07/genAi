import { db } from './index';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency?: string;
  image_url?: string;
  poster_url?: string;
  category?: string;
  tags?: string[];
  materials?: string;
  artist_name?: string;
  cultural_origin?: string;
  dimensions?: string;
  weight?: string;
  instagram_post_id?: string;
  instagram_media_id?: string;
  instagram_url?: string;
  is_active?: boolean;
  user_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductInquiry {
  id?: number;
  product_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  instagram_username?: string;
  message?: string;
  inquiry_type?: string;
  status?: string;
  source?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const productOperations = {
  // Create a new product
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const query = `
      INSERT INTO products (
        name, description, story, price, currency, image_url, poster_url, 
        category, tags, materials, artist_name, cultural_origin, dimensions, 
        weight, instagram_post_id, instagram_media_id, instagram_url, 
        is_active, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;
    
    const values = [
      product.name,
      product.description,
      product.story,
      product.price,
      product.currency || 'INR',
      product.image_url,
      product.poster_url,
      product.category,
      product.tags,
      product.materials,
      product.artist_name,
      product.cultural_origin,
      product.dimensions,
      product.weight,
      product.instagram_post_id,
      product.instagram_media_id,
      product.instagram_url,
      product.is_active ?? true,
      product.user_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  // Get product by Instagram media ID
  async getProductByInstagramMediaId(mediaId: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE instagram_media_id = $1';
    const result = await db.query(query, [mediaId]);
    return result.rows[0] || null;
  },

  // Get all products
  async getAllProducts(limit = 50, offset = 0): Promise<Product[]> {
    const query = `
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  },

  // Update product
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  // Delete product
  async deleteProduct(id: number): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const query = `
      SELECT * FROM products 
      WHERE is_active = true 
      AND (
        name ILIKE $1 OR 
        description ILIKE $1 OR 
        category ILIKE $1 OR 
        materials ILIKE $1 OR 
        artist_name ILIKE $1 OR 
        cultural_origin ILIKE $1
      )
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
};

export const inquiryOperations = {
  // Create a new inquiry
  async createInquiry(inquiry: Omit<ProductInquiry, 'id' | 'created_at' | 'updated_at'>): Promise<ProductInquiry> {
    const query = `
      INSERT INTO product_inquiries (
        product_id, customer_name, customer_email, customer_phone, 
        instagram_username, message, inquiry_type, status, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      inquiry.product_id,
      inquiry.customer_name,
      inquiry.customer_email,
      inquiry.customer_phone,
      inquiry.instagram_username,
      inquiry.message,
      inquiry.inquiry_type || 'PURCHASE',
      inquiry.status || 'PENDING',
      inquiry.source || 'INSTAGRAM'
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get inquiries for a product
  async getInquiriesByProductId(productId: number): Promise<ProductInquiry[]> {
    const query = `
      SELECT * FROM product_inquiries 
      WHERE product_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [productId]);
    return result.rows;
  },

  // Get all inquiries
  async getAllInquiries(): Promise<ProductInquiry[]> {
    const query = `
      SELECT pi.*, p.name as product_name 
      FROM product_inquiries pi
      JOIN products p ON pi.product_id = p.id
      ORDER BY pi.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Update inquiry status
  async updateInquiryStatus(id: number, status: string): Promise<ProductInquiry | null> {
    const query = `
      UPDATE product_inquiries 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
  },

  // Get inquiry by ID
  async getInquiryById(id: number): Promise<ProductInquiry | null> {
    const query = `
      SELECT pi.*, p.name as product_name 
      FROM product_inquiries pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  // Update inquiry
  async updateInquiry(id: number, updates: Partial<ProductInquiry>): Promise<ProductInquiry | null> {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    if (!setClause) return null;
    
    const query = `
      UPDATE product_inquiries 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    
    const values = [id, ...Object.values(updates).filter((_, index) => 
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    )];
    
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  // Delete inquiry
  async deleteInquiry(id: number): Promise<boolean> {
    const query = 'DELETE FROM product_inquiries WHERE id = $1';
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
};
