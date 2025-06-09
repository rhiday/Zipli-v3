'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import clsx from 'clsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    contactPerson: '',
    contactNumber: '',
    address: '',
    role: 'food_donor' as Database['public']['Enums']['user_role'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.organizationName || !formData.contactPerson || !formData.contactNumber) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setError(null);
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            role: formData.role,
            full_name: formData.contactPerson,
            organization_name: formData.organizationName,
            contact_number: formData.contactNumber,
            address: formData.address || '',
          });

        if (profileError) throw profileError;

        router.push('/auth/verify-email');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-base p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-titleSm font-display text-primary">Create your account</h1>
          <p className="mt-2 text-body text-primary-75">
            {step === 1 ? 'Select your role' : 'Complete your registration'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-label font-medium text-primary mb-1">
                  I am registering as
                </label>
                <Select
                  name="role"
                  required
                  value={formData.role}
                  onValueChange={(value) => handleChange({ target: { name: 'role', value } } as React.ChangeEvent<HTMLSelectElement>)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food_donor">Food Donor (Restaurants, Catering, Large Kitchens)</SelectItem>
                    <SelectItem value="terminals">Food Terminals (Large-scale Food Processing Centers)</SelectItem>
                    <SelectItem value="city">City Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
            <div className="space-y-4">
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
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                  <label htmlFor="password" className="block text-label font-medium text-primary mb-1">
                    Password (min. 6 characters)
                </label>
                  <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                  <label htmlFor="confirmPassword" className="block text-label font-medium text-primary mb-1">
                  Confirm Password
                </label>
                  <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div>
                  <label htmlFor="organizationName" className="block text-label font-medium text-primary mb-1">
                  {formData.role === 'terminals' ? 'Terminal Name' :
                   formData.role === 'city' ? 'Your City' :
                   'Organization Name'}
                </label>
                {formData.role === 'city' ? (
                  <Select
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onValueChange={(value) => handleChange({ target: { name: 'organizationName', value } } as React.ChangeEvent<HTMLSelectElement>)}
                  >
                    <SelectTrigger id="organizationName">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helsinki">Helsinki</SelectItem>
                      <SelectItem value="Espoo">Espoo</SelectItem>
                      <SelectItem value="Vantaa">Vantaa</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                    <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder={formData.role === 'terminals' ? 'Enter terminal name' : 'Enter organization name'}
                  />
                )}
              </div>
              <div>
                  <label htmlFor="contactPerson" className="block text-label font-medium text-primary mb-1">
                  Contact Person
                </label>
                  <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>
              <div>
                  <label htmlFor="contactNumber" className="block text-label font-medium text-primary mb-1">
                  Contact Number
                </label>
                  <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                  <label htmlFor="address" className="block text-label font-medium text-primary mb-1">
                    Address (Optional)
                </label>
                  <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            </>
          )}

          <div className={clsx("flex", step === 1 ? "justify-end" : "justify-between")}>
            {step === 2 && (
              <Button type="button" variant="secondary" onClick={prevStep} disabled={loading}>
                Back
              </Button>
            )}
            <Button
              type={step === 1 ? "button" : "submit"}
              variant="primary"
              onClick={step === 1 ? nextStep : undefined}
              disabled={loading}
              className={step === 1 ? "w-full" : ""}
            >
              {step === 1 ? 'Next' : loading ? 'Registering...' : 'Register Account'}
            </Button>
          </div>
        </form>

        <div className="text-center text-body">
          <span className="text-inactive">Already have an account? </span>
          <Link
            href="/auth/login"
            className="font-medium text-earth hover:text-primary"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
} 