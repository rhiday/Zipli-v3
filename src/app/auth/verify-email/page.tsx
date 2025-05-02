'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">Check your email</h1>
          <p className="mt-2 text-body text-primary-75">
            We&apos;ve sent you an email with a confirmation link. Please click the link to verify your account.
          </p>
          <p className="mt-4 text-body text-inactive">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/auth/login" className="font-medium text-earth hover:text-primary">
              try logging in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 