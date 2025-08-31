'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { useRequestStore } from '@/store/request';

type OneTimeFormInputs = {
  description: string;
  quantity: string;
  allergens: string;
};

export default function OneTimeRequestForm() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const {
    setRequestData,
    requestData,
    isEditMode,
    editingRequestId,
    setEditMode,
    allergenTextFromArray,
    arrayFromAllergenText,
  } = useRequestStore();
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
      allergens: allergenTextFromArray(requestData.allergens || []),
    },
  });

  const watchedFields = watch();
  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0;

  const onSubmit = async (data: OneTimeFormInputs) => {
    setAttemptedSubmit(true);

    // Check if form is valid before proceeding
    if (!isFormValid) {
      return;
    }

    try {
      // Convert allergen text to array for storage
      const allergensArray = arrayFromAllergenText(data.allergens);

      // Update the store with form data
      setRequestData({
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: allergensArray,
      });

      // Store in session storage for backward compatibility
      const requestData = {
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: allergensArray,
      };
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Navigate based on edit mode
      if (isEditMode) {
        // Clear edit mode and return to summary
        setEditMode(false, undefined);
        sessionStorage.removeItem('editingRequestId');
        router.push('/request/summary');
      } else {
        // Navigate to pickup slot selection (following donor flow pattern)
        router.push('/request/pickup-slot');
      }
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={isEditMode ? 'Edit Request' : t('oneTimeRequest')}
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
            {isSubmitting
              ? t('continuing')
              : isEditMode
                ? 'Update Request'
                : t('continue')}
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
            {t('quantity')} (kg)
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
            placeholder="Enter quantity in kg"
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
        <div>
          <label className="block text-label font-semibold mb-2">
            {t('allergiesIntolerancesDiets')}
          </label>
          <Textarea
            {...register('allergens')}
            placeholder="e.g. Gluten-free, Lactose-free, Contains nuts"
            variant="default"
            rows={3}
          />
          <div className="mt-1 text-[14px] font-manrope text-[rgba(2,29,19,0.60)]">
            Separate multiple items with commas or new lines
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
