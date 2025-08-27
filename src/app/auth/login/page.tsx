'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Checkbox } from '@/components/ui/Checkbox';

export default function LoginPage() {
  const [email, setEmail] = useState('tsanssi@etappiry.net');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const login = useDatabase((state) => state.login);
  const { t } = useCommonTranslation();

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

      if (response.data) {
        const user = response.data;

        // Small delay to ensure store state is updated before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect based on role - always to user's own dashboard
        switch (user.role) {
          case 'food_donor':
            router.push('/donate');
            break;
          case 'food_receiver':
            router.push('/receiver/dashboard');
            break;
          case 'city':
            router.push('/dashboard');
            break;
          default:
            console.warn(
              `Unknown user role: ${user.role}, redirecting to generic dashboard.`
            );
            router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">
            {t('welcomeBack')}
          </h1>
          <p className="mt-2 text-body text-primary-75">
            {t('signInToAccount')}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('emailAddress')}
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
            <label
              htmlFor="password"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('password')}
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
            <Checkbox
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={setRememberMe}
              label={t('rememberMe')}
            />

            <div className="text-body">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-earth hover:text-primary"
              >
                {t('forgotPassword')}
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
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <span className="text-inactive">{t('dontHaveAccount')}</span>{' '}
          <Link
            href="/auth/register"
            className="font-medium text-earth hover:text-primary"
          >
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
