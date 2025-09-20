import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { 
  getProductById, 
  getProductByIdWithArtisan,
  updateProduct, 
  deleteProduct 
} from '../../../../lib/db/products-neon';

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

    return NextResponse.json({
      success: true,
      product: product
    });
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
