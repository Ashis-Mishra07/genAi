import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Product {
  id: string;
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  posterUrl?: string;
  instagramUrl?: string;
  instagramId?: string;
  category?: string;
  materials?: string;
  culture?: string;
  artistName?: string;
  dimensions?: string;
  weight?: string;
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description?: string;
  story?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  posterUrl?: string;
  instagramUrl?: string;
  instagramId?: string;
  category?: string;
  materials?: string;
  culture?: string;
  artistName?: string;
  dimensions?: string;
  weight?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
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
    ORDER BY created_at DESC;
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
    LIMIT ${limit} OFFSET ${offset};
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
      updated_at as "updatedAt"
    FROM products 
    WHERE id = ${id} 
    LIMIT 1;
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
    instagramUrl,
    instagramId,
    category,
    materials,
    culture,
    artistName,
    dimensions,
    weight,
    isActive = true,
    isFeatured = false,
    stockQuantity = 1,
    userId
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
      updated_at as "updatedAt"; 
      artist_name as "artistName", 
      dimensions, 
      weight, 
      is_active as "isActive", 
      is_featured as "isFeatured", 
      stock_quantity as "stockQuantity", 
      artisan_id as "userId",
      created_at as "createdAt",
      updated_at as "updatedAt";
  `;
  return result[0] as Product;
}

// Update product
export async function updateProduct(id: string, userId: string, updates: Partial<CreateProductData>): Promise<Product | null> {
  // First verify the product belongs to the user
  const existingProduct = await sql`
    SELECT id FROM products WHERE id = ${id} AND user_id = ${userId} LIMIT 1;
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
        updated_at as "updatedAt";
    `; 
        weight, 
        is_active as "isActive", 
        is_featured as "isFeatured", 
        stock_quantity as "stockQuantity", 
        artisan_id as "userId",
        created_at as "createdAt",
        updated_at as "updatedAt";
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
  totalViews: number;
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

  // TODO: Implement views and orders tracking
  // For now, return mock data for views and orders
  const stats = productStats[0];
  
  return {
    totalProducts: Number(stats.total_products) || 0,
    activeProducts: Number(stats.active_products) || 0,
    totalViews: Math.floor(Math.random() * 1000), // Mock data - implement proper tracking later
    totalOrders: Math.floor(Math.random() * 50), // Mock data - implement proper tracking later
  };
}

// Search products
export async function searchProducts(searchTerm: string, userId?: string): Promise<Product[]> {
  let query;
  
  if (userId) {
    // Search within user's products
    query = sql`
      SELECT 
        id, 
        name, 
        description, 
        story, 
        price, 
        currency, 
        "imageUrl", 
        "posterUrl", 
        "instagramUrl", 
        "instagramId", 
        category, 
        materials, 
        culture, 
        "artistName", 
        dimensions, 
        weight, 
        "isActive", 
        "isFeatured", 
        "stockQuantity", 
        "userId",
        "createdAt",
        "updatedAt"
      FROM products 
      WHERE "userId" = ${userId}
      AND (
        name ILIKE ${`%${searchTerm}%`} OR 
        description ILIKE ${`%${searchTerm}%`} OR 
        category ILIKE ${`%${searchTerm}%`} OR 
        materials ILIKE ${`%${searchTerm}%`} OR 
        "artistName" ILIKE ${`%${searchTerm}%`} OR 
        culture ILIKE ${`%${searchTerm}%`}
      )
      ORDER BY "createdAt" DESC;
    `;
  } else {
    // Search all active products
    query = sql`
      SELECT 
        id, 
        name, 
        description, 
        story, 
        price, 
        currency, 
        "imageUrl", 
        "posterUrl", 
        "instagramUrl", 
        "instagramId", 
        category, 
        materials, 
        culture, 
        "artistName", 
        dimensions, 
        weight, 
        "isActive", 
        "isFeatured", 
        "stockQuantity", 
        "userId",
        "createdAt",
        "updatedAt"
      FROM products 
      WHERE "isActive" = true
      AND (
        name ILIKE ${`%${searchTerm}%`} OR 
        description ILIKE ${`%${searchTerm}%`} OR 
        category ILIKE ${`%${searchTerm}%`} OR 
        materials ILIKE ${`%${searchTerm}%`} OR 
        "artistName" ILIKE ${`%${searchTerm}%`} OR 
        culture ILIKE ${`%${searchTerm}%`}
      )
      ORDER BY "createdAt" DESC;
    `;
  }
  
  const result = await query;
  return result as Product[];
}
