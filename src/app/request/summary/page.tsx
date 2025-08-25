'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useRequestStore } from '@/store/request';
import { useDatabase } from '@/store';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { AllergenChips } from '@/components/ui/SummaryCard';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

export default function RequestSummaryPage() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { requestData, pickupSlots, clearRequest } = useRequestStore();
  const { currentUser, addRequest } = useDatabase();
  const [recurringSchedule, setRecurringSchedule] = useState<any>(null);

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [updateAddressInProfile, setUpdateAddressInProfile] = useState(false);
  const [updateInstructionsInProfile, setUpdateInstructionsInProfile] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatSlotDate = (date: Date | string | undefined) => {
    if (!date) return null;
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return null;
      return format(d, 'dd.M.yyyy');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.address) setAddress(currentUser.address);
      if ((currentUser as any).driver_instructions) {
        setInstructions((currentUser as any).driver_instructions as string);
      }
    }

    // Check for recurring request data in session storage
    const storedRequest = sessionStorage.getItem('pendingRequest');
    if (storedRequest) {
      const sessionRequestData = JSON.parse(storedRequest);
      if (sessionRequestData.recurringSchedules) {
        setRecurringSchedule(sessionRequestData.recurringSchedules);
      }
    }
  }, [currentUser]);

  const handleSubmitRequest = async () => {
    console.log('🚀 Starting request submission...');
    console.log('📝 Current user:', currentUser?.full_name);
    console.log('📦 Request data:', requestData);
    console.log('📅 Pickup slots:', pickupSlots.length);
    console.log('🏠 Address:', address.trim());

    if (!address.trim() || !currentUser) {
      console.error('Validation failed: missing address or user');
      toast({
        title: 'Address required',
        description: 'Please enter your address to continue',
        variant: 'error',
      });
      return;
    }

    if (!requestData.description || !requestData.people_count) {
      toast({
        title: 'Request details required',
        description: 'Please complete your food request details',
        variant: 'error',
      });
      return;
    }

    if (pickupSlots.length === 0 && !recurringSchedule) {
      toast({
        title: 'Pickup slot required',
        description: 'Please add at least one pickup slot',
        variant: 'error',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update profile data if checkboxes are checked
      const { updateUser } = useDatabase.getState();

      if (
        currentUser &&
        (updateAddressInProfile || updateInstructionsInProfile)
      ) {
        const profileUpdates: Partial<typeof currentUser> = {};

        if (updateAddressInProfile && address !== currentUser.address) {
          profileUpdates.address = address;
        }

        if (
          updateInstructionsInProfile &&
          instructions !== (currentUser as any).driver_instructions
        ) {
          (profileUpdates as any).driver_instructions = instructions;
        }

        // Only update if there are actual changes
        if (Object.keys(profileUpdates).length > 0) {
          console.log('Updating profile with:', profileUpdates);
          updateUser({
            ...currentUser,
            ...profileUpdates,
          });
        }
      }

      // Format pickup slots for database
      const formattedSlots = pickupSlots.map((slot) => ({
        date:
          slot.date instanceof Date
            ? slot.date.toISOString().split('T')[0]
            : slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }));

      // Get session data for additional fields
      const storedRequest = sessionStorage.getItem('pendingRequest');
      const sessionData = storedRequest ? JSON.parse(storedRequest) : {};

      // Create the request in the database
      const requestPayload = {
        user_id: currentUser.id,
        description: requestData.description,
        people_count: requestData.people_count || 1,
        allergens: requestData.allergens || [],
        start_date: sessionData.startDate || null,
        end_date: sessionData.endDate || null,
        pickup_date:
          pickupSlots.length > 0 && formattedSlots[0]?.date
            ? formattedSlots[0].date
            : new Date().toISOString().split('T')[0],
        pickup_start_time:
          pickupSlots.length > 0 && formattedSlots[0]?.start_time
            ? formattedSlots[0].start_time
            : '09:00',
        pickup_end_time:
          pickupSlots.length > 0 && formattedSlots[0]?.end_time
            ? formattedSlots[0].end_time
            : '17:00',
        pickup_slots: formattedSlots, // Save all pickup slots
        status: 'active' as const,
        is_recurring: !!recurringSchedule,
      };

      console.log('Submitting request with payload:', requestPayload);

      const response = await addRequest(requestPayload);

      if (response.error) {
        console.error('Error creating request:', response.error);
        toast({
          title: 'Request submission failed',
          description: `${response.error}`,
          variant: 'error',
        });
        return;
      }

      if (response.data) {
        console.log('✅ Request created successfully:', response.data.id);

        // Clear the request store and session storage after confirming
        clearRequest();
        sessionStorage.removeItem('pendingRequest');

        // Use replace to prevent back navigation issues
        router.replace('/request/success');
      } else {
        console.error('No data returned from addRequest');
        toast({
          title: 'Request submission failed',
          description: 'No data returned from server',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Request submission error',
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading if no request data
  if (!requestData.description) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center gap-4">
        <p className="text-gray-600">No request data found</p>
        <Button onClick={() => router.push('/request/select-type')}>
          Start New Request
        </Button>
      </div>
    );
  }

  const handleBackClick = () => {
    router.back();
  };

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('requestSummary')}
            backHref="/request/pickup-slot"
            onBackClick={handleBackClick}
          />
          <div className="px-4 pt-2">
            <Progress value={100} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitRequest}
              disabled={!address.trim() || isSaving}
            >
              {isSaving ? t('continuing') : t('submitRequest')}
            </Button>
          </div>
        </BottomActionBar>
      }
      className="bg-white"
    >
      {/* Food Request Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-2">
          {t('foodRequested')}
        </h2>
        <div className="flex items-start justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
          <div className="space-y-1">
            <div className="font-semibold text-[#024209]">
              {requestData.description || 'Food Request'}
            </div>
            <div className="text-sm text-gray-600">
              {t('portions')}: {requestData.people_count || '—'}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
              {t('allergiesIntolerancesDiets')}:{' '}
              <AllergenChips allergens={requestData.allergens} />
            </div>
          </div>
          <button
            onClick={() => {
              // Navigate directly to the appropriate edit form based on request type
              if (recurringSchedule) {
                router.push('/request/recurring-form');
              } else {
                router.push('/request/one-time-form');
              }
            }}
            className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
            aria-label={t('edit')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z"
                fill="#024209"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Pickup Schedule Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-6">
          {recurringSchedule ? 'Recurring Schedule' : 'Pickup Schedule'}
        </h2>
        {recurringSchedule && Array.isArray(recurringSchedule) ? (
          // Multiple recurring schedules
          recurringSchedule.map((schedule: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
            >
              <span className="font-semibold text-interactive">
                {schedule.days?.join(', ')}, {schedule.startTime} -{' '}
                {schedule.endTime}
              </span>
              <button
                onClick={() => router.push('/request/schedule')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                title="Edit schedule"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165Z"
                    fill="#024209"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          // One-time pickup slot or old format
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
            <span className="font-semibold text-interactive">
              {pickupSlots.length > 0 && pickupSlots[0].date
                ? `${formatSlotDate(pickupSlots[0].date)}, ${pickupSlots[0].startTime} - ${pickupSlots[0].endTime}`
                : t('dateNotSet')}
            </span>
            <button
              onClick={() => router.push('/request/pickup-slot')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title="Edit pickup time"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z"
                  fill="#024209"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Address & Instructions Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-6">
          Address & Instructions
        </h2>
        <div>
          <label
            htmlFor="address"
            className="block text-black font-semibold mb-3"
          >
            {t('address')}
          </label>
          <Textarea
            id="address"
            placeholder={address ? '' : t('enterYourFullAddress')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="update-address-profile"
              checked={updateAddressInProfile}
              onChange={(e) => setUpdateAddressInProfile(e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="update-address-profile"
              className="text-sm text-gray-600"
            >
              {t('updateAddressInProfile')}
            </label>
          </div>
        </div>
        <div>
          <label
            htmlFor="driver-instructions"
            className="block text-black font-semibold mb-3"
          >
            {t('driverInstructions')}
          </label>
          <Textarea
            id="driver-instructions"
            placeholder={t('pleaseRingTheDoorbell')}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="update-instructions-profile"
              checked={updateInstructionsInProfile}
              onChange={(e) => setUpdateInstructionsInProfile(e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label
              htmlFor="update-instructions-profile"
              className="text-sm text-gray-600"
            >
              {t('updateInstructionsInProfile')}
            </label>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
