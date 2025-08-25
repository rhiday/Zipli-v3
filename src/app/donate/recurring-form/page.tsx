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

type RecurringDonationFormInputs = {
  description: string;
  quantity: string;
};

export default function RecurringDonationForm() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RecurringDonationFormInputs>();

  const watchedFields = watch();

  const isFormValid =
    watchedFields.description?.trim() &&
    watchedFields.quantity?.trim() &&
    Number(watchedFields.quantity) > 0;

  const onSubmit = async (data: RecurringDonationFormInputs) => {
    try {
      const donationData = {
        donation_type: 'recurring',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
      };

      // Log the structured data for testing
      console.log('Recurring Donation Data:', donationData);
      console.log('Ready for Supabase:', JSON.stringify(donationData, null, 2));

      // Store in session storage for now (will be replaced with Supabase)
      sessionStorage.setItem('pendingDonation', JSON.stringify(donationData));

      // Navigate to recurring schedule page
      router.push('/donate/recurring-schedule');
    } catch (error) {
      console.error('Failed to create recurring donation:', error);
    }
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title="Recurring Donation"
            backHref="/donate"
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
            {isSubmitting ? 'Submitting...' : 'Continue'}
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
            Describe what type of food you want to donate
          </label>
          <Textarea
            {...register('description', {
              required: 'Please describe the food you want to donate',
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
            Approximate quantity (kg)
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
            placeholder="Enter quantity"
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
          label="Allergens & dietary information"
          options={[
            'None',
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
          placeholder="Select allergens"
        />
      </form>
    </PageContainer>
  );
}
