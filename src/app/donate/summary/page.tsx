'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useDatabase, DonationWithFoodItem } from '@/store/databaseStore';

export default function DonationSummaryPage() {
  const router = useRouter();
  const currentUser = useDatabase(state => state.currentUser);
  const donations = useDatabase(state => state.donations);
  const foodItems = useDatabase(state => state.foodItems);

  const [latestDonation, setLatestDonation] = useState<DonationWithFoodItem | null>(null);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser && donations.length > 0 && foodItems.length > 0) {
      const userDonations = donations.filter(d => d.donor_id === currentUser.id);
      if (userDonations.length > 0) {
        const lastDonation = userDonations[userDonations.length - 1];
        const foodItem = foodItems.find(fi => fi.id === lastDonation.food_item_id);
        if (foodItem) {
          setLatestDonation({ ...lastDonation, food_item: foodItem });
        }
      }
    }
  }, [currentUser, donations, foodItems]);

  const handleConfirmDonation = () => {
    if (!latestDonation || !address.trim()) return;

    setIsSaving(true);
    // In a real app, this is where you would update the donation with address/instructions
    // For now, we just navigate to the thank you page.
    // We could add these fields to the store if needed.
    router.push('/donate/thank-you');
    setIsSaving(false);
  };

  if (!latestDonation) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto items-center justify-center">
        <p>Loading donation summary...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <SecondaryNavbar title="Donation summary" backHref="/donate/pickup-slot" />
      <div className="px-6 pt-2">
        <Progress value={75} className="h-2 w-full" />
      </div>

      <main className="flex-1 flex flex-col gap-8 p-6">
        {/* Donation Items Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Donation items</h2>
          {/* Since we have one donation with one food item in this mock setup */}
          <ItemPreview
            name={latestDonation.food_item.name}
            quantity={latestDonation.quantity}
            imageUrl={latestDonation.food_item.image_url}
          />
        </div>

        {/* Pickup Schedule Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Pickup schedule</h2>
          {latestDonation.pickup_slots?.map((slot, index) => (
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
            <label htmlFor="address" className="block text-label font-semibold mb-2">Address</label>
            <Textarea
              id="address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="driver-instructions" className="block text-label font-semibold mb-2">Instructions for driver</label>
            <Textarea
              id="driver-instructions"
              placeholder="e.g. Please ring the doorbell"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 left-0 w-full bg-white p-6 mt-auto">
        <Button 
          onClick={handleConfirmDonation}
          disabled={!address.trim() || isSaving}
          className="w-full"
        >
          {isSaving ? 'Confirming...' : 'Confirm donation'}
        </Button>
      </footer>
    </div>
  );
} 