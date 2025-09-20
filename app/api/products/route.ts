import { NextRequest, NextResponse } from 'next/server';
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
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    
    // Create cache key based on parameters
    const cacheKey = `products:${featured ? 'featured' : 'all'}:${search || 'nosearch'}:${category || 'nocategory'}:${limit}:${offset}`;
    
    console.log(`Products: Generated cache key: ${cacheKey}`);
    
    // Cache check for non-search requests
    if (!search) {
      const fullCacheData = await getCache(cacheKey).catch(() => null);
      if (fullCacheData && !fullCacheData.isMinimal) {
        console.log(`Products: Cache hit - serving full data from cache for key: ${cacheKey}`);
        const response = NextResponse.json(fullCacheData);
        response.headers.set('X-Cache-Status', 'HIT-FULL');
        return response;
      }
      
      const minimalCacheData = await getCache(cacheKey + ':minimal').catch(() => null);
      if (minimalCacheData && minimalCacheData.isMinimal) {
        console.log(`Products: Serving minimal cached data for key: ${cacheKey}`);
        const response = NextResponse.json(minimalCacheData);
        response.headers.set('X-Cache-Status', 'HIT-MINIMAL');
        return response;
      }
      
      console.log(`Products: Cache miss for key: ${cacheKey}`);
    } else {
      console.log(`Products: Skipping cache check - search query present`);
    }

    console.log(`Products: Fetching from database for key: ${cacheKey}`);
    
    // Get current user (optional for public endpoints)
    let user = null;
    try {
      user = await getCurrentUser(request);
    } catch {
      // User not authenticated, continue as public user
    }
    
    let products;
    let stats = null;
    
    // Handle featured products request
    if (featured === 'true') {
      products = await getFeaturedProducts(limit);
      return NextResponse.json({
        success: true,
        products: products,
        count: products.length
      });
    }
    
    if (user) {
      if (user.role === 'ADMIN') {
        // Admin sees ALL products in the system (active and inactive)
        if (search) {
          products = await searchProducts(search); // Search all products, not user-specific
        } else {
          products = await getAllProducts(limit, offset); // Show all products including inactive
        }
        // Admin stats could show overall system stats or their created products
        stats = await getProductStats(user.id);
      } else {
        // Artisan/Customer sees only their own products or active products
        if (user.role === 'ARTISAN') {
          if (search) {
            products = await searchProducts(search, user.id);
          } else {
            products = await getProductsByUserId(user.id);
          }
          stats = await getProductStats(user.id);
        } else {
          // Customer sees all active products with artisan info
          if (search) {
            products = await searchProducts(search);
          } else {
            products = await getAllActiveProductsWithArtisans(limit, offset);
          }
        }
      }
    } else {
      // If not authenticated, return public products with artisan info
      if (search) {
        products = await searchProducts(search);
      } else {
        products = await getAllActiveProductsWithArtisans(limit, offset);
      }
    }

    const responseData = {
      success: true,
      products: products,
      stats: stats,
      count: products.length
    };

    // Smart caching strategy - try to cache full data if size is reasonable
    if (!search && products.length <= 50) {
      try {
        // First, try to cache the full response
        const fullDataSize = Buffer.byteLength(JSON.stringify(responseData), 'utf8');
        console.log(`Products: Full response size: ${fullDataSize} bytes`);

        if (fullDataSize < 800000) { // 800KB limit for full data
          await setCache(cacheKey, responseData, 300); // 5 minutes
          console.log(`Products: Cached full data for key: ${cacheKey}, size: ${fullDataSize} bytes`);
        } else {
          // If full data is too large, create and cache a minimal version
          console.log(`Products: Full data too large (${fullDataSize} bytes), creating minimal cache`);
          
          const minimalProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            isActive: product.isActive,
            // Include small image URL if it exists
            imageUrl: product.imageUrl && product.imageUrl.length < 200 ? product.imageUrl : null,
          }));

          const minimalResponseData = {
            success: true,
            products: minimalProducts,
            stats: stats,
            count: products.length,
            isMinimal: true // Flag to indicate minimal data
          };

          const minimalDataSize = Buffer.byteLength(JSON.stringify(minimalResponseData), 'utf8');
          console.log(`Products: Minimal response size: ${minimalDataSize} bytes`);

          if (minimalDataSize < 500000) { // 500KB limit for minimal data
            await setCache(cacheKey + ':minimal', minimalResponseData, 180); // 3 minutes for minimal
            console.log(`Products: Cached minimal data for key: ${cacheKey}:minimal`);
          }
        }
      } catch (error) {
        console.log(`Products: Failed to cache result, continuing without cache:`, error);
      }
    } else {
      console.log(`Products: Skipping cache - search: ${!!search}, count: ${products.length}`);
    }

    return NextResponse.json(responseData);
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
    // Authentication required for creating products
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const productData = await request.json();
    console.log('Product creation request:', { user, productData });
    
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

    const product = await createProduct(productData);

    // Invalidate all product-related caches after creating a new product
    try {
      const productCacheKeys = await cache.getKeys('products:*');
      for (const key of productCacheKeys) {
        await deleteCache(key);
      }
      console.log('Products: Invalidated all product caches after creating new product');
    } catch (error) {
      console.log('Products: Failed to invalidate cache, continuing without cache cleanup:', error);
    }

    return NextResponse.json({
      success: true,
      product: product,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create product',
        details: error.message
      },
      { status: 500 }
    );
  }
}
