'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { TimeSlotSelector } from '@/components/ui/TimeSlotSelector';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

// Define Form Input Types
type PickupSlotFormInputs = {
  pickupDate: string;
  startTime: string;
  endTime: string;
};

export default function PickupSlotPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { requestData, setRequestData, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    requestData.pickupDate ? new Date(requestData.pickupDate) : undefined
  );
  const [startTime, setStartTime] = useState<string>(requestData.startTime || '');
  const [endTime, setEndTime] = useState<string>(requestData.endTime || '');

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PickupSlotFormInputs>();

  const onSubmit = async () => {
    if (!selectedDate || !startTime || !endTime) {
      return; // Add validation as needed
    }

    // Update store with pickup slot data
    setRequestData({
      pickupDate: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      startTime: startTime,
      endTime: endTime,
    });

    // Navigate to summary page
    router.push('/request/summary');
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <PageContainer
      header={(
        <>
          <SecondaryNavbar 
            title={t('pickupSlot')} 
            backHref="/request/new" 
            onBackClick={handleBackClick}
          />
          <div className="px-4 pt-2">
            <Progress value={67} className="h-2 w-full" />
          </div>
        </>
      )}
      contentClassName="p-4"
      footer={(
        <BottomActionBar>
          <div className="flex justify-end">
            <Button
              onClick={onSubmit}
              className="w-full"
              disabled={isSubmitting || !selectedDate || !startTime || !endTime}
            >
              {t('continue')}
            </Button>
          </div>
        </BottomActionBar>
      )}
      className="bg-white"
    >
          <TimeSlotSelector
            label={t('whenDoYouNeed')}
            dateLabel={t('selectADay')}
            startTimeLabel={t('startTime')}
            endTimeLabel={t('endTime')}
            date={selectedDate}
            startTime={startTime}
            endTime={endTime}
            onDateChange={setSelectedDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />
    </PageContainer>
  );
}