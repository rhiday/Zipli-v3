import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for optimized asset caching
 * Based on network analysis findings:
 * - Fonts reload on each navigation
 * - CSS chunks not properly cached
 * - JavaScript bundles could benefit from longer cache times
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Static assets with long cache times
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(woff|woff2|ttf|otf|eot)$/) ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    // Cache static assets for 1 year
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // JavaScript and CSS chunks - cache but with revalidation
  if (
    pathname.match(/\.(js|css)$/) &&
    (pathname.includes('/_next/') || pathname.startsWith('/static/'))
  ) {
    // Cache JS/CSS for 1 year but allow revalidation
    response.headers.set(
      'Cache-Control', 
      'public, max-age=31536000, stale-while-revalidate=31536000'
    );
  }

  // API routes - short cache for data freshness
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300'
    );
  }

  // Font optimization headers
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }

  // Security headers for better performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Preload key resources hint
  if (pathname === '/' || pathname === '/login' || pathname === '/donate') {
    response.headers.set(
      'Link',
      '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
    );
  }

  return response;
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/webpack-hmr (hot module replacement in dev)
     */
    '/((?!_next/webpack-hmr).*)',
  ],
};