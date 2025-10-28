import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken as verifyRefreshTokenJWT, generateAccessToken, hashRefreshToken, generateRefreshToken } from '../../../../lib/utils/jwt';
import { verifyRefreshToken, getUserById, storeRefreshToken, revokeRefreshToken } from '../../../../lib/db/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify JWT structure
    const payload = await verifyRefreshTokenJWT(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token format' },
        { status: 401 }
      );
    }

    // Verify token exists in database and is not revoked
    const tokenHash = await hashRefreshToken(refreshToken);
    const userFromDB = await verifyRefreshToken(tokenHash);
    
    if (!userFromDB || userFromDB.id !== payload.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Use user from database
    const user = userFromDB;
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Generate new access token
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(authUser);

    // Optionally rotate refresh token (revoke old, create new)
    await revokeRefreshToken(tokenHash);
    
// Create new refresh token
const newRefreshToken = generateRefreshToken(user.id);
const newTokenHash = await hashRefreshToken(newRefreshToken);
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

await storeRefreshToken(user.id, newTokenHash, expiresAt);    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        user: authUser,
      },
    });

  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}