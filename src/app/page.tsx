import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Zipli!</h1>
        <p className="mt-2 mb-8 text-gray-600">
          Join our community to donate or receive food
        </p>

        {/* cursor: Log in Button */}
        <Link href="/auth/login" className="w-full">
          <Button className="w-full bg-green-700 hover:bg-green-600 shadow-md">
            Log in
          </Button>
        </Link>

        {/* cursor: Register Link */}
        <p className="mt-6 text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link href="/auth/register" className="font-medium text-green-700 hover:text-green-600">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
} 