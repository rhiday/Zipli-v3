import { NextResponse } from "next/server";
import { tokens, saveTokens } from "@/lib/tokens";

export async function GET(request: Request) {
  try {
    // Get token from URL
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    console.log(`Validating token from origin: ${url.origin}`);
    console.log(`Token to validate: ${token}`);
    console.log("Current tokens:", JSON.stringify(tokens, null, 2));

    if (!token) {
      console.log("No token provided");
      return new NextResponse(
        JSON.stringify({ valid: false, message: "Token is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if token exists
    if (!tokens[token]) {
      console.log(`Token not found: ${token}`);
      return new NextResponse(
        JSON.stringify({ valid: false, message: "Invalid token" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get token data
    const tokenData = tokens[token];
    console.log(`Token data:`, tokenData);

    // Check if token is used
    if (tokenData.used) {
      console.log(`Token already used: ${token}`);
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
            "Access-Control-Allow-Origin": "*",
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

      console.log(`Token expired: ${token}`);
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
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Mark token as used
    tokenData.used = true;
    saveTokens(tokens);

    console.log(`Token validated successfully: ${token}`);

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
    console.error("Token validation error:", error);
    return new NextResponse(
      JSON.stringify({ valid: false, message: "Internal server error" }),
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
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
