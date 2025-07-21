// pumpkin: Donation detail page
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
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
import { useDatabase, DonationWithFoodItem } from '@/store/databaseStore';

export default function DonationDetailPage({ params }: { params: { id: string } }) {
  const currentUser = useDatabase(state => state.currentUser);
  const router = useRouter();
  const donations = useDatabase(state => state.donations);
  const foodItems = useDatabase(state => state.foodItems);
  const deleteDonation = useDatabase(state => state.deleteDonation);
  const [donation, setDonation] = useState<DonationWithFoodItem | null>(null);
  const [otherDonations, setOtherDonations] = useState<DonationWithFoodItem[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (currentUser && params.id) {
      const userDonations = donations.filter(d => d.donor_id === currentUser.id);
      const mainDonation = userDonations.find(d => d.id === params.id);

      if (mainDonation) {
        const foodItem = foodItems.find(fi => fi.id === mainDonation.food_item_id);
        if (foodItem) {
          setDonation({ ...mainDonation, food_item: foodItem });
          setIsOwner(true);

          const otherDons = userDonations
            .filter(d => d.id !== params.id)
            .map(d => ({ ...d, food_item: foodItems.find(fi => fi.id === d.food_item_id)! }))
            .slice(0, 4);
          setOtherDonations(otherDons);
          setTotalDonations(userDonations.length);
        }
      }
    }
    setLoading(false);
  }, [currentUser, params.id, donations, foodItems]);

  const handleRemoveListing = () => {
    if (!donation) return;
    deleteDonation(donation.id);
    router.push('/donate');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !donation || !donation.food_item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">
          {error ? 'Error' : 'Donation not found'}
        </h2>
        <p className="text-muted-foreground">
          {error || 'Could not load the details for this donation.'}
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  const donorName = 'A Generous Donor';

  return (
    <div className="min-h-screen pb-20">
      {/* Header with Image and Back Arrow */}
      <div className="relative h-60 w-full">
        <Button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 p-0 text-white backdrop-blur-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {donation.food_item.image_url && !imageError ? (
          <Image
            src={donation.food_item.image_url}
            alt={donation.food_item.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <Image
              src="/images/placeholder.svg"
              alt="Placeholder image"
              width={160}
              height={160}
            />
          </div>
        )}
      </div>

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-gray-900">{donation.food_item.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-gray-600">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium">{donation.quantity} kg</span>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {donation.food_item.allergens &&
              (Array.isArray(donation.food_item.allergens)
                ? donation.food_item.allergens
                : String(donation.food_item.allergens).split(',')
              ).map((tag: string) => (
                <Tag key={tag}>{tag.trim()}</Tag>
              ))}
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">{donation.food_item.description}</p>

          <div className="mt-4 flex items-start gap-3 text-gray-600">
            <MapPin className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Address not provided</span>
          </div>

          {isOwner ? (
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <div className="mt-6 flex items-center gap-3">
                <DialogTrigger asChild>
                  <Button
                    variant="destructive-outline"
                    size="cta"
                    className="flex-1"
                  >
                    <Trash2 className="h-5 w-5" /> Remove listing
                  </Button>
                </DialogTrigger>
                <Button
                  variant="primary"
                  size="cta"
                  className="flex-1"
                  onClick={() => router.push(`/donate/manual?id=${donation.id}`)}
                >
                  <Edit className="h-5 w-5" /> Edit listing
                </Button>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently remove the listing from public view. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleRemoveListing}>Yes, remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
        <section className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <span className="text-lg font-semibold">{getInitials(donorName)}</span>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{donorName}</p>
                <p className="text-sm text-gray-500">{totalDonations} donations</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => alert('View profile not implemented')}>
              View profile
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {otherDonations.map((otherDonation) => (
              <DonationCard key={otherDonation.id} donation={otherDonation} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 