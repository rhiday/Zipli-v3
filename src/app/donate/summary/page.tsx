'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useDonationStore } from '@/store/donation';
import { useDatabase } from '@/store/databaseStore';

export default function DonationSummaryPage() {
  const router = useRouter();
  
  // Get data from donation store
  const pickupSlots = useDonationStore(state => state.pickupSlots);
  const donationItems = useDonationStore(state => state.donationItems);
  const deleteDonationItem = useDonationStore(state => state.deleteDonationItem);
  
  // Get user data from database store
  const { currentUser, isInitialized } = useDatabase();

  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [updateAddressInProfile, setUpdateAddressInProfile] = useState(false);
  const [updateInstructionsInProfile, setUpdateInstructionsInProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill address and instructions from user profile
  useEffect(() => {
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
  }, [isInitialized, currentUser]);

  const handleEditItem = (itemId: string) => {
    // Navigate back to manual page with edit mode for this item
    router.push(`/donate/manual?id=${itemId}`);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteDonationItem(itemId);
  };

  const handleConfirmDonation = async () => {
    if (!address.trim()) return;

    setIsSaving(true);
    
    try {
      // Update profile data if checkboxes are checked
      const { updateUser } = useDatabase.getState();
      
      if (currentUser && (updateAddressInProfile || updateInstructionsInProfile)) {
        const profileUpdates: Partial<typeof currentUser> = {};
        
        if (updateAddressInProfile && address !== currentUser.address) {
          profileUpdates.address = address;
        }
        
        if (updateInstructionsInProfile && instructions !== (currentUser as any).driver_instructions) {
          (profileUpdates as any).driver_instructions = instructions;
        }
        
        // Only update if there are actual changes
        if (Object.keys(profileUpdates).length > 0) {
          console.log('Updating profile with:', profileUpdates);
          // In a real app, you would make an API call to update the profile
          // For now, we'll update the local store
          updateUser({
            ...currentUser,
            ...profileUpdates
          });
        }
      }
      
      // In a real app, this is where you would save the complete donation
      // with the current address and instructions (not necessarily the profile ones)
      
      // Clear the donation store after confirming
      const clearDonation = useDonationStore.getState().clearDonation;
      clearDonation();
      
      router.push('/donate/thank-you');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Still proceed with the donation even if profile update fails
      router.push('/donate/thank-you');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading if no donation data
  if (donationItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center gap-4">
        <p className="text-gray-600">No donation items found.</p>
        <Button onClick={() => router.push('/donate/new')}>
          Start New Donation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      <SecondaryNavbar title="Donation summary" backHref="/donate/pickup-slot" />
      <div className="px-4 pt-2">
        <Progress value={75} className="h-2 w-full" />
      </div>

      <main className="flex-grow overflow-y-auto p-4 space-y-8">
        {/* Donation Items Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Donation items</h2>
          {donationItems.map((item, index) => (
            <ItemPreview
              key={index}
              name={item.name}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
              allergens={item.allergens}
              onEdit={() => handleEditItem(item.id)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>

        {/* Pickup Schedule Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Pickup schedule</h2>
          {pickupSlots.map((slot, index) => (
             <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#F5F9EF] border border-[#D9DBD5]">
               <span className="font-semibold text-interactive">
                  {slot.date ? `${format(new Date(slot.date), 'dd.M.yyyy')}, ${slot.startTime} - ${slot.endTime}` : 'Date not set'}
               </span>
                <button disabled className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5" aria-label="Edit schedule">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z" fill="#024209"/>
                  </svg>
                </button>
             </div>
          ))}
        </div>

        {/* Address & Instructions Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Delivery details</h2>
          <div>
            <label htmlFor="address" className="block text-black font-semibold mb-2">Address</label>
            <Textarea
              id="address"
              placeholder={address ? "" : "Enter your full address"}
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
              <label htmlFor="update-address-profile" className="text-sm text-gray-600">
                Also update this address in my profile for future donations
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="driver-instructions" className="block text-black font-semibold mb-2">Instructions for driver</label>
            <Textarea
              id="driver-instructions"
              placeholder="e.g. Please ring the doorbell"
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
              <label htmlFor="update-instructions-profile" className="text-sm text-gray-600">
                Also update these instructions in my profile as default
              </label>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 pb-6 pt-4 bg-white">
        <div className="flex justify-end">
          <Button 
            onClick={handleConfirmDonation}
            disabled={!address.trim() || isSaving}
          >
            {isSaving ? 'Continuing...' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  );
} 