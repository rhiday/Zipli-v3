'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { RecurringRequest } from '@/types/request.types';

type RecurringFormInputs = {
  description: string;
  quantity: string;
};

export default function RecurringRequestForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RecurringFormInputs>();

  const watchedFields = watch();

  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0 &&
    selectedAllergens.length > 0;

  const onSubmit = async (data: RecurringFormInputs) => {
    try {
      const requestData = {
        request_type: 'recurring',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      };

      // Log the structured data for testing
      console.log('Recurring Request Data:', requestData);
      console.log('Ready for Supabase:', JSON.stringify(requestData, null, 2));

      // Store in session storage for now (will be replaced with Supabase)
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Navigate to schedule page (following donor flow pattern)
      router.push('/request/schedule');
    } catch (error) {
      console.error(t('pages.requests.failed_to_create_recurring_req'), error);
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
title="Default"
            backHref="/request/select-type"
            onBackClick={() => router.back()}
          />
          <div className="px-4 pt-2">
            <Progress value={33} className="h-2 w-full" />
          </div>
        </>
      }
      footer={
        <BottomActionBar>
          <Button
            type="submit"
            size="cta"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : t('common.actions.continue')}
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Food Description */}
        <div>
          <label className="block text-label font-semibold mb-2">
            Describe what type of food you need
          </label>
          <Textarea
            {...register('description', {
              required: 'Please describe the food you need',
            })}
            placeholder="e.g., Fresh vegetables, prepared meals, dairy products..."
            variant={errors.description ? {t('common.status.error')} : 'default'}
            rows={4}
          />
          {errors.description && (
            <div className="mt-1 text-[14px] font-manrope text-negative">
              {errors.description.message}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-label font-semibold mb-2">
            How many people is this for?
          </label>
          <Input
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 1, message: 'Quantity must be at least 1' },
              pattern: {
                value: /^\d+$/,
                message: 'Please enter a valid number',
              },
            })}
title="Default"
            type="number"
            variant={errors.quantity ? {t('common.status.error')} : 'default'}
          />
          {errors.quantity && (
            <div className="mt-1 text-[14px] font-manrope text-negative">
              {errors.quantity.message}
            </div>
          )}
        </div>

        {/* Allergens */}
        <AllergensDropdown
          label="Allergies, intolerances & diets"
          options={['Default', t('pages.requests.eggs'), t('pages.requests.fish'), t('pages.requests.shellfish'),
            'Tree nuts', t('pages.requests.peanuts'), t('pages.requests.wheat'), t('pages.requests.soybeans'), t('pages.requests.vegan'), t('pages.requests.vegetarian'),
            'Gluten-free', t('pages.requests.halal'), t('pages.requests.kosher'),
            'Low-lactose',
          ]}
          value={selectedAllergens}
          onChange={setSelectedAllergens}
title="Default"
          error={
            !selectedAllergens.length && watchedFields.description
              ? 'Please select at least one option'
              : undefined
          }
        />
      </form>
    </PageContainer>
  );
}
