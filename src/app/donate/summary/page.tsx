'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useDonationStore } from '@/store/donation';
import { useDatabase } from '@/store';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from '@/hooks/use-toast';
import { SummaryCard } from '@/components/ui/SummaryCard';
import PageContainer from '@/components/layout/PageContainer';
import BottomActionBar from '@/components/ui/BottomActionBar';

export default function DonationSummaryPage() {
  const router = useRouter();
  const { t } = useTranslations();

  // Get data from donation store
  const pickupSlots = useDonationStore((state) => state.pickupSlots);
  const donationItems = useDonationStore((state) => state.donationItems);
  const deleteDonationItem = useDonationStore(
    (state) => state.deleteDonationItem
  );
  const isEditMode = useDonationStore((state) => state.isEditMode);
  const editingDonationId = useDonationStore(
    (state) => state.editingDonationId
  );

  // Get user data and functions from database store
  const {
    currentUser,
    isInitialized,
    addDonation,
    updateDonation,
    updateFoodItem,
    foodItems,
    addFoodItem,
  } = useDatabase();

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [updateAddressInProfile, setUpdateAddressInProfile] = useState(false);
  const [updateInstructionsInProfile, setUpdateInstructionsInProfile] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recurringSchedule, setRecurringSchedule] = useState<any>(null);
  const [donationPeriod, setDonationPeriod] = useState<{
    startDate?: Date;
    endDate?: Date;
  } | null>(null);
  const [isLoadingRecurringData, setIsLoadingRecurringData] = useState(true);

  // Add state to track if persist store has been rehydrated
  const [isStoreRehydrated, setIsStoreRehydrated] = useState(false);

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

  // Check if store is rehydrated on mount
  useEffect(() => {
    // Add a small delay to ensure persist middleware has rehydrated
    const checkRehydration = () => {
      setIsStoreRehydrated(true);
    };

    // Check immediately and also with a small delay for safety
    checkRehydration();
    const timeout = setTimeout(checkRehydration, 100);

    return () => clearTimeout(timeout);
  }, []);

  // Pre-fill address and instructions from user profile
  useEffect(() => {
    if (!isStoreRehydrated || !isInitialized) return;

    if (isInitialized && currentUser) {
      // Pre-fill address from profile if available
      if (currentUser.address) {
        setAddress(currentUser.address);
      }
      // Pre-fill driver instructions from profile if available
      if ((currentUser as any).driver_instructions) {
        setInstructions((currentUser as any).driver_instructions);
      }
    }

    // Check for recurring donation data in session storage
    const storedDonation = sessionStorage.getItem('pendingDonation');
    if (storedDonation) {
      const donationData = JSON.parse(storedDonation);

      // Extract donation period from schedules or direct properties
      if (donationData.schedules && donationData.schedules.length > 0) {
        const firstSchedule = donationData.schedules[0];
        if (firstSchedule.startDate && firstSchedule.endDate) {
          setDonationPeriod({
            startDate: new Date(firstSchedule.startDate),
            endDate: new Date(firstSchedule.endDate),
          });
        }
      } else if (donationData.startDate && donationData.endDate) {
        // Fallback to direct properties on donation data
        setDonationPeriod({
          startDate: new Date(donationData.startDate),
          endDate: new Date(donationData.endDate),
        });
      }

      if (donationData.recurringSchedules || donationData.schedule) {
        setRecurringSchedule(
          donationData.recurringSchedules || donationData.schedule
        );

        // For recurring donations, create a donation item from the stored data
        if (
          donationData.donation_type === 'recurring' &&
          donationItems.length === 0
        ) {
          const { addDonationItem } = useDonationStore.getState();
          addDonationItem({
            name: donationData.description || 'Recurring_donation',
            quantity: Number(donationData.quantity) || 1,
            unit: 'kg',
            allergens: donationData.allergens || [],
            description: donationData.description || null,
          });
        }
      }
    }

    // Set loading to false after processing session storage
    setIsLoadingRecurringData(false);
  }, [isStoreRehydrated, isInitialized, currentUser, donationItems.length]);

  const handleEditItem = (itemId: string) => {
    // Navigate back to manual page with edit mode for this item
    router.push(`/donate/manual?id=${itemId}`);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteDonationItem(itemId);
  };

  const handleConfirmDonation = async () => {
    const action = isEditMode ? 'updating' : 'creating';
    console.log(`🚀 Starting donation ${action}...`);
    console.log('📝 Current user:', currentUser?.full_name);
    console.log('📦 Donation items:', donationItems.length);
    console.log('📅 Pickup slots:', pickupSlots.length);
    console.log('🏠 Address:', address.trim());
    console.log('✏️ Edit mode:', isEditMode, 'ID:', editingDonationId);

    if (!address.trim() || !currentUser) {
      console.error('Validation failed: missing address');
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

      // Format pickup slots
      const formattedSlots = pickupSlots.map((slot) => ({
        date:
          slot.date instanceof Date
            ? slot.date.toISOString().split('T')[0]
            : slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }));

      if (isEditMode && editingDonationId) {
        // Edit mode: update existing donation
        console.log('✏️ Updating existing donation:', editingDonationId);

        const item = donationItems[0]; // For edit mode, there should be only one item
        if (!item) {
          throw new Error('No item found for editing');
        }

        // Get the existing donation to find the food item ID
        const { donations } = useDatabase.getState();
        const existingDonation = donations.find(
          (d) => d.id === editingDonationId
        );
        if (!existingDonation) {
          throw new Error('Existing donation not found');
        }

        // Update the food item
        await updateFoodItem(existingDonation.food_item_id, {
          name: item.name,
          description: item.description || null,
          allergens: JSON.stringify(item.allergens || []),
          image_url: item.imageUrl || null,
        });

        // Update the donation
        await updateDonation(editingDonationId, {
          quantity: item.quantity || 1,
          pickup_slots: formattedSlots,
          instructions_for_driver: instructions || null,
        });

        console.log('✅ Donation updated successfully');
      } else {
        // Create mode: create new donations
        console.log('Processing', donationItems.length, 'donation items...');
        for (const item of donationItems) {
          console.log('Processing item:', item.name, 'qty:', item.quantity);

          // First, find or create the food item in the database
          let foodItemId = '';

          // Check if the food item already exists by name
          const existingFoodItem = foodItems.find(
            (fi) => fi.name.toLowerCase() === item.name.toLowerCase()
          );

          if (existingFoodItem) {
            console.log('✅ Found existing food item:', existingFoodItem.id);
            foodItemId = existingFoodItem.id;
          } else {
            console.log('🆕 Creating new food item...');
            // Create a new food item
            const newFoodItemResult = await addFoodItem({
              name: item.name,
              description: item.description || null,
              allergens: JSON.stringify(item.allergens || []),
              image_url: item.imageUrl || null,
              donor_id: currentUser?.id || null,
              food_type: null,
              quantity: item.quantity || 1,
              unit: null,
              user_id: currentUser?.id || null,
            });

            if (newFoodItemResult.error || !newFoodItemResult.data) {
              console.error(
                'Error creating food item',
                newFoodItemResult.error
              );
              continue; // Skip this donation
            }

            console.log('✅ Created food item:', newFoodItemResult.data.id);
            foodItemId = newFoodItemResult.data.id;
          }

          // Now create the donation
          const donationData = {
            food_item_id: foodItemId,
            donor_id: currentUser.id,
            quantity: item.quantity || 1,
            status: 'available' as const,
            pickup_slots: formattedSlots,
            pickup_time: null,
            instructions_for_driver: instructions || null,
          };

          console.log('💾 Creating donation with data:', donationData);
          const result = await addDonation(donationData);

          if (result.error) {
            console.error('Error creating donation:', result.error);
            // Continue with other donations even if one fails
          } else {
            console.log('✅ Donation created successfully:', result.data?.id);
          }
        }
      }

      // Clear the donation store and session storage after confirming
      const clearDonation = useDonationStore.getState().clearDonation;
      clearDonation();
      sessionStorage.removeItem('pendingDonation');

      // Use replace to prevent back navigation issues
      router.replace('/donate/thank-you');
    } catch (error) {
      console.error(`Error ${action} donations:`, error);
      // Show error message to user
      toast({
        title: `Error ${action} donation`,
        description: `There was an error ${action} your donation. Please try again.`,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while processing recurring donation data or waiting for store rehydration
  if (isLoadingRecurringData || !isStoreRehydrated) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center gap-4">
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  // Show error if no donation data after loading
  if (donationItems.length === 0 && !recurringSchedule) {
    console.warn(
      'No donation items found on summary page - likely direct navigation or cleared state'
    );

    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center gap-4">
        <p className="text-gray-600 text-center">{t('noDonationItemsFound')}</p>
        <p className="text-sm text-gray-500 text-center">
          {t('letStartFromBeginning')}
        </p>
        <Button onClick={() => router.push('/donate/new')}>
          {t('startNewDonation')}
        </Button>
      </div>
    );
  }

  return (
    <PageContainer
      header={
        <>
          <SecondaryNavbar
            title={t('donationSummary')}
            backHref="/donate/pickup-slot"
          />
          <div className="px-4 pt-2">
            <Progress value={75} className="h-2 w-full" />
          </div>
        </>
      }
      contentClassName="p-4 space-y-6"
      footer={
        <BottomActionBar>
          <div className="flex justify-end">
            <Button
              onClick={handleConfirmDonation}
              disabled={!address.trim() || isSaving}
            >
              {isSaving ? t('continuing') : t('continue')}
            </Button>
          </div>
        </BottomActionBar>
      }
      className="bg-white"
    >
      {/* Donation Items Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-2">
          {t('donationItems')}
        </h2>
        {donationItems.map((item, index) => (
          <ItemPreview
            key={index}
            name={item.name}
            quantity={`${item.quantity} ${item.unit || 'kg'}`}
            imageUrl={item.imageUrl}
            allergens={item.allergens}
            onEdit={() => handleEditItem(item.id)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        ))}
      </div>

      {/* Donation Period */}
      {donationPeriod && donationPeriod.startDate && donationPeriod.endDate && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
            <span className="font-semibold text-interactive">
              {t('donationPeriod')}:{' '}
              {format(donationPeriod.startDate, 'dd.MM.yyyy')} -{' '}
              {format(donationPeriod.endDate, 'dd.MM.yyyy')}
            </span>
            <button
              onClick={() => router.push('/donate/schedule')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title={t('editDonationPeriod')}
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

      {/* Pickup schedule */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#021d13] mt-6">
          {recurringSchedule ? t('recurringSchedule') : t('pickupSchedule')}
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
                onClick={() => router.push('/donate/recurring-schedule')}
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
        ) : // One-time pickup slots - display all slots
        pickupSlots.length > 0 ? (
          pickupSlots.map((slot, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]"
            >
              <span className="font-semibold text-interactive">
                {slot.date
                  ? `${formatSlotDate(slot.date)}, ${slot.startTime} - ${slot.endTime}`
                  : t('dateNotSet')}
              </span>
              <button
                onClick={() => router.push('/donate/pickup-slot')}
                className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
                title={t('editPickupTime')}
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
          ))
        ) : (
          <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
            <span className="font-semibold text-interactive">
              {t('dateNotSet')}
            </span>
            <button
              onClick={() => router.push('/donate/pickup-slot')}
              className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
              title={t('editPickupTime')}
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
              {t('saveAddressToProfile')}
            </label>
          </div>
        </div>
        <div>
          <label
            htmlFor="driver-instructions"
            className="block text-black font-semibold mb-3"
          >
            {t('instructionsForDriver')}
          </label>
          <Textarea
            id="driver-instructions"
            placeholder={t('pleaseRingDoorbell')}
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
              {t('saveInstructionsToProfile')}
            </label>
          </div>
        </div>
      </div>

      {/* Bottom action bar with Continue button */}
      <BottomActionBar>
        <Button
          onClick={handleConfirmDonation}
          disabled={isSaving}
          className="w-full bg-lime text-primary hover:bg-positive-hover"
        >
          {isSaving ? t('continuing') : t('continue')}
        </Button>
      </BottomActionBar>
    </PageContainer>
  );
}
