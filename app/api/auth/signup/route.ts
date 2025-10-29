import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '../../../../lib/db/auth';
import { isValidEmail, isValidPassword, createTokensResponse, hashRefreshToken } from '../../../../lib/utils/jwt';
import { storeRefreshToken } from '../../../../lib/db/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      phone, 
      role, 
      specialty, 
      location, 
      bio,
      gender,
      photograph,
      origin_place,
      artisan_story,
      work_process,
      expertise_areas,
      artistry_description
    } = body;

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['ARTISAN', 'CUSTOMER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ARTISAN or CUSTOMER' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser({
      email,
      password,
      name,
      phone,
      role,
      specialty: role === 'ARTISAN' ? specialty : undefined,
      location,
      bio: role === 'ARTISAN' ? bio : undefined,
      gender: role === 'ARTISAN' ? gender : undefined,
      photograph: role === 'ARTISAN' ? photograph : undefined,
      origin_place: role === 'ARTISAN' ? origin_place : undefined,
      artisan_story: role === 'ARTISAN' ? artisan_story : undefined,
      work_process: role === 'ARTISAN' ? work_process : undefined,
      expertise_areas: role === 'ARTISAN' ? expertise_areas : undefined,
      artistry_description: role === 'ARTISAN' ? artistry_description : undefined,
    });

    // Generate tokens
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const tokens = createTokensResponse(authUser);

    // Store refresh token
    const refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await storeRefreshToken(user.id, refreshTokenHash, expiresAt);

    // Create response with tokens
    const response = NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: tokens,
    }, { status: 201 });

    // Clear any existing auth cookies first
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');

    // Set new authentication cookies
    response.cookies.set('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    console.log('Signup: Set auth cookies for new user:', user.email, 'ID:', user.id);
    console.log('Signup: Generated JWT payload userId:', authUser.id, 'role:', authUser.role);
    
    // Auto-trigger documentation video generation for artisans with photograph
    if (role === 'ARTISAN' && photograph) {
      try {
        console.log('Triggering artisan documentation video generation for:', user.email);
        
        // Trigger video generation in background (don't wait for response)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/artisan/generate-documentation-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({ artisanId: user.id }),
        }).catch(err => {
          console.error('Failed to trigger video generation:', err);
          // Don't fail signup if video generation fails
        });
        
        console.log('Artisan documentation video generation triggered successfully');
      } catch (error) {
        console.error('Error triggering video generation:', error);
        // Don't fail signup if video generation fails
      }
    }
    
    return response;

  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}