'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import {
  RecurrenceScheduler,
  RecurrenceSchedule,
} from '@/components/ui/RecurrenceScheduler';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { RecurringRequest } from '@/types/request.types';

type RecurringFormInputs = {
  description: string;
  quantity: string;
};

export default function RecurringRequestForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [recurrenceSchedule, setRecurrenceSchedule] =
    useState<RecurrenceSchedule>({
      type: 'daily',
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RecurringFormInputs>();

  const watchedFields = watch();

  // Validation for form
  const isScheduleValid = () => {
    if (recurrenceSchedule.type === 'weekly') {
      return (
        recurrenceSchedule.weeklyDays &&
        recurrenceSchedule.weeklyDays.length > 0
      );
    }
    if (recurrenceSchedule.type === 'custom') {
      return (
        recurrenceSchedule.customDates &&
        recurrenceSchedule.customDates.length > 0
      );
    }
    return true; // Daily is always valid
  };

  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0 &&
    selectedAllergens.length > 0 &&
    isScheduleValid();

  const onSubmit = async (data: RecurringFormInputs) => {
    try {
      const requestData: RecurringRequest = {
        request_type: 'recurring',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
        recurrence: recurrenceSchedule,
      };

      // Log the structured data for testing
      console.log('Recurring Request Data:', requestData);
      console.log('Recurrence Schedule:', recurrenceSchedule);
      console.log('Ready for Supabase:', JSON.stringify(requestData, null, 2));

      // Store in session storage for now (will be replaced with Supabase)
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Navigate to pickup slot selection first (following donor flow pattern)
      router.push('/request/pickup-slot');
    } catch (error) {
      console.error('Failed to create recurring request:', error);
    }
  };

  return (
    <PageContainer
      header={
        <SecondaryNavbar
          title="Recurring Request"
          backHref="/receiver/dashboard"
          onBackClick={() => router.back()}
        />
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
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
            placeholder="Enter number of people"
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
          label="Allergies, intolerances & diets"
          options={[
            'Milk',
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
          onChange={setSelectedAllergens}
          placeholder="Select dietary restrictions"
          error={
            !selectedAllergens.length && watchedFields.description
              ? 'Please select at least one option'
              : undefined
          }
        />

        {/* Recurrence Schedule */}
        <RecurrenceScheduler
          label="Recurrence Schedule"
          value={recurrenceSchedule}
          onChange={setRecurrenceSchedule}
          hint={'Select how often you need food'}
          error={
            !isScheduleValid() && watchedFields.description
              ? 'Please complete the schedule selection'
              : undefined
          }
        />

        {/* Summary Info */}
        {isFormValid && (
          <div className="p-4 bg-positive/10 rounded-md border border-positive/20">
            <p className="text-label font-semibold text-primary mb-1">
              Request Summary:
            </p>
            <p className="text-label text-secondary">
              {recurrenceSchedule.type === 'daily' && 'Daily request'}
              {recurrenceSchedule.type === 'weekly' &&
                `Weekly on selected days`}
              {recurrenceSchedule.type === 'custom' &&
                `${recurrenceSchedule.customDates?.length || 0} specific dates`}
            </p>
          </div>
        )}
      </form>
    </PageContainer>
  );
}
