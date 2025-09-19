import { NextRequest, NextResponse } from 'next/server';
import { createTokensResponse } from '../../../../lib/jwt-utils';

const ADMIN_PASSCODE = '123456';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode) {
      return NextResponse.json(
        { error: 'Passcode is required' },
        { status: 400 }
      );
    }

    // Validate passcode
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { error: 'Invalid admin passcode' },
        { status: 401 }
      );
    }

    // Create admin user object for token generation
    const adminUser = {
      id: 'admin',
      email: 'admin@system.local',
      name: 'System Administrator',
      role: 'ADMIN' as const
    };

    // Generate tokens
    const tokensResponse = createTokensResponse(adminUser);

    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      ...tokensResponse
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}