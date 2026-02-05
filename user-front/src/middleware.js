import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public sayfalar - authentication gerektirmeyen sayfalar
const publicPages = [
  '/auth-advance/sign-in',
  '/auth/sign-in', 
  '/auth/sign-up',
  '/auth/forgot-pass',
  '/api/auth',
  '/_next',
  '/favicon.ico'
];

// Protected sayfalar - authentication gerektiren sayfalar
const protectedPages = [
  '/feed',
  '/profile',
  '/settings',
  '/messaging',
  '/chat',
  '/social'
];

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'kvwLrfri/MBznUCofIoRH9+NvGu6GqvVdqO3mor1GuA=';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Ana sayfa yönlendirmesi
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/feed/home', request.url));
  }
  
  // Public sayfalar için middleware çalıştırma
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.next();
  }
  
  // Protected sayfalar için token kontrolü
  if (protectedPages.some(page => pathname.startsWith(page))) {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
    
    // Token yoksa login sayfasına yönlendir
    // Not: biz backend JWT'i `token.access_token` alanında tutuyoruz
    if (!token?.access_token) {
      const loginUrl = new URL('/auth-advance/sign-in', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
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