import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Product interface matching actual database schema
export interface Product {
  id: string;
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  posterUrl?: string;
  category?: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create product interface
export interface CreateProductData {
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  posterUrl?: string;
  category?: string;
  isActive?: boolean;
  userId: string;
}

// Get products by user ID (for artisan dashboard)
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  const result = await sql`
    SELECT 
      id, 
      name, 
      description, 
      story, 
      price, 
      currency, 
      image_url as "imageUrl", 
      poster_url as "posterUrl", 
      category, 
      is_active as "isActive", 
      user_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM products 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `;
  return result as Product[];
}

// Get all active products (for public listing)
export async function getAllActiveProducts(limit: number = 50, offset: number = 0): Promise<Product[]> {
  const result = await sql`
    SELECT 
      id, 
      name, 
      description, 
      story, 
      price, 
      currency, 
      image_url as "imageUrl", 
      poster_url as "posterUrl", 
      category, 
      is_active as "isActive", 
      user_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM products 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result as Product[];
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const result = await sql`
    SELECT 
      id, 
      name, 
      description, 
      story, 
      price, 
      currency, 
      image_url as "imageUrl", 
      poster_url as "posterUrl", 
      category, 
      is_active as "isActive", 
      user_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM products 
    WHERE id = ${id} 
    LIMIT 1
  `;
  return result.length > 0 ? result[0] as Product : null;
}

// Create product
export async function createProduct(productData: CreateProductData): Promise<Product> {
  const {
    name,
    description,
    story,
    price,
    currency = 'INR',
    imageUrl,
    posterUrl,
    category,
    isActive = true,
    userId,
  } = productData;

  const result = await sql`
    INSERT INTO products (
      name, description, story, price, currency, image_url, poster_url, 
      category, is_active, user_id, 
      created_at, updated_at
    ) VALUES (
      ${name}, ${description}, ${story}, ${price}, ${currency}, ${imageUrl}, 
      ${posterUrl}, ${category}, ${isActive}, ${userId}, NOW(), NOW()
    )
    RETURNING 
      id, 
      name, 
      description, 
      story, 
      price, 
      currency, 
      image_url as "imageUrl", 
      poster_url as "posterUrl", 
      category, 
      is_active as "isActive", 
      user_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  
  return result[0] as Product;
}

// Update product
export async function updateProduct(id: string, userId: string, updates: Partial<CreateProductData>): Promise<Product | null> {
  // First verify the product belongs to the user
  const existingProduct = await sql`
    SELECT id FROM products WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `;
  
  if (existingProduct.length === 0) {
    return null;
  }

  // Build update fields - only include fields that exist in database
  const allowedFields = [
    'name', 'description', 'story', 'price', 'currency', 'imageUrl', 
    'posterUrl', 'category', 'isActive'
  ];

  const updateFields = Object.keys(updates).filter(key => 
    allowedFields.includes(key) && updates[key as keyof CreateProductData] !== undefined
  );

  if (updateFields.length === 0) {
    return getProductById(id);
  }

  // Field mapping from camelCase to snake_case (only for existing columns)
  const fieldMapping: Record<string, string> = {
    'imageUrl': 'image_url',
    'posterUrl': 'poster_url',
    'isActive': 'is_active'
  };

  // Create SET clause with proper column names
  const setClause = updateFields.map(field => {
    const columnName = fieldMapping[field] || field;
    return `${columnName} = $${field}`;
  }).join(', ');

  // Create values object
  const values = updateFields.reduce((acc, field) => {
    acc[field] = updates[field as keyof CreateProductData];
    return acc;
  }, {} as Record<string, any>);

  try {
    const result = await sql`
      UPDATE products 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING 
        id, 
        name, 
        description, 
        story, 
        price, 
        currency, 
        image_url as "imageUrl", 
        poster_url as "posterUrl", 
        category, 
        is_active as "isActive", 
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    return result.length > 0 ? result[0] as Product : null;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete product
export async function deleteProduct(id: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM products 
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return result.length > 0;
}

// Get product stats for a user
export async function getProductStats(userId: string): Promise<{
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}> {
  // Get product counts
  const productStats = await sql`
    SELECT 
      COUNT(*) as total_products,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
    FROM products 
    WHERE user_id = ${userId}
  `;

  // For now, return 0 for orders since we're focusing on products
  return {
    totalProducts: Number(productStats[0]?.total_products || 0),
    activeProducts: Number(productStats[0]?.active_products || 0),
    totalOrders: 0
  };
}

// Search products
export async function searchProducts(
  searchTerm: string, 
  userId?: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<Product[]> {
  if (userId) {
    // Search user's products
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        story, 
        price, 
        currency, 
        image_url as "imageUrl", 
        poster_url as "posterUrl", 
        category, 
        is_active as "isActive", 
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE user_id = ${userId}
      AND (
        name ILIKE ${`%${searchTerm}%`} OR
        description ILIKE ${`%${searchTerm}%`} OR
        category ILIKE ${`%${searchTerm}%`}
      )
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Product[];
  } else {
    // Search all active products
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        story, 
        price, 
        currency, 
        image_url as "imageUrl", 
        poster_url as "posterUrl", 
        category, 
        is_active as "isActive", 
        user_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE is_active = true
      AND (
        name ILIKE ${`%${searchTerm}%`} OR
        description ILIKE ${`%${searchTerm}%`} OR
        category ILIKE ${`%${searchTerm}%`}
      )
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Product[];
  }
}
