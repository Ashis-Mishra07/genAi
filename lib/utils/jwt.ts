import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getUserById } from '../db/auth';
import type { AuthUser } from '../db/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'ARTISAN' | 'CUSTOMER';
  name?: string;
  iat?: number;
  exp?: number;
}

// Generate access token
export function generateAccessToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name || undefined,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Generate refresh token
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Extract token from request headers
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    const user = await getUserById(payload.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}

// Role-based access control
export function hasRole(user: AuthUser | null, allowedRoles: ('ADMIN' | 'ARTISAN' | 'CUSTOMER')[]): boolean {
  if (!user) {
    return false;
  }
  return allowedRoles.includes(user.role);
}

// Admin-only access
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['ADMIN']);
}

// Artisan access
export function isArtisan(user: AuthUser | null): boolean {
  return hasRole(user, ['ARTISAN']);
}

// Customer access
export function isCustomer(user: AuthUser | null): boolean {
  return hasRole(user, ['CUSTOMER']);
}

// Artisan or Admin access
export function isArtisanOrAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['ADMIN', 'ARTISAN']);
}

// Generate hash for storing refresh tokens securely
export function hashRefreshToken(token: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Create tokens response
export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
}

export function createTokensResponse(user: AuthUser): TokensResponse {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    user,
  };
}

// Middleware for protecting routes
export interface AuthMiddlewareOptions {
  allowedRoles?: ('ADMIN' | 'ARTISAN' | 'CUSTOMER')[];
  required?: boolean;
}

export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ user: AuthUser | null; error?: string }> {
  const { allowedRoles, required = true } = options;

  try {
    const user = await getCurrentUser(request);

    if (required && !user) {
      return { user: null, error: 'Authentication required' };
    }

    if (allowedRoles && user && !hasRole(user, allowedRoles)) {
      return { user: null, error: 'Insufficient permissions' };
    }

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

// Generate secure admin passcode
export function generateAdminPasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}