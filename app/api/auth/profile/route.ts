import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAccessToken } from '@/lib/utils/jwt';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      specialty, 
      location, 
      bio,
      photograph,
      gender,
      origin_place,
      artisan_story,
      artistry_description,
      work_process,
      expertise_areas
    } = body;

    // Update user profile
    const result = await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        specialty = ${specialty || null},
        location = ${location || null},
        bio = ${bio || null},
        photograph = ${photograph || null},
        gender = ${gender || null},
        origin_place = ${origin_place || null},
        artisan_story = ${artisan_story || null},
        artistry_description = ${artistry_description || null},
        work_process = ${work_process || null},
        expertise_areas = ${expertise_areas || null},
        updated_at = NOW()
      WHERE id = ${decoded.userId}
      RETURNING 
        id, name, email, phone, specialty, location, bio, role, avatar,
        photograph, gender, origin_place, artisan_story, artistry_description,
        work_process, expertise_areas, documentation_video_url, documentation_video_status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: result[0]
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
