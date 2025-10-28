import { neon } from '@neondatabase/serverless';

// Configure Neon with better timeout and retry settings
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    timeout: 30000, // 30 seconds timeout
  },
});

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
  // Query 1: Get products only (FAST)
  const products = await sql`
    SELECT 
      id, 
      name, 
      price, 
      currency, 
      image_url,
      category,
      video_url,
      video_status,
      user_id
    FROM products
    WHERE is_active = true 
    LIMIT ${limit}
  `;
  
  if (products.length === 0) {
    return [];
  }
  
  // Query 2: Get all users (FAST) 
  const users = await sql`SELECT id, name, location FROM users`;
  const userMap = new Map(users.map((u: any) => [u.id, u]));
  
  // Join in JavaScript
  return products.map((row: any) => {
    const user = userMap.get(row.user_id);
    return {
      id: row.id,
      name: row.name,
      description: '',
      price: Number(row.price),
      currency: row.currency,
      imageUrl: row.image_url,
      category: row.category,
      isActive: true,
      userId: row.user_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      videoUrl: row.video_url,
      videoStatus: row.video_status,
      artisanName: user?.name || 'Unknown Artisan',
      artisanLocation: user?.location || 'Unknown Location',
    };
  }) as (Product & { artisanName: string; artisanLocation: string })[];
}

// Get featured products (most recent active products) - OPTIMIZED FOR SPEED
export async function getFeaturedProducts(limit: number = 8): Promise<(Product & { artisanName: string; artisanLocation: string; isNew: boolean; reviewCount: number; rating: number })[]> {
  // Query 1: Get products only (FAST)
  const products = await sql`
    SELECT 
      id, 
      name, 
      price, 
      currency, 
      image_url,
      category,
      user_id
    FROM products
    WHERE is_active = true 
    LIMIT ${limit}
  `;
  
  if (products.length === 0) {
    return [];
  }
  
  // Query 2: Get all users (FAST)
  const users = await sql`SELECT id, name, location FROM users`;
  const userMap = new Map(users.map((u: any) => [u.id, u]));
  
  // Join in JavaScript
  return products.map((row: any) => {
    const user = userMap.get(row.user_id);
    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      currency: row.currency,
      imageUrl: row.image_url,
      category: row.category,
      isActive: true,
      userId: row.user_id,
      createdAt: new Date(),
      artisanName: user?.name || 'Unknown Artisan',
      artisanLocation: user?.location || 'Unknown Location',
      isNew: true,
      reviewCount: 0,
      rating: 4.7
    };
  }) as (Product & { artisanName: string; artisanLocation: string; isNew: boolean; reviewCount: number; rating: number })[];
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

// Create product with retry logic
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

  // Retry logic for handling connection issues
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Creating product attempt ${attempt}/3`);
      
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
      
      console.log(`Product created successfully on attempt ${attempt}`);
      return result[0] as Product;
    } catch (error: any) {
      lastError = error;
      console.error(`Product creation attempt ${attempt} failed:`, error.message);
      
      // If this is a timeout or connection error and we have retries left, wait and retry
      if (attempt < 3 && (
        error.message?.includes('timeout') || 
        error.message?.includes('fetch failed') ||
        error.message?.includes('ECONNREFUSED')
      )) {
        const waitTime = attempt * 2000; // 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's not a retryable error or we're out of retries, throw
      throw error;
    }
  }
  
  // This should never be reached due to the throw above, but TypeScript needs it
  throw lastError;
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
