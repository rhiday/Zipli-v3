"use client";

import React from "react";
import QRLoginGenerator from "@/components/auth/QRLoginGenerator";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminQRLoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check if user is logged in and has admin access
  const isAuthorized =
    !isLoading &&
    user &&
    (user.email?.includes("city@zipli") || user.email?.includes("admin@zipli"));

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-earth border-r-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
          <h1 className="text-titleSm font-display text-negative">
            Access Denied
          </h1>
          <p className="text-body text-primary-75">
            You don't have permission to access this page.
          </p>
          <Link href="/">
            <Button variant="primary">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream p-4">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-titleLg font-display text-primary">
            QR Login Setup
          </h1>
          <p className="text-body text-primary-75">
            Use this QR code for scanning-based login to the Helsinki Airport
            account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base p-6 rounded-lg shadow-md">
            <h2 className="text-titleXs font-display text-primary mb-4">
              Instructions
            </h2>
            <ol className="space-y-4 text-body text-primary-75 list-decimal pl-5">
              <li>
                Display this QR code on a tablet or screen at your terminal
                location.
              </li>
              <li>
                Users can scan this code with their phone camera to instantly
                log in.
              </li>
              <li>
                The QR code refreshes automatically every 10 Minutes for
                security.
              </li>
              <li>Each code is valid for 1 day after generation.</li>
              <li>For security reasons, each code can only be used once.</li>
            </ol>
          </div>

          <div className="flex items-center justify-center">
            <QRLoginGenerator />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
