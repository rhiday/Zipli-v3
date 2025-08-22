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
import { OneTimeRequest } from '@/types/request.types';

type OneTimeFormInputs = {
  description: string;
  quantity: string;
};

export default function OneTimeRequestForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OneTimeFormInputs>();

  const watchedFields = watch();
  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0 &&
    selectedAllergens.length > 0;

  const onSubmit = async (data: OneTimeFormInputs) => {
    try {
      const requestData: OneTimeRequest = {
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      };

      // Log the structured data for testing
      console.log('One-time Request Data:', requestData);
      console.log('Ready for Supabase:', JSON.stringify(requestData, null, 2));

      // Store in session storage for now (will be replaced with Supabase)
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
            title="One-time Request"
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
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6 pb-24"
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
      </form>
    </PageContainer>
  );
}
