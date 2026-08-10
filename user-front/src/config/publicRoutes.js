/** Routes accessible without login — keep in sync with middleware.js */
export const PUBLIC_CONTENT_ROUTES = [
  '/blogs',
  '/feed/scholars',
  '/feed/books',
  '/feed/podcasts',
  '/feed/qa',
  '/feed/questions',
  '/profile/scholar',
];

export const PUBLIC_AUTH_ROUTES = [
  '/auth-advance',
  '/auth',
];

export function isPublicContentRoute(pathname) {
  return PUBLIC_CONTENT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isPublicAuthRoute(pathname) {
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isPublicRoute(pathname) {
  return isPublicAuthRoute(pathname) || isPublicContentRoute(pathname);
}
