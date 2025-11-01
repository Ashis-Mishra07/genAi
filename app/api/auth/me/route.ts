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