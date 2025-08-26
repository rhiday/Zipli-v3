'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useDatabase } from '@/store';
import { useDonationStore } from '@/store/donation';
import { ManualDonationForm } from '@/components/donation/ManualDonationForm';

/**
 * Donation Management Route
 *
 * This page loads an existing donation and presents it in the
 * donation list management component, allowing users to view
 * and manage all items within that particular donation.
 *
 * Navigation flow: Dashboard -> Details -> Donation Management
 */
export default function DonationManagePage() {
  const params = useParams();
  const router = useRouter();
  const donations = useDatabase((state) => state.donations);
  const foodItems = useDatabase((state) => state.foodItems);
  const currentUser = useDatabase((state) => state.currentUser);

  const { setEditMode, clearDonation, addDonationItem, donationItems } =
    useDonationStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const donationId = params.id as string;

    if (!donationId || !currentUser) {
      setError('Invalid donation or user not authenticated');
      setLoading(false);
      return;
    }

    // Find the donation by ID
    const donation = donations.find((d) => d.id === donationId);

    if (!donation) {
      setError('Donation not found');
      setLoading(false);
      return;
    }

    // Check if current user owns this donation
    if (donation.donor_id !== currentUser.id) {
      setError('You do not have permission to manage this donation');
      setLoading(false);
      return;
    }

    // Find the associated food item
    const foodItem = foodItems.find((fi) => fi.id === donation.food_item_id);

    if (!foodItem) {
      setError('Associated food item not found');
      setLoading(false);
      return;
    }

    // Clear existing donation store state
    clearDonation();

    // Set up edit mode for this specific donation
    setEditMode(true, donationId);

    // Populate the donation store with this donation's items
    // Parse allergens from database format (handle various formats)
    let allergens: string[] = [];
    if (foodItem.allergens) {
      if (Array.isArray(foodItem.allergens)) {
        allergens = foodItem.allergens;
      } else if (typeof foodItem.allergens === 'string') {
        try {
          // Try JSON parsing first
          allergens = JSON.parse(foodItem.allergens);
        } catch {
          // Fallback to comma-separated string parsing
          allergens = foodItem.allergens
            .split(',')
            .map((a) => a.trim())
            .filter((a) => a);
        }
      }
    }

    // Add the item to the donation store for management
    // Note: addDonationItem generates its own ID, so we don't pass the donation ID
    addDonationItem({
      name: foodItem.name,
      quantity: Number(donation.quantity) || 1,
      unit: 'kg',
      allergens: allergens,
      description: foodItem.description || null,
      imageUrl: foodItem.image_url || undefined,
    });

    setLoading(false);
  }, [
    params.id,
    donations,
    foodItems,
    currentUser,
    setEditMode,
    clearDonation,
    addDonationItem,
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => router.push('/donate')}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Render the donation list management component
  return (
    <Suspense fallback={<div>Loading donation management...</div>}>
      <ManualDonationForm />
    </Suspense>
  );
}
