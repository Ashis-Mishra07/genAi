import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { 
  getProductsByUserId, 
  getAllActiveProducts, 
  getAllActiveProductsWithArtisans,
  getFeaturedProducts,
  getAllProducts,
  createProduct, 
  getProductStats,
  searchProducts 
} from '../../../lib/db/products-neon';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    
    // Get current user (optional for public endpoints)
    const user = await getCurrentUser(request);
    
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

    return NextResponse.json({
      success: true,
      products: products,
      stats: stats,
      count: products.length
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
