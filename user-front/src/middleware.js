import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isPublicRoute } from './config/publicRoutes';

const INFRA_PUBLIC_PREFIXES = ['/_next', '/favicon.ico', '/api/auth'];

// Protected sayfalar - authentication gerektiren sayfalar
const protectedPages = [
  '/feed/home',
  '/feed/who-to-follow',
  '/feed/papers',
  '/messaging',
  '/profile',
  '/settings',
  '/chat',
  '/social'
];

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'islamic_windows_jwt_test';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });

  // Ana sayfa yönlendirmesi
  if (pathname === '/') {
    if (token?.access_token) {
      return NextResponse.redirect(new URL('/feed/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/feed/books', request.url));
    }
  }

  if (
    isPublicRoute(pathname)
    || INFRA_PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Allow scholar profiles explicitly (bypass protected check for this specific sub-route)
  // Protected sayfalar için token kontrolü
  if (protectedPages.some(page => pathname.startsWith(page)) && !pathname.startsWith('/profile/scholar')) {
    // Token yoksa login sayfasına yönlendir
    if (!token?.access_token) {
      const loginUrl = new URL('/auth-advance/sign-in', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      // Eğer kullanıcı özel olarak belirtilen korumalı sayfalara girmeye çalışıyorsa mesaj ekle
      const specialProtected = ['/feed/home', '/feed/who-to-follow', '/messaging'];
      if (specialProtected.some(page => pathname.startsWith(page))) {
        loginUrl.searchParams.set('message', 'login_required');
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};