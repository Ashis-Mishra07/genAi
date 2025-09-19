import { NextRequest, NextResponse } from 'next/server';
import { productOperations } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let products;
    if (search) {
      products = await productOperations.searchProducts(search);
    } else {
      products = await productOperations.getAllProducts(limit, offset);
    }

    return NextResponse.json({
      success: true,
      products: products,
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
    const productData = await request.json();

    const product = await productOperations.createProduct(productData);

    return NextResponse.json({
      success: true,
      product: product,
      message: 'Product created successfully'
    });
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
