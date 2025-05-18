import { NextResponse } from 'next/server';

// Specific user account that will be used for QR code login
const QR_LOGIN_USER_EMAIL = 'helsinki.airport@sodexo.com'; // Specific account for Helsinki Airport

// Create a persistent token storage that won't be reset by Hot Module Replacement (HMR)
// This is a better approach for development, though in production you should use a database
// @ts-ignore - Define the global tokens object
if (typeof global !== 'undefined' && !global.tokens) {
  // @ts-ignore
  global.tokens = {};
}

// Fallback for client-side rendering or Edge runtime
let localTokens = {};

// Get the appropriate tokens storage
// @ts-ignore
const getTokens = () => typeof global !== 'undefined' ? global.tokens : localTokens;

export async function GET(request: Request) {
  try {
    // Generate a unique token - simplified version without uuid dependency
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Token valid for 10 minutes
    
    // Store the token
    const tokens = getTokens();
    tokens[token] = {
      user_email: QR_LOGIN_USER_EMAIL,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString()
    };
    
    // Clean up expired tokens
    const now = new Date();
    Object.keys(tokens).forEach(key => {
      if (new Date(tokens[key].expires_at) < now || tokens[key].used) {
        delete tokens[key];
      }
    });
    
    // Debug log
    console.log(`Token generated: ${token}`);
    console.log('Current tokens:', JSON.stringify(tokens, null, 2));
    
    // Return CORS headers for cross-origin requests
    return new NextResponse(
      JSON.stringify({ token }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export tokens for use in the QR code login handler
export const tokens = getTokens(); 