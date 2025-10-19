import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { 
  getProductById, 
  getProductByIdWithArtisan,
  updateProduct, 
  deleteProduct 
} from '../../../../lib/db/products-neon';
import { getCache, setCache, deleteCache } from '../../../../lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get current user to determine what data to return
    let user = null;
    try {
      user = await getCurrentUser(request);
    } catch {
      // User not authenticated, treat as public access
    }

    // Create cache key based on user type and product id
    const userType = user ? user.role : 'PUBLIC';
    const cacheKey = `product:${id}:${userType}`;
    
    // Try to get from cache first
    try {
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log(`Product Detail: Cache hit for key: ${cacheKey}`);
        return NextResponse.json(cachedResult);
      }
    } catch (cacheError) {
      console.log('Product Detail: Cache retrieval failed, continuing with database query');
    }

    let product;
    
    // If user is customer or not authenticated, include artisan information
    if (!user || user.role === 'CUSTOMER') {
      product = await getProductByIdWithArtisan(id);
    } else {
      // For artisans/admins, use regular function
      product = await getProductById(id);
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Only show active products to customers/public
    if ((!user || user.role === 'CUSTOMER') && !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const responseData = {
      success: true,
      product: product
    };

    // Don't cache individual products or cache full data
    // Individual product pages need all fields including video
    try {
      const dataSize = Buffer.byteLength(JSON.stringify(responseData), 'utf8');
      console.log(`Product Detail: Full data size: ${dataSize} bytes`);
      
      if (dataSize < 200000) { // 200KB limit for individual products with video
        await setCache(cacheKey, responseData, 300); // 5 minutes instead of 10
        console.log(`Product Detail: Cached full result for key: ${cacheKey}`);
      } else {
        console.log(`Product Detail: Data too large, skipping cache`);
      }
    } catch (cacheError) {
      console.log('Product Detail: Failed to cache result, continuing without cache');
    }

    // Return full data
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Get product error:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authentication required for updating products
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: 'Artisan authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    const product = await updateProduct(id, user.id, updates);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Invalidate cache for this product after update
    try {
      const cacheKeys = [
        `product:${id}:ARTISAN`,
        `product:${id}:CUSTOMER`, 
        `product:${id}:PUBLIC`
      ];
      
      for (const key of cacheKeys) {
        await deleteCache(key);
      }
      console.log(`Product Update: Invalidated cache for product ${id}`);
    } catch (cacheError) {
      console.log('Product Update: Cache invalidation failed, but update succeeded');
    }

    return NextResponse.json({
      success: true,
      product: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authentication required for deleting products
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: 'Artisan authentication required' },
        { status: 401 }
      );
    }

    const success = await deleteProduct(id, user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Product not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Invalidate cache for this product after deletion
    try {
      const cacheKeys = [
        `product:${id}:ARTISAN`,
        `product:${id}:CUSTOMER`, 
        `product:${id}:PUBLIC`
      ];
      
      for (const key of cacheKeys) {
        await deleteCache(key);
      }
      console.log(`Product Delete: Invalidated cache for product ${id}`);
    } catch (cacheError) {
      console.log('Product Delete: Cache invalidation failed, but deletion succeeded');
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete product',
        details: error.message
      },
      { status: 500 }
    );
  }
}
