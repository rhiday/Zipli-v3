'use client';

import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { useRequestStore } from '@/store/request';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type OneTimeFormInputs = {
  description: string;
  quantity: string;
  allergens: string;
  category?: string;
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
      category: requestData.category || '',
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
        category: data.category,
      });

      // Store in session storage for backward compatibility
      const requestData = {
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: allergensArray,
        category: data.category,
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
            title={isEditMode ? t('editRequest') : t('oneTimeRequest')}
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
                ? t('updateRequest')
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
              required: t('pleaseDescribeFood'),
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

        {/* Food Category */}
        <div>
          <label className="block text-label font-semibold mb-2">
            {t('foodCategory')}
          </label>
          <Select
            value={watch('category') || ''}
            onValueChange={(value) => {
              const event = { target: { value } } as any;
              register('category').onChange(event);
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('selectCategory') || 'Select category'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ready_meal">
                {t('receiverCategoryReadyMeal')}
              </SelectItem>
              <SelectItem value="raw_ingredients">
                {t('receiverCategoryRawIngredients')}
              </SelectItem>
              <SelectItem value="other_food">
                {t('receiverCategoryOtherFood')}
              </SelectItem>
              <SelectItem value="other_products">
                {t('receiverCategoryOtherProducts')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-label font-semibold mb-2">
            {t('quantity')} (kg)
          </label>
          <Input
            {...register('quantity', {
              required: t('quantityRequired'),
              min: { value: 1, message: t('quantityMinimum') },
              pattern: {
                value: /^\d+$/,
                message: t('enterValidNumber'),
              },
            })}
            placeholder={t('enterQuantityKg')}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            step="1"
            onKeyPress={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== 'Backspace' &&
                e.key !== 'Delete' &&
                e.key !== 'Tab' &&
                e.key !== 'Enter'
              ) {
                e.preventDefault();
              }
            }}
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
            placeholder={t('allergenExampleText')}
            variant="default"
            rows={3}
          />
          <div className="mt-1 text-[14px] font-manrope text-[rgba(2,29,19,0.60)]">
            {t('separateMultipleItems')}
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
