import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { getUserById } from '../../../../lib/db/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get full user details
    const fullUser = await getUserById(user.id);
    
    if (!fullUser || !fullUser.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Return user data without sensitive information
    const userData = {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      phone: fullUser.phone,
      role: fullUser.role,
      specialty: fullUser.specialty,
      location: fullUser.location,
      bio: fullUser.bio,
      avatar: fullUser.avatar,
      photograph: (fullUser as any).photograph,
      gender: (fullUser as any).gender,
      origin_place: (fullUser as any).origin_place,
      artisan_story: (fullUser as any).artisan_story,
      work_process: (fullUser as any).work_process,
      expertise_areas: (fullUser as any).expertise_areas,
      artistry_description: (fullUser as any).artistry_description,
      documentation_video_url: (fullUser as any).documentation_video_url,
      documentation_video_status: (fullUser as any).documentation_video_status,
      status: fullUser.status,
      lastLoginAt: fullUser.lastLoginAt,
      createdAt: fullUser.createdAt,
    };

    return NextResponse.json({
      success: true,
      user: userData,
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}