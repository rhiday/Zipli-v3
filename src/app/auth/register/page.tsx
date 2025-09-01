'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/hooks/useTranslations';

export default function RegisterPage() {
  const { t } = useCommonTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
    contactNumber: '',
    address: '',
    role: 'food_donor' as 'food_donor' | 'food_receiver' | 'city' | 'terminals',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const register = useDatabase((state) => state.register);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 RegisterPage - Form submitted with data:', formData);

    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      console.error('🎯 RegisterPage - Password mismatch');
      setError(t('validation.passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      console.error('🎯 RegisterPage - Password too short');
      setError(t('validation.passwordMinLength'));
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        full_name: formData.fullName,
        role: formData.role,
        organization_name: formData.organizationName,
        contact_number: formData.contactNumber,
        address: formData.address,
      };

      console.log('🎯 RegisterPage - Calling register with:', {
        email: formData.email,
        userData: registrationData,
      });

      const response = await register(
        formData.email,
        formData.password,
        registrationData
      );

      console.log('🎯 RegisterPage - Registration response:', {
        hasData: !!response.data,
        error: response.error,
        data: response.data,
      });

      if (response.error) {
        console.error('🎯 RegisterPage - Registration error:', response.error);
        setError(response.error);
        setLoading(false);
        return;
      }

      // Registration successful - redirect to appropriate dashboard
      if (response.data) {
        const user = response.data;
        console.log(
          '🎯 RegisterPage - Success! Redirecting user with role:',
          user.role
        );

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
    } catch (err) {
      console.error('🎯 RegisterPage - Caught exception:', err);
      setError(t('errors.registrationFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">
            {t('auth.createAccount')}
          </h1>
          <p className="mt-2 text-body text-primary-75">
            {t('auth.joinZipliToShare')}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.emailAddress')} *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.fullName')} *
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.iAmA')} *
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <option value="food_donor">{t('roles.foodDonor')}</option>
              <option value="food_receiver">{t('roles.foodReceiver')}</option>
              <option value="city">{t('roles.cityOfficial')}</option>
              <option value="terminals">{t('roles.terminalOperator')}</option>
            </Select>
          </div>

          <div>
            <label
              htmlFor="organizationName"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.organizationName')}
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={(e) =>
                handleInputChange('organizationName', e.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="contactNumber"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.contactNumber')}
            </label>
            <Input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange('contactNumber', e.target.value)
              }
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.address')}
            </label>
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.password')} *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-label font-medium text-primary mb-1"
            >
              {t('forms.confirmPassword')} *
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
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
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <span className="text-inactive">{t('auth.alreadyHaveAccount')}</span>{' '}
          <Link
            href="/auth/login"
            className="font-medium text-earth hover:text-primary"
          >
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
