'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Calendar, Clock } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store/databaseStore';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';

// Define Form Input Types
type PickupSlotFormInputs = {
  pickupDate: string;
  startTime: string;
  endTime: string;
};

export default function PickupSlotPage() {
  const router = useRouter();
  const { requestData, setRequestData, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PickupSlotFormInputs>({
    defaultValues: {
      pickupDate: requestData.pickupDate,
      startTime: requestData.startTime,
      endTime: requestData.endTime,
    }
  });

  const onSubmit = async (data: PickupSlotFormInputs) => {
    // Update store with pickup slot data
    setRequestData({
      pickupDate: data.pickupDate,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    // Navigate to summary page
    router.push('/request/summary');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="flex flex-col h-dvh bg-white">
      <div className="mx-auto max-w-lg bg-white w-full">
        <SecondaryNavbar 
          title="Pickup slot" 
          backHref="/request/new" 
          onBackClick={handleBackClick}
        />

        {/* Progress Bar */}
        <div className="px-4 py-2">
          <div className="flex space-x-2">
            <div className="h-1 bg-green-600 rounded flex-1"></div>
            <div className="h-1 bg-green-600 rounded flex-1"></div>
            <div className="h-1 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* When do you need */}
          <div>
            <Label className="text-lg font-medium text-gray-900 mb-4 block">
              When do you need
            </Label>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Select a day
            </Label>
            <div className="relative">
              <Input
                type="date"
                {...register('pickupDate', { required: 'Date is required' })}
                className="w-full pl-10"
                placeholder="DD/MM/YYYY"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Start time
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  {...register('startTime', { required: 'Start time is required' })}
                  className="w-full pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                End time
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  {...register('endTime', { required: 'End time is required' })}
                  className="w-full pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
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