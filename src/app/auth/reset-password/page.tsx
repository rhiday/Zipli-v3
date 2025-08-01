'use client';

import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const updatePassword = useDatabase(state => state.updatePassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await updatePassword(password);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/auth/login?message=Password updated successfully');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">Set new password</h1>
          <p className="mt-2 text-body text-primary-75">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-label font-medium text-primary mb-1">
              New password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-label font-medium text-primary mb-1">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <Link
            href="/auth/login"
            className="font-medium text-earth hover:text-primary"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-body text-primary-75">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
} 