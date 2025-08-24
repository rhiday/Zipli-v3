'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const [email, setEmail] = useState('hasan@zipli.test');
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
        setError(t('pages.auth.login.invalidCredentials'));
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
            router.push('/city/dashboard');
            break;
          default:
            console.warn(
              `Unknown user role: ${user.role}, redirecting to generic dashboard.`
            );
            router.push('/donor/dashboard');
        }
      }
    } catch (err) {
      setError(t('pages.auth.login.networkError'));
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">
            {t('pages.auth.login.welcomeBack')}
          </h1>
          <p className="mt-2 text-body text-primary-75">
            {t('pages.auth.login.title')}
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
              {t('pages.auth.login.email')}
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
              {t('pages.auth.login.password')}
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
              <label
                htmlFor="remember-me"
                className="ml-2 block text-body text-primary"
              >
                {t('pages.auth.login.rememberMe')}
              </label>
            </div>

            <div className="text-body">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-earth hover:text-primary"
              >
                {t('pages.auth.login.forgotPassword')}
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
              {loading
                ? t('pages.auth.login.signingIn')
                : t('pages.auth.login.signIn')}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <span className="text-inactive">
            {t('pages.auth.login.dontHaveAccount')}
          </span>{' '}
          <Link
            href="/auth/register"
            className="font-medium text-earth hover:text-primary"
          >
            {t('pages.auth.login.signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
