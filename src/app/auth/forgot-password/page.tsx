'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useDatabase } from '@/store/databaseStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resetPassword = useDatabase(state => state.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await resetPassword(email);
      
      if (response.error) {
        setError(response.error);
      } else {
        setMessage('If an account with that email exists, we\'ve sent you a password reset link.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">Reset your password</h1>
          <p className="mt-2 text-body text-primary-75">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-md bg-earth/10 p-4 text-body text-earth">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-label font-medium text-primary mb-1">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              {loading ? 'Sending...' : 'Send reset link'}
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