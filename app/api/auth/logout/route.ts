import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashRefreshToken } from '../../../../lib/utils/jwt';
import { revokeRefreshToken, revokeAllUserTokens, updateUserLoginStatus } from '../../../../lib/db/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, logoutAll = false } = body;

    // Get current user from access token
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (logoutAll) {
      // Revoke all tokens for the user
      await revokeAllUserTokens(user.id);
    } else if (refreshToken) {
      // Revoke specific refresh token
      const tokenHash = await hashRefreshToken(refreshToken);
      await revokeRefreshToken(tokenHash);
    }

    // Update user status to offline
    await updateUserLoginStatus(user.id, 'OFFLINE');

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logout successful',
    });

    // Clear authentication cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    console.log('Logout: Cleared auth cookies for user:', user.email);
    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET method for logout via URL (for cases where POST isn't convenient)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user) {
      await updateUserLoginStatus(user.id, 'OFFLINE');
    }

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Clear authentication cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    console.log('Logout: Cleared auth cookies');
    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}