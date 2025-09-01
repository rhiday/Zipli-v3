// pumpkin: Donation detail page
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  CheckIcon,
} from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import DonationCard from '@/components/donations/DonationCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSupabaseDatabase as useDatabase } from '@/store/supabaseDatabaseStore';
import { DonationWithFoodItem } from '@/types/supabase';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { useDonationStore } from '@/store/donation';
import { parseAllergens } from '@/lib/allergenUtils';

export default function DonationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useCommonTranslation();
  const currentUser = useDatabase((state) => state.currentUser);
  const router = useRouter();
  const fetchDonationById = useDatabase((state) => state.fetchDonationById);
  const deleteDonation = useDatabase((state) => state.deleteDonation);
  const updateDonation = useDatabase((state) => state.updateDonation);
  const { setEditMode, clearDonation } = useDonationStore();

  const [donation, setDonation] = useState<DonationWithFoodItem | null>(null);
  const [otherDonations, setOtherDonations] = useState<DonationWithFoodItem[]>(
    []
  );
  const [totalDonations, setTotalDonations] = useState(0);
  const [donorDisplayName, setDonorDisplayName] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showConfirmClaim, setShowConfirmClaim] = useState(false);
  const [confirmClauseChecked, setConfirmClauseChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchDonationById(id);

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (!result.data) {
          setError('Donation not found');
          setLoading(false);
          return;
        }

        const fetchedDonation = result.data;
        setDonation(fetchedDonation);

        // Check if current user is the owner
        const userIsOwner =
          currentUser && fetchedDonation.donor_id === currentUser.id;
        setIsOwner(!!userIsOwner);

        // Set donor display name
        const donor = fetchedDonation.donor;
        setDonorDisplayName(
          donor?.full_name || donor?.organization_name || 'Generous Donor'
        );

        // For now, we'll set empty arrays for other donations
        // You can implement fetching other donations by the same donor later
        setOtherDonations([]);
        setTotalDonations(1);
      } catch (err) {
        console.error('Error fetching donation:', err);
        setError('Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id, currentUser, fetchDonationById]);

  const handleRemoveListing = async () => {
    if (!donation) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      console.log('🗑️ Deleting donation:', donation.id);
      const response = await deleteDonation(donation.id);

      if (response.error) {
        console.error('❌ Error deleting donation:', response.error);
        setDeleteError(response.error);
        setIsDeleting(false);
        return;
      }

      console.log('✅ Donation deleted successfully');
      // Close dialog and redirect after successful deletion
      setShowDeleteConfirm(false);
      router.push('/donate');
    } catch (error) {
      console.error('❌ Unexpected error during deletion:', error);
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete donation'
      );
      setIsDeleting(false);
    }
  };

  const handleEditListing = () => {
    if (!donation) return;
    // Clear current donation store and set edit mode
    clearDonation();
    setEditMode(true, donation.id);
    router.push('/donate/manual');
  };

  const handleConfirmClaim = () => {
    setShowConfirmClaim(true);
  };

  const confirmClaimWithClause = async () => {
    if (!confirmClauseChecked || !donation) return;

    setActionLoading(true);
    setShowConfirmClaim(false);
    setConfirmClauseChecked(false);

    try {
      const result = await updateDonation(donation.id, {
        status: 'claimed',
        claimed_at: new Date().toISOString(),
      });

      if (result.error) {
        console.error('Error claiming donation:', result.error);
        return;
      }

      // Refresh the donation data
      await fetchDonationById(donation.id);
      router.push('/donate');
    } catch (error) {
      console.error('Unexpected error claiming donation:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !donation || !donation.food_item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">
          {error ? 'Error' : 'Donation Not Found'}
        </h2>
        <p className="text-muted-foreground">
          {error || 'Could not load donation details'}
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const donorName = donorDisplayName || 'Generous Donor';

  return (
    <div className="min-h-dvh pb-20">
      {/* Header with Image Carousel and Back Arrow */}
      <div className="relative h-60 w-full">
        <Button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 p-0 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ImageCarousel
          images={
            donation.food_item.image_urls
              ? Array.isArray(donation.food_item.image_urls)
                ? (donation.food_item.image_urls as string[])
                : []
              : donation.food_item.image_url
                ? [donation.food_item.image_url]
                : []
          }
          alt={donation.food_item.name}
          className="h-full w-full rounded-none"
          aspectRatio="auto"
          showNavigation={true}
          showDots={true}
        />
      </div>

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-gray-900">
            {donation.food_item.name}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-gray-600">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium">{donation.quantity} kg</span>
          </div>

          {/* Tags */}
          {donation.food_item.allergens && (
            <div className="mt-4 flex flex-wrap gap-2">
              {parseAllergens(donation.food_item.allergens).map(
                (tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                )
              )}
            </div>
          )}

          <p className="mt-4 text-gray-600 leading-relaxed">
            {donation.food_item.description}
          </p>

          {donation.instructions_for_driver && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Driver Instructions:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {donation.instructions_for_driver}
              </p>
            </div>
          )}

          {isOwner ? (
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="primary"
                size="cta"
                className="w-full"
                onClick={handleConfirmClaim}
                disabled={actionLoading}
              >
                <CheckIcon className="h-5 w-5" />
                Confirm Claim
              </Button>
              <Dialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive-outline"
                    size="cta"
                    className="w-full"
                  >
                    <Trash2 className="h-5 w-5" /> Remove Listing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will permanently remove the listing from public view.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  {deleteError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{deleteError}</p>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRemoveListing}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Removing...
                        </>
                      ) : (
                        'Yes, Remove'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="mt-6">
              <Button
                variant="primary"
                size="cta"
                className="w-full"
                onClick={() => router.push(`/request/${params.id}`)}
              >
                Request this donation
              </Button>
            </div>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* Other Donations by Same Donor */}
        {otherDonations.length > 0 && (
          <section className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <span className="text-lg font-semibold">
                    {getInitials(donorName)}
                  </span>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{donorName}</p>
                  <p className="text-sm text-gray-500">
                    {totalDonations} donations
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/profile/${donation.donor_id}`)}
              >
                View Profile
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {otherDonations.map((otherDonation) => (
                <DonationCard key={otherDonation.id} donation={otherDonation} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Confirm Claim Dialog */}
      <Dialog open={showConfirmClaim} onOpenChange={setShowConfirmClaim}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Claim</DialogTitle>
            <DialogDescription>
              Please confirm that this donation has been claimed and received.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="confirm-claim-clause"
                checked={confirmClauseChecked}
                onChange={(e) => setConfirmClauseChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="confirm-claim-clause"
                className="text-sm text-gray-700 leading-relaxed"
              >
                I confirm that this donation has been claimed and received in
                good condition. I understand that by confirming this claim, I
                acknowledge that the donation will be marked as claimed and
                removed from public listings.
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirmClaim(false);
                setConfirmClauseChecked(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmClaimWithClause}
              disabled={!confirmClauseChecked || actionLoading}
            >
              {actionLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                'Confirm Claim'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
