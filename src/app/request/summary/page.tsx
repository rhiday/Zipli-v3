'use client';

import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { useDatabase } from '@/store';
import type { RequestInsert } from '@/types/supabase';
import { useRequestStore } from '@/store/request';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

export default function RequestSummaryPage() {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { requestData, pickupSlots, clearRequest, setEditMode } =
    useRequestStore();
  const { currentUser, addRequest } = useDatabase();
  const [recurringSchedule, setRecurringSchedule] = useState<any>(null);
  const [requestPeriod, setRequestPeriod] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

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
      if (sessionRequestData.startDate && sessionRequestData.endDate) {
        setRequestPeriod({
          startDate: sessionRequestData.startDate,
          endDate: sessionRequestData.endDate,
        });
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
      alert('Please enter your address');
      return;
    }

    if (!requestData.description || !requestData.quantity) {
      alert('Please complete your food request details');
      return;
    }

    if (pickupSlots.length === 0 && !recurringSchedule) {
      alert('Please add at least one pickup slot');
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

      // Ensure required string fields for type-safe insert
      const now = new Date();
      const primarySlot = formattedSlots[0] || null;
      const fallbackDate = now.toISOString().split('T')[0];
      const fallbackStart = '09:00';
      const fallbackEnd = '17:00';

      // Create the request in the database with explicit type
      const requestPayload: RequestInsert = {
        user_id: currentUser.id,
        description: requestData.description,
        people_count: requestData.quantity || 1,
        pickup_date:
          pickupSlots.length > 0 && formattedSlots[0]?.date
            ? formattedSlots[0].date
            : new Date().toISOString().split('T')[0], // Use today's date as fallback
        pickup_start_time:
          pickupSlots.length > 0 && formattedSlots[0]?.start_time
            ? formattedSlots[0].start_time
            : '09:00',
        pickup_end_time:
          pickupSlots.length > 0 && formattedSlots[0]?.end_time
            ? formattedSlots[0].end_time
            : '17:00',
        status: 'active' as const,
        is_recurring: !!recurringSchedule,
      };

      console.log('Submitting request with payload:', requestPayload);

      const response = await addRequest(requestPayload);

      if (response.error) {
        console.error('Error creating request:', response.error);
        alert(`Failed to submit request: ${response.error}`);
        return;
      }

      if (response.data) {
        console.log('✅ Request created successfully:', response.data.id);

        // Clear the request store after confirming
        clearRequest();
        router.push('/request/success');
      } else {
        console.error('No data returned from addRequest');
        alert('Failed to submit request: No data returned');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(
        `Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading if no request data
  if (!requestData.description) {
    return (
      <div className="flex flex-col min-h-dvh bg-white max-w-md mx-auto items-center justify-center gap-4">
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

  const handleEditRequest = () => {
    // Generate a unique request ID for edit mode (since we're in creation flow)
    const editRequestId = `edit_${Date.now()}`;

    // Set edit mode in the store
    setEditMode(true, editRequestId);

    // Store the request ID in session storage for persistence across page loads
    sessionStorage.setItem('editingRequestId', editRequestId);

    // Navigate to the appropriate form based on request type
    if (requestData.request_type === 'one-time') {
      router.push('/request/one-time-form');
    } else {
      router.push('/request/recurring-form');
    }
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
              {t('quantity')}: {requestData.quantity || '—'} kg
            </div>
            <div className="text-sm text-gray-600">
              {t('requestDetails')}:{' '}
              {requestData.allergens && requestData.allergens.length > 0
                ? requestData.allergens.join(', ')
                : 'None specified'}
            </div>
          </div>
          <button
            onClick={handleEditRequest}
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
                d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165Z"
                fill="#024209"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Request Period Section - Show for recurring requests */}
      {requestPeriod && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#021d13] mt-6">
            {t('requestPeriod')}
          </h2>
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
            <span className="font-semibold text-interactive">
              {format(new Date(requestPeriod.startDate), 'dd.MM.yyyy')} -{' '}
              {format(new Date(requestPeriod.endDate), 'dd.MM.yyyy')}
            </span>
            <button
              onClick={() => router.push('/request/schedule')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title="Edit request period"
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
        </div>
      )}

      {/* Pickup Schedule Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-6">
          {recurringSchedule ? 'Recurring Schedule' : 'Delivery Schedule'}
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
              title="Edit delivery time"
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
                  d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165Z"
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
          <div className="mt-2">
            <Checkbox
              id="update-address-profile"
              checked={updateAddressInProfile}
              onChange={setUpdateAddressInProfile}
              label={t('updateAddressInProfile')}
            />
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
          <div className="mt-2">
            <Checkbox
              id="update-instructions-profile"
              checked={updateInstructionsInProfile}
              onChange={setUpdateInstructionsInProfile}
              label={t('updateInstructionsInProfile')}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
