'use client';

import AutoSaveFormWrapper from '@/components/forms/AutoSaveFormWrapper';
import PageContainer from '@/components/layout/PageContainer';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/progress';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/hooks/use-toast';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { useRequestStore } from '@/store/request';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type RecurringFormInputs = {
  description: string;
  quantity: string;
};

export default function RecurringRequestForm() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { setRequestData, requestData } = useRequestStore();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    requestData.allergens || []
  );
  const [allergensInteracted, setAllergensInteracted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Check if we're in edit mode (coming from summary with existing data)
  const isEditMode = Boolean(requestData.description);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RecurringFormInputs>({
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

  const onSubmit = async (data: RecurringFormInputs) => {
    console.log('Recurring form onSubmit called', {
      data,
      isFormValid,
      selectedAllergens,
    });
    setAttemptedSubmit(true);

    // Check if form is valid before proceeding
    if (!isFormValid) {
      console.log('Form validation failed', {
        description: watchedFields.description?.trim(),
        quantity: watchedFields.quantity?.trim(),
        quantityNumber: Number(watchedFields.quantity),
        allergensLength: selectedAllergens.length,
      });
      toast({
        title: 'Please complete all fields',
        description:
          'Make sure you have filled in all required information including allergens/dietary restrictions.',
        variant: 'error',
      });
      return;
    }

    try {
      // Update the store with form data
      setRequestData({
        request_type: 'recurring',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      });

      // Store in session storage for backward compatibility
      const requestData = {
        request_type: 'recurring',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      };
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      console.log('Request data saved, navigating...', { isEditMode });

      // Navigate based on edit mode
      if (isEditMode) {
        // In edit mode, go back to summary
        router.push('/request/summary');
      } else {
        // In create mode, go to schedule page
        router.push('/request/schedule');
      }
    } catch (error) {
      console.error('Failed to create recurring request - full error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your request. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('recurringRequest')}
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
            type="button"
            size="cta"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="w-full"
          >
            {isSubmitting
              ? isEditMode
                ? t('saving')
                : t('continuing')
              : isEditMode
                ? t('saveChanges')
                : t('continue')}
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <AutoSaveFormWrapper
        formId="recurring-request-form"
        formData={{
          description: watchedFields.description || '',
          quantity: watchedFields.quantity || '',
          allergens: selectedAllergens,
          request_type: 'recurring',
        }}
        enabled={true}
        intervalMs={3000}
        showStatus={true}
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
      </AutoSaveFormWrapper>
    </PageContainer>
  );
}
