import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Fetch all artisans with their documentation details
    const artisans = await sql`
      SELECT 
        id,
        name,
        email,
        specialty,
        location,
        origin_place,
        bio,
        artisan_story,
        photograph,
        avatar,
        documentation_video_url,
        documentation_video_status,
        gender,
        expertise_areas,
        artistry_description,
        work_process,
        created_at
      FROM users
      WHERE role = 'ARTISAN' AND is_active = true
      ORDER BY 
        CASE 
          WHEN documentation_video_status = 'COMPLETED' THEN 1
          WHEN documentation_video_status = 'PROCESSING' THEN 2
          ELSE 3
        END,
        created_at DESC
    `;

    return NextResponse.json({
      success: true,
      artisans: artisans.map(artisan => ({
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
        specialty: artisan.specialty,
        location: artisan.location,
        origin_place: artisan.origin_place,
        bio: artisan.bio,
        artisan_story: artisan.artisan_story,
        photograph: artisan.photograph || artisan.avatar, // Fallback to avatar if photograph is null
        avatar: artisan.avatar,
        documentation_video_url: artisan.documentation_video_url,
        documentation_video_status: artisan.documentation_video_status,
        gender: artisan.gender,
        expertise_areas: artisan.expertise_areas,
        artistry_description: artisan.artistry_description,
        work_process: artisan.work_process,
        created_at: artisan.created_at
      }))
    });

  } catch (error: any) {
    console.error('Failed to fetch artisans:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch artisans',
        details: error.message
      },
      { status: 500 }
    );
  }
}
