'use client';

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
import { useAutoSave } from '@/lib/auto-save';
import { useRequestStore } from '@/store/request';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type OneTimeFormInputs = {
  description: string;
  people_count: string;
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

  // Check if we're in edit mode (coming from summary with existing data)
  const isEditMode = Boolean(requestData.description);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OneTimeFormInputs>({
    defaultValues: {
      description: requestData.description || '',
      people_count: requestData.people_count
        ? requestData.people_count.toString()
        : '',
    },
  });

  const watchedFields = watch();
  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.people_count?.trim() &&
    Number(watchedFields.people_count) > 0 &&
    selectedAllergens.length > 0;

  // Auto-save form data
  const formData = {
    description: watchedFields.description || '',
    people_count: watchedFields.people_count || '',
    allergens: selectedAllergens,
    request_type: 'one-time',
  };

  const { hasUnsaved, restore, clear } = useAutoSave({
    key: 'one-time-request-form',
    data: formData,
    enabled: true,
    intervalMs: 3000, // Save every 3 seconds
  });

  const onSubmit = async (data: OneTimeFormInputs) => {
    console.log('One-time form onSubmit called', {
      data,
      isFormValid,
      selectedAllergens,
    });
    setAttemptedSubmit(true);

    // Check if form is valid before proceeding
    if (!isFormValid) {
      console.log('Form validation failed', {
        description: watchedFields.description?.trim(),
        people_count: watchedFields.people_count?.trim(),
        people_countNumber: Number(watchedFields.people_count),
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
        request_type: 'one-time',
        description: data.description,
        people_count: Number(data.people_count),
        allergens: selectedAllergens,
      });

      // Store in session storage for backward compatibility
      const requestData = {
        request_type: 'one-time',
        description: data.description,
        people_count: Number(data.people_count),
        allergens: selectedAllergens,
      };
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Clear auto-saved data on successful submission
      clear();

      console.log('Request data saved, navigating...', { isEditMode });

      // Navigate based on edit mode
      if (isEditMode) {
        // In edit mode, go back to summary
        router.push('/request/summary');
      } else {
        // In create mode, go to pickup slot selection
        router.push('/request/pickup-slot');
      }
    } catch (error) {
      console.error('Failed to create request - full error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your request. Please try again.',
        variant: 'error',
      });
    }
  };

  // Restore saved data on component mount
  useEffect(() => {
    const savedData = restore();
    if (savedData && savedData.description) {
      // Restore form values
      if (savedData.description !== watchedFields.description) {
        // setValue from react-hook-form could be used here
      }
      if (savedData.allergens && savedData.allergens.length > 0) {
        setSelectedAllergens(savedData.allergens);
      }
    }
  }, []);

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
            {...register('people_count', {
              required: 'People count is required',
              min: { value: 1, message: 'People count must be at least 1' },
              pattern: {
                value: /^\d+$/,
                message: 'Please enter a valid number',
              },
            })}
            placeholder={t('enterNumberOfPeople')}
            type="number"
            variant={errors.people_count ? 'error' : 'default'}
          />
          {errors.people_count && (
            <div className="mt-1 text-[14px] font-manrope text-negative">
              {errors.people_count.message}
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
    </PageContainer>
  );
}
