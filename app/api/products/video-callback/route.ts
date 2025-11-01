import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { productId, videoUrl, status, error } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('Video callback received:', {
      productId,
      status,
      hasVideoUrl: !!videoUrl,
      error
    });

    if (status === 'COMPLETED' && videoUrl) {
      // Update product with video URL and mark as completed
      await sql`
        UPDATE products 
        SET video_url = ${videoUrl},
            video_status = 'COMPLETED',
            updated_at = NOW()
        WHERE id = ${productId}
      `;

      console.log('Product video updated successfully:', productId);

      return NextResponse.json({
        success: true,
        message: 'Video URL updated successfully',
        productId,
        videoUrl
      });
    } else if (status === 'FAILED' || error) {
      // Mark video generation as failed
      await sql`
        UPDATE products 
        SET video_status = 'FAILED',
            updated_at = NOW()
        WHERE id = ${productId}
      `;

      console.error('Video generation failed for product:', productId, error);

      return NextResponse.json({
        success: false,
        message: 'Video generation failed',
        productId,
        error
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid callback status' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Video callback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process video callback',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
