import { NextResponse } from 'next/server';
import { tokens, saveTokens } from '@/lib/tokens';
import { checkRateLimit, getClientIP } from '@/lib/validation';
import { randomUUID } from 'crypto';

// Secure CORS configuration - only allow specific origins
const getAllowedOrigin = (origin: string | null) => {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zipli-v3.vercel.app',
  ].filter(Boolean);

  return origin && allowedOrigins.includes(origin) ? origin : 'null';
};

// Specific user account that will be used for QR code login
const QR_LOGIN_USER_EMAIL = 'helsinki.airport@sodexo.com'; // Specific account for Helsinki Airport

export async function GET(request: Request) {
  try {
    // Rate limiting for QR token generation (more restrictive)
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`qr-token-${clientIP}`, 10, 60000); // 10 requests per minute

    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': getAllowedOrigin(
              request.headers.get('origin')
            ),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const url = new URL(request.url);
    // QR token generation request

    // Generate a cryptographically secure token
    const token = randomUUID() + randomUUID().replace(/-/g, '');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // Token valid for 24 hours

    // Store the token
    tokens[token] = {
      user_email: QR_LOGIN_USER_EMAIL,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    };

    // Save tokens to localStorage if on client
    saveTokens(tokens);

    // Clean up expired tokens
    const now = new Date();
    Object.keys(tokens).forEach((key) => {
      if (new Date(tokens[key].expires_at) < now || tokens[key].used) {
        delete tokens[key];
      }
    });

    // Save again after cleanup
    saveTokens(tokens);

    // Token generated successfully

    // Return CORS headers for cross-origin requests
    return new NextResponse(
      JSON.stringify({
        token,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || url.origin,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': getAllowedOrigin(
            request.headers.get('origin')
          ),
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('QR token generation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': getAllowedOrigin(
            request.headers.get('origin')
          ),
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(
        request.headers.get('origin')
      ),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
