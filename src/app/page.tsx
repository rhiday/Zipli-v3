'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { useDatabase } from '@/store/databaseStore';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isInitialized, deleteDonation, donations, foodItems } = useDatabase();

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push('/auth/login');
    }
  }, [isInitialized, currentUser, router]);

  const deleteSpecificDonations = () => {
    const targetNames = ['aaaaaaa', 'ggggggg', 'Halala', 'fdfvfe'];
    
    const donationsToDelete = donations.filter(d => {
      if (!currentUser || d.donor_id !== currentUser.id) return false;
      const foodItem = foodItems.find(fi => fi.id === d.food_item_id);
      return foodItem && targetNames.includes(foodItem.name);
    });

    console.log('Found donations to delete:', donationsToDelete);
    
    donationsToDelete.forEach(donation => {
      deleteDonation(donation.id);
    });

    alert(`Deleted ${donationsToDelete.length} donations`);
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Redirecting to login
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Welcome to Zipli</h1>
        
        <div className="space-y-4">
          <Button onClick={deleteSpecificDonations} variant="destructive" className="w-full">
            Delete Recent Test Donations (aaaaaaa, ggggggg, Halala, fdfvfe)
          </Button>
          
          <Button 
            onClick={() => router.push('/donate')} 
            className="w-full"
            variant="primary"
          >
            Go to Donate Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push('/feed')} 
            className="w-full"
            variant="secondary"
          >
            Go to Feed
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 