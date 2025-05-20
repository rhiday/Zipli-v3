"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

// Define the status types as separate constants to help TypeScript with type narrowing
const LOADING = "loading" as const;
const SUCCESS = "success" as const;
const ERROR = "error" as const;
type StatusType = typeof LOADING | typeof SUCCESS | typeof ERROR;

// Type guard functions
const isLoading = (status: StatusType): status is typeof LOADING =>
  status === LOADING;
const isSuccess = (status: StatusType): status is typeof SUCCESS =>
  status === SUCCESS;
const isError = (status: StatusType): status is typeof ERROR =>
  status === ERROR;

// Loading component to display while suspense is resolving
function QRLoginLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent" />
      </div>
    </div>
  );
}

// The actual QR login component that uses the searchParams
function QRLoginContent() {
  const [status, setStatus] = useState<StatusType>(LOADING);
  const [message, setMessage] = useState<string>("Processing QR code login...");
  const [debug, setDebug] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we've been redirected to Vercel.com
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Log the current URL
      setDebug((prev) => prev + `Current URL: ${window.location.href}\n`);

      // Check if we're on vercel.com
      if (window.location.hostname.includes("vercel.com")) {
        setDebug(
          (prev) => prev + `Detected Vercel.com domain - this is not correct\n`
        );
        setStatus(ERROR);
        setMessage("Invalid redirect to Vercel.com. Please contact support.");

        // Try to redirect back to the app
        if (process.env.NEXT_PUBLIC_APP_URL) {
          const token = searchParams.get("token");
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/qr-login?token=${token}`;
          setDebug(
            (prev) => prev + `Attempting to redirect to: ${redirectUrl}\n`
          );

          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1000);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Flag to prevent double processing
    let processed = false;

    const processQRLogin = async () => {
      try {
        // Get token from URL
        const token = searchParams.get("token");
        setDebug((prev) => prev + `Token from URL: ${token}\n`);

        if (!token) {
          setStatus(ERROR);
          setMessage("Invalid or missing token.");
          return;
        }

        // Validate token by calling the API
        setDebug((prev) => prev + `Validating token...\n`);
        const validateResponse = await fetch(
          `/api/auth/validate-token?token=${token}`
        );
        const validationData = await validateResponse.json();
        setDebug(
          (prev) =>
            prev +
            `Validation response: ${validateResponse.status} - ${JSON.stringify(validationData)}\n`
        );

        // Accept both successful validations and "already used" tokens
        // This allows the login to work even if the browser makes multiple validation requests
        const isValidToken =
          validateResponse.ok ||
          (validateResponse.status === 403 &&
            validationData.message === "Token has already been used");

        // Check if we have a valid email in the response
        const hasValidEmail =
          validationData.user_email === "helsinki.airport@sodexo.com";

        // Combine both checks
        if (!isValidToken || !hasValidEmail) {
          setStatus(ERROR);
          setMessage(validationData.message || "Invalid or expired token.");
          return;
        }

        // If already processed, prevent further execution
        if (processed) return;
        processed = true;

        // Set email based on validation data
        const userEmail = "helsinki.airport@sodexo.com"; // Always use the predefined email

        // If valid, attempt to sign in
        setDebug((prev) => prev + `Signing in as ${userEmail}...\n`);
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: userEmail,
            // Use a predefined password or retrieve from secure environment
            password: process.env.NEXT_PUBLIC_QR_USER_PASSWORD || "password", // Replace with actual password
          });

        if (signInError) {
          setDebug((prev) => prev + `Sign in error: ${signInError.message}\n`);
          throw signInError;
        }

        if (data.user) {
          setDebug(
            (prev) => prev + `Signed in successfully as ${data.user.email}\n`
          );

          setStatus(SUCCESS);
          setMessage("Login successful! Redirecting...");

          // Immediately redirect to dashboard without waiting
          router.push("/donate/new");
          setTimeout(() => {
            router.push("/donate/new");
          }, 500);
        }
      } catch (err: any) {
        if (processed) return; // Prevent showing errors after successful processing

        console.error("QR login error:", err);
        setStatus(ERROR);
        setMessage(err.message || "An error occurred during login.");
        setDebug((prev) => prev + `Error: ${err.message}\n`);
      }
    };

    // Only proceed if we're not on vercel.com
    if (
      typeof window !== "undefined" &&
      !window.location.hostname.includes("vercel.com")
    ) {
      processQRLogin();
    }

    // Clean up if component unmounts
    return () => {
      processed = true;
    };
  }, [router, searchParams]);

  // Show a spinner while processing and redirect is happening
  if (isSuccess(status)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent" />
        </div>
      </div>
    );
  }

  // Get status-dependent CSS class
  const getStatusClass = () => {
    if (isLoading(status)) return "text-earth";
    if (isSuccess(status)) return "text-positive";
    return "text-negative";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
        <h1 className="text-titleSm font-display text-primary">
          {isLoading(status) && "Processing Login"}
          {isSuccess(status) && "Login Successful"}
          {isError(status) && "Login Failed"}
        </h1>

        <div
          className={`flex items-center justify-center h-16 ${getStatusClass()}`}
        >
          {isLoading(status) && (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          )}
          {isSuccess(status) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          {isError(status) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          )}
        </div>

        <p className="text-body text-primary-75">{message}</p>

        {/* Always show debug in vercel.com environment to help diagnose issues */}
        {(process.env.NODE_ENV === "development" ||
          (typeof window !== "undefined" &&
            window.location.hostname.includes("vercel.com"))) && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60 text-xs">
            <pre>{debug}</pre>
            <p className="mt-2 font-bold">
              Current location:{" "}
              {typeof window !== "undefined" ? window.location.href : "unknown"}
            </p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>App URL: {process.env.NEXT_PUBLIC_APP_URL || "not set"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QRLoginPage() {
  return (
    <Suspense fallback={<QRLoginLoading />}>
      <QRLoginContent />
    </Suspense>
  );
}
