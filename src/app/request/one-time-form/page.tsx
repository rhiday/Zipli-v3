'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { useRequestStore } from '@/store/request';

type OneTimeFormInputs = {
  description: string;
  quantity: string;
};

export default function OneTimeRequestForm() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { setRequestData, requestData } = useRequestStore();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    requestData.allergens || []
  );
  const [allergensInteracted, setAllergensInteracted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OneTimeFormInputs>({
    defaultValues: {
      description: requestData.description || '',
      quantity: requestData.quantity ? requestData.quantity.toString() : '',
    },
  });

  const watchedFields = watch();
  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0 &&
    selectedAllergens.length > 0;

  const onSubmit = async (data: OneTimeFormInputs) => {
    setAttemptedSubmit(true);

    // Check if form is valid before proceeding
    if (!isFormValid) {
      return;
    }

    try {
      // Update the store with form data
      setRequestData({
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      });

      // Store in session storage for backward compatibility
      const requestData = {
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      };
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Navigate to pickup slot selection (following donor flow pattern)
      router.push('/request/pickup-slot');
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('oneTimeRequest')}
            backHref="/request/select-type"
            onBackClick={() => router.back()}
          />
          <div className="px-4 pt-2">
            <Progress value={25} className="h-2 w-full" />
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
            {isSubmitting ? t('continuing') : t('continue')}
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
            {t('describeFood')}
          </label>
          <Textarea
            {...register('description', {
              required: 'Please describe the food you need',
            })}
            placeholder={t('foodDescriptionPlaceholder')}
            variant={errors.description ? 'error' : 'default'}
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
            {t('peopleCount')}?
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
            placeholder={t('enterNumberOfPeople')}
            type="number"
            variant={errors.quantity ? 'error' : 'default'}
          />
          {errors.quantity && (
            <div className="mt-1 text-[14px] font-manrope text-negative">
              {errors.quantity.message}
            </div>
          )}
        </div>

        {/* Allergens */}
        <AllergensDropdown
          label={t('allergiesIntolerancesDiets')}
          options={[
            'Eggs',
            'Fish',
            'Shellfish',
            'Tree nuts',
            'Peanuts',
            'Wheat',
            'Soybeans',
            'Vegan',
            'Vegetarian',
            'Gluten-free',
            'Halal',
            'Kosher',
            'Low-lactose',
          ]}
          value={selectedAllergens}
          onChange={(allergens) => {
            setSelectedAllergens(allergens);
            if (!allergensInteracted) {
              setAllergensInteracted(true);
            }
          }}
          placeholder={t('selectAllergens')}
          error={
            !selectedAllergens.length &&
            (allergensInteracted || attemptedSubmit)
              ? t('selectAllergens')
              : undefined
          }
        />
      </form>
    </PageContainer>
  );
}
