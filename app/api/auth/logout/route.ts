import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashRefreshToken } from '../../../../lib/jwt-utils';
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
      await revokeAllUserTokens(user.userId);
    } else if (refreshToken) {
      // Revoke specific refresh token
      const tokenHash = await hashRefreshToken(refreshToken);
      await revokeRefreshToken(tokenHash);
    }

    // Update user status to offline
    await updateUserLoginStatus(user.userId, 'OFFLINE');

    return NextResponse.json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logout successful',
    });

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
      await updateUserLoginStatus(user.userId, 'OFFLINE');
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}