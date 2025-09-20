import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getUserByEmail, verifyAdminPasscode } from '../../../../lib/db/auth';
import { isValidEmail, createTokensResponse, hashRefreshToken } from '../../../../lib/utils/jwt';
import { storeRefreshToken } from '../../../../lib/db/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Regular user login with email and password
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: tokens,
    });

  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}