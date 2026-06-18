import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { publicPaths } from '@/constants/permission';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/brand') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get('session_id')?.value;

  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isAuthenticated = !!sessionId || !!refreshToken;

  const isPublicRoute = publicPaths.includes(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!favicon.ico).*)'],
};
