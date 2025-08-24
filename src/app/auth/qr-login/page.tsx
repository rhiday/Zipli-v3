'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useDatabase } from '@/store';

function QRLoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const login = useDatabase((state) => state.login);

  const handleQRLogin = async () => {
    if (!token) {
      setError('Invalid QR login token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For mock purposes, we'll use a predefined email for QR login
      // In a real app, you'd validate the token and get the associated user
      const mockEmail = 'admin@zipli.test'; // Default to admin for QR login
      const response = await login(mockEmail, 'password');

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data) {
        const user = response.data;
        // Redirect based on role
        switch (user.role) {
          case 'food_donor':
            router.push('/donate');
            break;
          case 'food_receiver':
            router.push('/feed');
            break;
          case 'city':
            router.push('/city/dashboard');
            break;
          default:
            router.push('/donor/dashboard');
        }
      }
    } catch (err) {
      setError('QR login failed. Please try again.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
          <h1 className="text-titleSm font-display text-negative">
            Invalid QR Code
          </h1>
          <p className="text-body text-primary-75">
            This QR login link is invalid or has expired.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" size="md">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
        <h1 className="text-titleSm font-display text-primary">QR Login</h1>
        <p className="text-body text-primary-75">
          You're about to log in via QR code. Click the button below to complete
          the login.
        </p>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleQRLogin}
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Complete QR Login'}
          </Button>

          <Link href="/auth/login">
            <Button variant="secondary" size="md" className="w-full">
              Use Regular Login Instead
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QRLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
          <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-body text-primary-75">Loading...</p>
          </div>
        </div>
      }
    >
      <QRLoginPageContent />
    </Suspense>
  );
}
