'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { useRequestStore } from '@/store/request';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';

// Define Form Input Types
type RequestFormInputs = {
  recurringInterval: string;
  quantity: string;
  allergens: string[];
};

export default function NewRequestPage() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequestStore();
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(requestData.allergens);

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
    }
  });

  const removeAllergen = (allergen: string) => {
    setSelectedAllergens(prev => prev.filter(a => a !== allergen));
  };

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
    <div className="flex flex-col h-dvh bg-white">
      <div className="mx-auto max-w-lg bg-white w-full">
        <SecondaryNavbar 
          title="New request" 
          backHref="/request" 
          onBackClick={handleBackClick}
        />

        {/* Progress Bar */}
        <div className="px-4 py-2">
          <div className="flex space-x-2">
            <div className="h-1 bg-green-600 rounded flex-1"></div>
            <div className="h-1 bg-gray-200 rounded flex-1"></div>
            <div className="h-1 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Recurring Interval */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Recurring interval
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Zipli only allows to request according to a preselected set of options.
            </p>
          </div>

          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quantity (portions)
            </Label>
            <Input
              {...register('quantity', { required: 'Quantity is required' })}
              placeholder="Enter quantity"
              className="w-full"
            />
          </div>

          {/* Allergies, intolerances & diets */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Allergies, intolerances & diets
            </Label>
            <div className="border rounded-md p-3 min-h-[60px] flex flex-wrap gap-2">
              {selectedAllergens.map((allergen) => (
                <div
                  key={allergen}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {allergen}
                  <button
                    type="button"
                    onClick={() => removeAllergen(allergen)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is a hint text.
            </p>
          </div>

          {/* Continue Button */}
          <div className="pt-8">
            <Button
              type="submit"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-medium py-3 rounded-full"
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 