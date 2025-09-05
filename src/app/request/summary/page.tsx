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
  const {
    requestData,
    pickupSlots,
    clearRequest,
    setEditMode,
    isEditMode,
    editingRequestId,
  } = useRequestStore();
  const { currentUser, addRequest, updateRequest } = useDatabase();
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

  const translateDayNames = (days: string[]) => {
    // Map English day names to Finnish translations
    const dayTranslations: { [key: string]: string } = {
      monday: t('monday'),
      tuesday: t('tuesday'),
      wednesday: t('wednesday'),
      thursday: t('thursday'),
      friday: t('friday'),
      saturday: t('saturday'),
      sunday: t('sunday'),
    };

    return days
      .map((day) => {
        const translatedDay = dayTranslations[day.toLowerCase()] || day;
        // Capitalize first letter for proper formatting
        return translatedDay.charAt(0).toUpperCase() + translatedDay.slice(1);
      })
      .join(', ');
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
    console.log('🥜 Allergens (raw):', requestData.allergens);
    console.log('🥜 Allergens (type):', typeof requestData.allergens);
    console.log(
      '🥜 Allergens (isArray):',
      Array.isArray(requestData.allergens)
    );
    console.log('🥜 Allergens (length):', requestData.allergens?.length || 0);
    console.log('📅 Pickup slots:', pickupSlots.length);
    console.log('🏠 Address:', address.trim());

    if (!address.trim() || !currentUser) {
      console.error('Validation failed: missing address or user');
      alert(t('enterAddress'));
      return;
    }

    if (!requestData.description || !requestData.quantity) {
      alert(t('completeRequestDetails'));
      return;
    }

    if (pickupSlots.length === 0 && !recurringSchedule) {
      alert(t('addPickupSlot'));
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

      // Ensure allergens are properly formatted as an array for PostgreSQL
      const allergensArray = Array.isArray(requestData.allergens)
        ? requestData.allergens
        : [];

      console.log('🔧 Formatted allergens array:', allergensArray);
      console.log(
        '🔧 Formatted allergens JSON:',
        JSON.stringify(allergensArray)
      );
      console.log('🔄 Session data:', sessionData);
      console.log('🔄 Recurring schedule:', recurringSchedule);

      // Handle recurring vs one-time request data
      let recurrencePatternData = null;
      let requestStartDate = null;
      let requestEndDate = null;
      let pickupDate = fallbackDate;
      let pickupStartTime = fallbackStart;
      let pickupEndTime = fallbackEnd;

      if (recurringSchedule && Array.isArray(recurringSchedule)) {
        // For recurring requests: store schedule data and use start date
        recurrencePatternData = JSON.stringify({
          schedules: recurringSchedule,
          type: 'weekly', // Can be extended for other recurrence types
        });

        // Get start date from session data
        if (sessionData.startDate) {
          requestStartDate = sessionData.startDate;
          pickupDate = sessionData.startDate; // Use start date as first pickup
        }

        // Calculate end date (default to 30 days from start for now)
        if (requestStartDate) {
          const startDateObj = new Date(requestStartDate);
          const endDateObj = new Date(startDateObj);
          endDateObj.setDate(endDateObj.getDate() + 30); // 30-day default period
          requestEndDate = endDateObj.toISOString().split('T')[0];
        }

        // Use first schedule's time as primary pickup times
        if (recurringSchedule[0]) {
          pickupStartTime = recurringSchedule[0].startTime || fallbackStart;
          pickupEndTime = recurringSchedule[0].endTime || fallbackEnd;
        }

        console.log('✅ Recurring request data:', {
          recurrencePattern: recurrencePatternData,
          startDate: requestStartDate,
          endDate: requestEndDate,
          primaryPickupDate: pickupDate,
        });
      } else if (pickupSlots.length > 0 && formattedSlots[0]) {
        // For one-time requests: use pickup slots
        pickupDate = formattedSlots[0].date || fallbackDate;
        pickupStartTime = formattedSlots[0].start_time || fallbackStart;
        pickupEndTime = formattedSlots[0].end_time || fallbackEnd;

        console.log('✅ One-time request data:', {
          pickupDate,
          pickupStartTime,
          pickupEndTime,
        });
      }

      // Create the request in the database with explicit type
      const requestPayload: RequestInsert = {
        user_id: currentUser.id,
        description: requestData.description,
        people_count: requestData.quantity || 1,
        allergens: allergensArray,
        address: address.trim(),
        instructions: instructions.trim() || null,
        pickup_date: pickupDate,
        pickup_start_time: pickupStartTime,
        pickup_end_time: pickupEndTime,
        is_recurring: !!recurringSchedule,
        recurrence_pattern: recurrencePatternData,
        start_date: requestStartDate,
        end_date: requestEndDate,
        status: 'active' as const,
      };

      console.log('Submitting request with payload:', requestPayload);
      console.log('🔄 Edit mode:', isEditMode, 'Request ID:', editingRequestId);

      let response;
      if (isEditMode && editingRequestId) {
        // Update existing request
        response = await updateRequest(editingRequestId, requestPayload);
        if (response.error) {
          console.error('❌ Error updating request:', response.error);
          alert(`Failed to update request: ${response.error}`);
          return;
        }
        console.log('✅ Request updated successfully:', response.data?.id);
      } else {
        // Create new request
        response = await addRequest(requestPayload);
        if (response.error) {
          console.error('❌ Error creating request:', response.error);
          alert(`Failed to submit request: ${response.error}`);
          return;
        }
        console.log('✅ Request created successfully:', response.data?.id);
      }

      if (response.data) {
        console.log('✅ Saved allergens:', response.data.allergens);
        console.log('✅ Full response data:', response.data);

        // Clear the request store after confirming
        clearRequest();
        setEditMode(false, undefined);
        sessionStorage.removeItem('editingRequestId');

        // Navigate to success page or back to request detail
        if (isEditMode) {
          router.push(`/request/${response.data.id}`);
        } else {
          router.push('/request/success');
        }
      } else {
        console.error('❌ No data returned from request operation');
        alert(`${t('submissionFailed')}: ${t('noDataReturned')}`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(
        `${t('submissionFailed')}: ${error instanceof Error ? error.message : t('unknownError')}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading if no request data
  if (!requestData.description) {
    return (
      <div className="flex flex-col min-h-dvh bg-white max-w-md mx-auto items-center justify-center gap-4">
        <p className="text-gray-600">{t('noRequestDataFound')}</p>
        <Button onClick={() => router.push('/request/select-type')}>
          {t('startNewRequest')}
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
              {isSaving
                ? t('continuing')
                : isEditMode
                  ? t('updateRequest')
                  : t('submitRequest')}
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
              {requestData.description || t('foodRequest')}
            </div>
            <div className="text-sm text-gray-600">
              {t('quantity')}: {requestData.quantity || '—'} kg
            </div>
            <div className="text-sm text-gray-600">
              {t('requestDetails')}:{' '}
              {requestData.allergens && requestData.allergens.length > 0
                ? requestData.allergens.join(', ')
                : t('noneSpecified')}
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
              {format(new Date(requestPeriod.startDate), 'dd.MM.yyyy')}{' '}
              {t('requestPeriodFrom')}
              {requestPeriod.endDate && (
                <>
                  {' '}
                  {t('requestPeriodTo')}{' '}
                  {format(new Date(requestPeriod.endDate), 'dd.MM.yyyy')}
                </>
              )}
            </span>
            <button
              onClick={() => router.push('/request/schedule')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title={t('editRequestPeriod')}
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
          {recurringSchedule ? t('recurringSchedule') : t('deliverySchedule')}
        </h2>
        {recurringSchedule && Array.isArray(recurringSchedule) ? (
          // Multiple recurring schedules
          recurringSchedule.map((schedule: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
            >
              <span className="font-semibold text-interactive">
                {translateDayNames(schedule.days || [])}, {schedule.startTime} -{' '}
                {schedule.endTime}
              </span>
              <button
                onClick={() => router.push('/request/schedule')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                title={t('editSchedule')}
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
        ) : pickupSlots.length > 0 ? (
          // Multiple one-time pickup slots
          pickupSlots.map((slot, index) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
            >
              <span className="font-semibold text-interactive">
                {slot.date
                  ? `${formatSlotDate(slot.date)}, ${slot.startTime} - ${slot.endTime}`
                  : t('dateNotSet')}
              </span>
              <button
                onClick={() => router.push('/request/pickup-slot')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                title={t('editDeliveryTime')}
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
          ))
        ) : (
          // No pickup slots
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
            <span className="font-semibold text-interactive">
              {t('dateNotSet')}
            </span>
            <button
              onClick={() => router.push('/request/pickup-slot')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title={t('editDeliveryTime')}
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
          {t('addressAndInstructions')}
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
