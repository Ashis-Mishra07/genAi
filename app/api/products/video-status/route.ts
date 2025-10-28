import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product video status
    const products = await sql`
      SELECT id, name, video_url, video_status, video_generation_id, updated_at 
      FROM products 
      WHERE id = ${productId}
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    return NextResponse.json({
      success: true,
      productId: product.id,
      productName: product.name,
      videoUrl: product.video_url,
      videoStatus: product.video_status,
      videoGenerationId: product.video_generation_id,
      updatedAt: product.updated_at
    });

  } catch (error: any) {
    console.error('Video status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check video status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
