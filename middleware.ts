import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/jwt-utils';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['ADMIN'],
  '/admin': ['ADMIN'],
  '/artisan': ['ARTISAN'],
  '/customer': ['CUSTOMER'],
  '/api/admin': ['ADMIN'],
  '/api/artisan': ['ARTISAN'],
  '/api/customer': ['CUSTOMER']
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/admin',
  '/auth/artisan', 
  '/auth/customer',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/admin',
  '/api/auth/refresh',
  '/api/db/init',
  '/api/db/check-structure'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Allow static files
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookies
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    token = request.cookies.get('auth_token')?.value;
  }

  // Redirect to role selection if no token
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify JWT token
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId || !payload.role) {
      throw new Error('Invalid token payload');
    }

    // Check if route requires specific role
    const matchedRoute = Object.keys(protectedRoutes).find(route => 
      pathname.startsWith(route)
    );

    if (matchedRoute) {
      const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
      
      if (!requiredRoles.includes(payload.role)) {
        // Redirect to appropriate auth page based on role
        switch (payload.role) {
          case 'ADMIN':
            return NextResponse.redirect(new URL('/dashboard', request.url));
          case 'ARTISAN':
            return NextResponse.redirect(new URL('/artisan/dashboard', request.url));
          case 'CUSTOMER':
            return NextResponse.redirect(new URL('/customer/dashboard', request.url));
          default:
            return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-role', payload.role);
    
    return response;
    
  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // Clear invalid token and redirect to home
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}