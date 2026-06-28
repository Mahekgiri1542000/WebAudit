import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Protect admin routes — require ADMIN or SUPER_ADMIN
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (session.user.role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Redirect logged-in users away from login/register
  if ((pathname === '/login' || pathname === '/register') && session?.user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
