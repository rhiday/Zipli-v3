'use client';

import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';

function ConfirmPageContent() {
  const { t } = useCommonTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const verifyOtp = useDatabase((state) => state.verifyOtp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!verificationCode.trim()) {
      setError(t('validation.enterVerificationCode'));
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(email, verificationCode, 'signup');

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
            router.push('/receiver/dashboard');
            break;
          case 'city':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch {
      setError(t('errors.genericError'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">
            {t('auth.verifyEmail')}
          </h1>
          <p className="mt-2 text-body text-primary-75">{t('checkEmail')}</p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.verificationCode')}
            </label>
            <Input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={t('forms.enter6DigitCode')}
              maxLength={6}
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
              {loading ? t('auth.verifying') : t('auth.verifyEmail')}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <p className="text-primary-75 mb-2">{t('auth.didntReceiveCode')}</p>
          <button
            type="button"
            className="font-medium text-earth hover:text-primary"
            onClick={() => {
              // In a real app, you'd resend the verification email
              alert(t('auth.verificationCodeResent'));
            }}
          >
            {t('auth.resendCode')}
          </button>
        </div>

        <div className="text-center text-body">
          <Link
            href="/auth/login"
            className="font-medium text-earth hover:text-primary"
          >
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center bg-cream p-4">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-body text-primary-75">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <ConfirmPageContent />
    </Suspense>
  );
}
