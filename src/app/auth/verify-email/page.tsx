'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We&apos;ve sent you an email with a confirmation link. Please click the link to verify your account.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-500">
              try logging in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 