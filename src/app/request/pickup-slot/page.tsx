'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCommonTranslation } from '@/hooks/useTranslations';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import {
  PickupSlotManager,
  type PickupSlot,
} from '@/components/ui/PickupSlotManager';
import { useRequestStore } from '@/store/request';

export default function PickupSlotPage() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { pickupSlots, addPickupSlot, updatePickupSlot, deletePickupSlot } =
    useRequestStore();

  const handleContinue = async () => {
    // Validate all slots have required data
    const validSlots = pickupSlots.filter(
      (slot) => slot.date && slot.startTime && slot.endTime
    );

    if (validSlots.length === 0) {
      alert('Please configure at least one pickup slot');
      return;
    }

    // Store pickup slots in session storage (for backward compatibility)
    sessionStorage.setItem('pickupSlots', JSON.stringify(validSlots));

    // Navigate to summary page
    router.push('/request/summary');
  };

  const isFormValid = pickupSlots.some(
    (slot) => slot.date && slot.startTime && slot.endTime
  );

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('pickupSchedule')}
            backHref="/request/new"
            onBackClick={() => router.back()}
          />
          <div className="px-4 pt-2">
            <Progress value={50} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <Button
            onClick={handleContinue}
            className="w-full"
            disabled={!isFormValid}
          >
            Continue
          </Button>
        </BottomActionBar>
      }
      className="bg-white"
    >
      <PickupSlotManager
        slots={pickupSlots}
        onAddSlot={addPickupSlot}
        onUpdateSlot={updatePickupSlot}
        onDeleteSlot={deletePickupSlot}
        title={`${t('pickupSchedule')}?`}
        description="Add one or more pickup time slots to give donors flexibility."
      />
    </PageContainer>
  );
}
