import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define which routes require authentication
const protectedRoutes = [
  '/dashboard',
  '/driver-dashboard',
  '/admin-dashboard',
  '/profile',
  '/account-type',
];

// Define which routes require specific roles
const roleBasedRoutes = {
  '/driver-dashboard': ['driver'],
  '/admin-dashboard': ['admin'],
};

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const url = new URL(request.url);
    const path = url.pathname;

    // Check if the path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    if (isProtectedRoute && !session) {
      // Redirect unauthenticated users to the login page
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Check role-based access
    for (const [routePath, allowedRoles] of Object.entries(roleBasedRoutes)) {
      if (path.startsWith(routePath) && session) {
        // We need to get the user's role from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // If user doesn't have the required role, redirect them
        if (!profile || !allowedRoles.includes(profile.role)) {
          // Redirect to dashboard or access denied page
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    // Auth callback handling - allows Supabase Auth to callback correctly
    if (path === '/auth/callback') {
      return res;
    }

    // If user is already logged in and tries to access login/signup pages, redirect to dashboard
    if (session && (path === '/signin' || path === '/signup')) {
      // Check user role to determine where to redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'driver') {
        return NextResponse.redirect(new URL('/driver-dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return res;
  } catch (e) {
    // If there's an error, proceed without blocking the request
    console.error('Middleware error:', e);
    return NextResponse.next();
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};