import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['fr', 'en', 'ar'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')
  const { pathname } = request.nextUrl

  // Determine current locale or fallback
  const currentLocale = locales.find(loc => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) || 'fr';
  
  let pathWithoutLocale = pathname;
  const localePrefix = locales.find(loc => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`);
  if (localePrefix) {
    pathWithoutLocale = pathname.replace(new RegExp(`^/${localePrefix}`), '') || '/';
  }

  // Public routes
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathWithoutLocale.startsWith(route))

  // If accessing a protected route without token, redirect to login
  if (!token && !isPublicRoute && pathWithoutLocale !== '/') {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url))
  }

  // If accessing login/register with token, redirect to home
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
