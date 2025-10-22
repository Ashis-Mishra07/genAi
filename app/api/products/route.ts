import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { 
  getProductsByUserId, 
  getAllActiveProductsWithArtisans,
  getFeaturedProducts,
  getAllProducts,
  createProduct, 
  getProductStats,
  searchProducts 
} from '../../../lib/db/products-neon';
import { cache, setCache, getCache, deleteCache } from '../../../lib/redis';

export async function GET(request: NextRequest) {
  console.log('====== PRODUCTS API CALLED ======');
  const requestStart = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`Products: Fetching products, limit=${limit}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    // Use the EXACT working code from test-db
    const sql = neon(process.env.DATABASE_URL);
    
    // Get products
    const products = await sql`
      SELECT id, name, price, currency, image_url, category, video_url, video_status, user_id
      FROM products
      WHERE is_active = true 
      LIMIT ${limit}
    `;
    
    console.log(`Products: Got ${products.length} products`);
    
    // Get users
    const users = await sql`SELECT id, name, location FROM users`;
    console.log(`Products: Got ${users.length} users`);
    
    // Combine in JavaScript
    const userMap = new Map(users.map((u: any) => [u.id, u]));
    const productsWithArtisans = products.map((p: any) => {
      const user: any = userMap.get(p.user_id);
      return {
        id: p.id,
        name: p.name,
        description: '',
        price: Number(p.price),
        currency: p.currency,
        imageUrl: p.image_url,
        category: p.category,
        isActive: true,
        userId: p.user_id,
        createdAt: new Date(),
        updatedAt: new Date(),
        videoUrl: p.video_url,
        videoStatus: p.video_status,
        artisanName: user?.name || 'Unknown Artisan',
        artisanLocation: user?.location || 'Unknown Location'
      };
    });
    
    console.log(`Products: Returning ${productsWithArtisans.length} products (${Date.now() - requestStart}ms)`);
    
    return NextResponse.json({
      success: true,
      products: productsWithArtisans,
      count: productsWithArtisans.length
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Product creation API called');
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: !!process.env.JWT_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0
    });
    
    // Check if critical environment variables are missing
    if (!process.env.DATABASE_URL) {
      console.error('Critical error: DATABASE_URL is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Database not configured' },
        { status: 500 }
      );
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('Critical error: JWT_SECRET is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Authentication not configured' },
        { status: 500 }
      );
    }
    
    // Authentication required for creating products
    console.log('Attempting to get current user...');
    const user = await getCurrentUser(request);
    console.log('Current user result:', user ? { id: user.id, role: user.role } : 'No user');
    
    if (!user) {
      console.log('Authentication failed - no user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Parsing request body...');
    const productData = await request.json();
    console.log('Product creation request:', { 
      userId: user.id, 
      userRole: user.role, 
      productName: productData.name,
      hasImageUrl: !!productData.imageUrl,
      hasDescription: !!productData.description
    });
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    // Handle different scenarios
    let targetUserId = user.id;
    
    if (user.role === 'ADMIN' && productData.createdByAdmin) {
      // Admin creating product for an artisan
      if (productData.artisanId) {
        targetUserId = productData.artisanId;
      } else {
        // If no specific artisan ID, create under admin but mark as admin-created
        targetUserId = user.id;
        productData.createdByAdmin = true;
      }
    } else if (user.role === 'ARTISAN') {
      // Artisan creating their own product
      targetUserId = user.id;
    } else if (user.role !== 'ADMIN' && user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: 'Only artisans and admins can create products' },
        { status: 403 }
      );
    }

    // Add user ID to product data
    productData.userId = targetUserId;

    console.log('Creating product with data:', {
      name: productData.name,
      userId: targetUserId,
      price: productData.price,
      hasImageUrl: !!productData.imageUrl
    });

    const product = await createProduct(productData);
    console.log('Product created successfully:', { id: product.id, name: product.name });

    // REDIS CACHING DISABLED - No cache invalidation needed
    console.log('Products: Cache invalidation skipped (Redis disabled)');

    return NextResponse.json({
      success: true,
      product: product,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more detailed error response for debugging
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create product',
        details: error.message,
        // Include more context in development/staging
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: error.stack,
          fullError: error.toString()
        })
      },
      { status: 500 }
    );
  }
}
