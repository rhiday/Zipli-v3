import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-titleMd font-display text-primary">Welcome to Zipli!</h1>
        <p className="mt-2 mb-8 text-body text-primary-75">
          Join our community to donate or receive food
        </p>

        <Link href="/auth/login" className="w-full">
          <Button variant="primary" size="md" className="w-full">
            Log in
          </Button>
        </Link>

        <p className="mt-6 text-body">
          <span className="text-inactive">Don't have an account? </span>
          <Link href="/auth/register" className="font-medium text-earth hover:text-primary">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
} 