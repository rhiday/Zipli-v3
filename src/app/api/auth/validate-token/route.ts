import { NextResponse } from "next/server";
import { tokens, saveTokens } from "@/lib/tokens";
import { checkRateLimit, getClientIP } from "@/lib/validation";

// Secure CORS configuration - only allow specific origins
const getAllowedOrigin = (origin: string | null) => {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://zipli-v3.vercel.app'
  ].filter(Boolean);
  
  return origin && allowedOrigins.includes(origin) ? origin : 'null';
};

export async function GET(request: Request) {
  try {
    // Rate limiting for token validation
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`validate-token-${clientIP}`, 30, 60000); // 30 requests per minute
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ valid: false, message: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Get token from URL
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    // Validation request received

    if (!token) {
      // No token provided in request
      return new NextResponse(
        JSON.stringify({ valid: false, message: "Token is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
          },
        }
      );
    }

    // Check if token exists
    if (!tokens[token]) {
      // Invalid token provided
      return new NextResponse(
        JSON.stringify({ valid: false, message: 'Invalid token' }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
          },
        }
      );
    }

    // Get token data
    const tokenData = tokens[token];
    // Token found in store

    // Check if token is used
    if (tokenData.used) {
      // Token already consumed
      return new NextResponse(
        JSON.stringify({
          valid: false,
          message: "Token has already been used",
          user_email: tokenData.user_email, // Always include email in the response
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
          },
        }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      // Remove expired token
      delete tokens[token];
      saveTokens(tokens);

      // Token has expired
      return new NextResponse(
        JSON.stringify({
          valid: false,
          message: "Token has expired",
          user_email: tokenData.user_email, // Add user email here as well
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
          },
        }
      );
    }

    // Mark token as used
    tokenData.used = true;
    saveTokens(tokens);

    // Token validated successfully

    // Return success
    return new NextResponse(
      JSON.stringify({
        valid: true,
        user_email: tokenData.user_email,
        expires_at: tokenData.expires_at,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return new NextResponse(
      JSON.stringify({ valid: false, message: 'Internal server error' }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": getAllowedOrigin(request.headers.get('origin')),
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
