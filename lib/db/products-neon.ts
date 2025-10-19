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
  videoUrl?: string;
  videoStatus?: string;
  videoGenerationId?: string;
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
      updated_at as "updatedAt",
      video_url as "videoUrl",
      video_status as "videoStatus",
      video_generation_id as "videoGenerationId"
    FROM products 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `;
  return result as Product[];
}

// Get all active products with artisan information (for public listing)
export async function getAllActiveProductsWithArtisans(limit: number = 50, offset: number = 0): Promise<(Product & { artisanName: string; artisanLocation: string })[]> {
  const result = await sql`
    SELECT 
      p.id, 
      p.name, 
      p.description, 
      p.story, 
      p.price, 
      p.currency, 
      p.image_url as "imageUrl", 
      p.poster_url as "posterUrl", 
      p.category, 
      p.is_active as "isActive", 
      p.user_id as "userId",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt",
      p.video_url as "videoUrl",
      p.video_status as "videoStatus",
      p.video_generation_id as "videoGenerationId",
      COALESCE(u.name, 'Unknown Artisan') as "artisanName",
      COALESCE(u.location, 'Unknown Location') as "artisanLocation"
    FROM products p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.is_active = true 
    ORDER BY p.created_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result as (Product & { artisanName: string; artisanLocation: string })[];
}

// Get featured products (most recent active products)
export async function getFeaturedProducts(limit: number = 8): Promise<(Product & { artisanName: string; artisanLocation: string; isNew: boolean; reviewCount: number; rating: number })[]> {
  const result = await sql`
    SELECT 
      p.id, 
      p.name, 
      p.description, 
      p.story, 
      p.price, 
      p.currency, 
      p.image_url as "imageUrl", 
      p.poster_url as "posterUrl", 
      p.category, 
      p.is_active as "isActive", 
      p.user_id as "userId",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt",
      p.video_url as "videoUrl",
      p.video_status as "videoStatus",
      p.video_generation_id as "videoGenerationId",
      COALESCE(u.name, 'Unknown Artisan') as "artisanName",
      COALESCE(u.location, 'Unknown Location') as "artisanLocation",
      CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN true ELSE false END as "isNew",
      0 as "reviewCount",
      CASE 
        WHEN RANDOM() < 0.3 THEN 4.9
        WHEN RANDOM() < 0.6 THEN 4.8
        WHEN RANDOM() < 0.8 THEN 4.7
        ELSE 4.6
      END as "rating"
    FROM products p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.is_active = true 
    ORDER BY p.created_at DESC 
    LIMIT ${limit}
  `;
  return result as (Product & { artisanName: string; artisanLocation: string; isNew: boolean; reviewCount: number; rating: number })[];
}

// Get product by ID with artisan information
export async function getProductByIdWithArtisan(id: string): Promise<(Product & { artisanName: string; artisanLocation: string; artisanBio: string; artisanSpecialty: string }) | null> {
  const result = await sql`
    SELECT 
      p.id, 
      p.name, 
      p.description, 
      p.story, 
      p.price, 
      p.currency, 
      p.image_url as "imageUrl", 
      p.poster_url as "posterUrl", 
      p.category, 
      p.is_active as "isActive", 
      p.user_id as "userId",
      p.created_at as "createdAt",
      p.updated_at as "updatedAt",
      p.video_url as "videoUrl",
      p.video_status as "videoStatus",
      p.video_generation_id as "videoGenerationId",
      COALESCE(u.name, 'Unknown Artisan') as "artisanName",
      COALESCE(u.location, 'Unknown Location') as "artisanLocation",
      COALESCE(u.bio, '') as "artisanBio",
      COALESCE(u.specialty, '') as "artisanSpecialty"
    FROM products p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id} 
    LIMIT 1
  `;
  return result.length > 0 ? result[0] as (Product & { artisanName: string; artisanLocation: string; artisanBio: string; artisanSpecialty: string }) : null;
}

// Get all products (for admin view)
export async function getAllProducts(limit: number = 50, offset: number = 0): Promise<Product[]> {
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
      updated_at as "updatedAt",
      video_url as "videoUrl",
      video_status as "videoStatus",
      video_generation_id as "videoGenerationId"
    FROM products 
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
      updated_at as "updatedAt",
      video_url as "videoUrl",
      video_status as "videoStatus",
      video_generation_id as "videoGenerationId"
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
      updated_at as "updatedAt",
      video_url as "videoUrl",
      video_status as "videoStatus",
      video_generation_id as "videoGenerationId"
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
        updated_at as "updatedAt",
        video_url as "videoUrl",
        video_status as "videoStatus",
        video_generation_id as "videoGenerationId"
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
        updated_at as "updatedAt",
        video_url as "videoUrl",
        video_status as "videoStatus",
        video_generation_id as "videoGenerationId"
      FROM products 
      WHERE user_id = ${userId}
      AND (
        name ILIKE ${'%' + searchTerm + '%'} OR
        description ILIKE ${'%' + searchTerm + '%'} OR
        category ILIKE ${'%' + searchTerm + '%'}
      )
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Product[];
  } else {
    // Search all products (for admin or public)
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
        updated_at as "updatedAt",
        video_url as "videoUrl",
        video_status as "videoStatus",
        video_generation_id as "videoGenerationId"
      FROM products 
      WHERE (
        name ILIKE ${'%' + searchTerm + '%'} OR
        description ILIKE ${'%' + searchTerm + '%'} OR
        category ILIKE ${'%' + searchTerm + '%'}
      )
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Product[];
  }
}
