import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getCurrentUser } from '@/lib/utils/jwt';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { artisanId } = await request.json();

    if (!artisanId) {
      return NextResponse.json(
        { success: false, error: 'Artisan ID is required' },
        { status: 400 }
      );
    }

    // Only allow admins or the artisan themselves to generate documentation
    if (user.role !== 'ADMIN' && user.id !== artisanId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch artisan details
    const artisans = await sql`
      SELECT 
        id,
        name,
        gender,
        specialty,
        origin_place,
        location,
        artisan_story,
        work_process,
        expertise_areas,
        artistry_description,
        photograph,
        avatar,
        documentation_video_status
      FROM users
      WHERE id = ${artisanId} AND role = 'ARTISAN'
    `;

    if (artisans.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Artisan not found' },
        { status: 404 }
      );
    }

    const artisan = artisans[0];

    // Check if video generation is already in progress
    if (artisan.documentation_video_status === 'PROCESSING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Video generation already in progress for this artisan',
          status: artisan.documentation_video_status
        },
        { status: 409 }
      );
    }

    // Update status to PROCESSING
    await sql`
      UPDATE users
      SET documentation_video_status = 'PROCESSING',
          updated_at = NOW()
      WHERE id = ${artisanId}
    `;

    // Prepare payload for n8n webhook
    const n8nWebhookUrl = process.env.N8N_ARTISAN_VIDEO_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_ARTISAN_VIDEO_WEBHOOK_URL environment variable is not set');
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/artisan/video-callback`;

    const payload = {
      artisanId: artisan.id,
      artisanName: artisan.name,
      gender: artisan.gender || 'person',
      specialty: artisan.specialty,
      originPlace: artisan.origin_place || artisan.location,
      artisanStory: artisan.artisan_story || `${artisan.name} is a skilled ${artisan.specialty} artisan.`,
      workProcess: artisan.work_process || `Traditional ${artisan.specialty} crafting techniques.`,
      expertiseAreas: artisan.expertise_areas || artisan.specialty,
      photographUrl: artisan.photograph || artisan.avatar,
      callbackUrl: callbackUrl
    };

    console.log('Triggering n8n artisan video generation workflow:', {
      artisanId: artisan.id,
      artisanName: artisan.name,
      webhookUrl: n8nWebhookUrl
    });

    // Trigger n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook failed:', errorText);
      
      // Revert status on failure
      await sql`
        UPDATE users
        SET documentation_video_status = 'FAILED',
            updated_at = NOW()
        WHERE id = ${artisanId}
      `;
      
      throw new Error(`Failed to trigger video generation: ${errorText}`);
    }

    const n8nResult = await n8nResponse.json();
    console.log('n8n workflow triggered successfully:', n8nResult);

    return NextResponse.json({
      success: true,
      message: 'Artisan documentation video generation started successfully',
      artisanId: artisan.id,
      artisanName: artisan.name,
      status: 'PROCESSING',
      workflowResponse: n8nResult
    });

  } catch (error: any) {
    console.error('Artisan video generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start video generation',
        details: error.message
      },
      { status: 500 }
    );
  }
}
