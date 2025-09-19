import { NextRequest, NextResponse } from 'next/server';
import { productOperations, inquiryOperations } from '@/lib/db/products';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await productOperations.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get inquiries for this product
    const inquiries = await inquiryOperations.getInquiriesByProductId(id);

    return NextResponse.json({
      success: true,
      product: product,
      inquiries: inquiries
    });
  } catch (error: any) {
    console.error('Product GET error:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await productOperations.updateProduct(id, updates);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Product UPDATE error:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const deleted = await productOperations.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Product DELETE error:', error);
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
