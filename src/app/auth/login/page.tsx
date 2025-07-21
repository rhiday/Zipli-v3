'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DevLoginSwitcher from '@/components/dev/DevLoginSwitcher';
import { useDatabase } from '@/store/databaseStore';

export default function LoginPage() {
  const [email, setEmail] = useState('hasan@zipli.test');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const login = useDatabase(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data?.user) {
        const user = response.data.user;
        
        // Small delay to ensure store state is updated before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on role
        switch (user.role) {
          case 'food_donor':
            router.push('/donate');
            break;
          case 'food_receiver':
            router.push('/feed');
            break;
          case 'city':
            router.push('/dashboard');
            break;
          default:
            console.warn(`Unknown user role: ${user.role}, redirecting to generic dashboard.`);
            router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">Welcome back</h1>
          <p className="mt-2 text-body text-primary-75">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
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
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label font-medium text-primary mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-body text-primary">
                Remember me
              </label>
            </div>

            <div className="text-body">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-earth hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <span className="text-inactive">Don\'t have an account?</span>{' '}
          <Link
            href="/auth/register"
            className="font-medium text-earth hover:text-primary"
          >
            Sign up
          </Link>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-50">
          <DevLoginSwitcher />
        </div>
      )}
    </div>
  );
} 