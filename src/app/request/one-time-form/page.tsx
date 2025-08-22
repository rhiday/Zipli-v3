'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimeSlotSelector } from '@/components/ui/TimeSlotSelector';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { OneTimeRequest } from '@/types/request.types';
import { format } from 'date-fns';

type OneTimeFormInputs = {
  description: string;
  quantity: string;
};

export default function OneTimeRequestForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [pickupTime, setPickupTime] = useState({
    start: '09:00',
    end: '14:00',
  });

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
    selectedAllergens.length > 0 &&
    pickupDate;

  const onSubmit = async (data: OneTimeFormInputs) => {
    if (!pickupDate) return;

    try {
      const requestData: OneTimeRequest = {
        request_type: 'one-time',
        description: data.description,
        quantity: Number(data.quantity),
        allergens: selectedAllergens,
        pickup_date: format(pickupDate, 'yyyy-MM-dd'),
        pickup_start_time: pickupTime.start,
        pickup_end_time: pickupTime.end,
      };

      // Log the structured data for testing
      console.log('One-time Request Data:', requestData);
      console.log('Ready for Supabase:', JSON.stringify(requestData, null, 2));

      // Store in session storage for now (will be replaced with Supabase)
      sessionStorage.setItem('pendingRequest', JSON.stringify(requestData));

      // Navigate to pickup slot selection first (following donor flow pattern)
      router.push('/request/pickup-slot');
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  return (
    <div className="bg-white p-4 space-y-6">
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

        {/* Pickup Date */}
        <DatePicker
          label="Pickup Date"
          date={pickupDate}
          onDateChange={setPickupDate}
          placeholder="dd.mm.yyyy"
          dateFormat="dd/MM/yyyy"
          disablePastDates={true}
          error={
            !pickupDate && watchedFields.description
              ? 'Please select a pickup date'
              : undefined
          }
        />

        {/* Pickup Time */}
        <div>
          <label className="block text-label font-semibold mb-2">
            Pickup Time Slot
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label text-secondary mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={pickupTime.start}
                onChange={(e) =>
                  setPickupTime((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-label text-secondary mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={pickupTime.end}
                onChange={(e) =>
                  setPickupTime((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
