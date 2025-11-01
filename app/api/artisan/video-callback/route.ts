import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { artisanId, videoUrl, status, error } = await request.json();

    if (!artisanId) {
      return NextResponse.json(
        { success: false, error: 'Artisan ID is required' },
        { status: 400 }
      );
    }

    console.log('Artisan video callback received:', {
      artisanId,
      status,
      hasVideoUrl: !!videoUrl,
      error
    });

    if (status === 'COMPLETED' && videoUrl) {
      // Update artisan with video URL and mark as completed
      await sql`
        UPDATE users
        SET documentation_video_url = ${videoUrl},
            documentation_video_status = 'COMPLETED',
            updated_at = NOW()
        WHERE id = ${artisanId}
      `;

      console.log('Artisan documentation video updated successfully:', artisanId);

      return NextResponse.json({
        success: true,
        message: 'Video URL updated successfully',
        artisanId,
        videoUrl
      });

    } else if (status === 'FAILED' || error) {
      // Mark video generation as failed
      await sql`
        UPDATE users
        SET documentation_video_status = 'FAILED',
            updated_at = NOW()
        WHERE id = ${artisanId}
      `;

      console.error('Artisan video generation failed:', artisanId, error);

      return NextResponse.json({
        success: false,
        message: 'Video generation failed',
        artisanId,
        error
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid callback status' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Artisan video callback error:', error);
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
