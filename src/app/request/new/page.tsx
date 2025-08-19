'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useRequestStore } from '@/store/request';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { AllergensDropdown } from '@/components/ui/AllergensDropdown';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

// Define Form Input Types
type RequestFormInputs = {
  recurringInterval: string;
  quantity: string;
  allergens: string[];
};

export default function NewRequestPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { requestData, setRequestData } = useRequestStore();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    requestData.allergens
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RequestFormInputs>({
    defaultValues: {
      recurringInterval: requestData.recurringInterval,
      quantity: requestData.quantity,
      allergens: requestData.allergens,
    },
  });

  const handleAllergensChange = (allergens: string[]) => {
    setSelectedAllergens(allergens);
  };

  // Watch form fields for validation
  const watchedFields = watch();
  const isFormValid =
    watchedFields.quantity &&
    watchedFields.quantity.trim() !== '' &&
    selectedAllergens.length > 0;

  const onSubmit = async (data: RequestFormInputs) => {
    // Store form data and navigate to pickup slot
    setRequestData({
      recurringInterval: data.recurringInterval,
      quantity: data.quantity,
      allergens: selectedAllergens,
    });
    router.push('/request/pickup-slot');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('newRequest')}
            backHref="/request"
            onBackClick={handleBackClick}
          />
          <div className="px-4 pt-2">
            <Progress value={33} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName=""
      footer={
        <BottomActionBar>
          <div className="flex justify-end">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="w-full"
              disabled={isSubmitting || !isFormValid}
            >
              {t('continue')}
            </Button>
          </div>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <main className="contents">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Recurring Interval */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('recurringInterval')}
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectInterval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('daily')}</SelectItem>
                <SelectItem value="weekly">{t('weekly')}</SelectItem>
                <SelectItem value="monthly">{t('monthly')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {t('requestOnlyAllowsPreselected')}
            </p>
          </div>

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('quantityPortions')}
            </Label>
            <Input
              {...register('quantity', { required: 'Quantity is required' })}
              placeholder={t('enterQuantity')}
              className="w-full"
            />
          </div>

          {/* Allergies, intolerances & diets */}
          <AllergensDropdown
            label={t('allergiesIntolerancesDiets')}
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
              'Low-lactose',
            ]}
            value={selectedAllergens}
            onChange={handleAllergensChange}
            placeholder={t('selectDietaryRestrictions')}
            hint={t('requestHintText')}
          />
        </form>
      </main>
    </PageContainer>
  );
}
