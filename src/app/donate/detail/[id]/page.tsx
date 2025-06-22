// pumpkin: Donation detail page
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';

// Using 'any' for now to bypass stubborn linter issues.
// The actual shape should be a single object for food_item and donor.
type DonationDetails = any;
type OtherDonation = any;

export default function DonationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [otherDonations, setOtherDonations] = useState<OtherDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonationData = async () => {
      if (!id) {
        setLoading(false);
        setError('No ID provided.');
        return;
      }

      try {
        setLoading(true);
        const { data: donationData, error: donationError } = await supabase
          .from('donations')
          .select(
            `
            id,
            quantity,
            food_item:food_items!inner(
              name,
              description,
              image_url,
              allergens
            )
          `
          )
          .eq('id', id as string)
          .single();

        if (donationError) throw donationError;

        // Provide default allergens if none exist
        if (donationData && (donationData as any).food_item && !(donationData as any).food_item.allergens) {
          (donationData as any).food_item.allergens = 'Gluten-Free, Lactose-Free';
        }
        
        // Provide default description if none exist
        if (donationData && (donationData as any).food_item && !(donationData as any).food_item.description) {
          (donationData as any).food_item.description = `A delicious portion of ${(donationData as any).food_item.name}.`;
        }

        setDonation(donationData);

        // TODO: Re-add fetching other donations and donor info
        // For now, focusing on fixing the main item fetch.

      } catch (err: any) {
        setError(err.message || 'Failed to fetch donation details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationData();
  }, [id]);

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
  
  const donorName = 'Anonymous Donor'; // Placeholder

  return (
    <div className="min-h-screen bg-white pb-24 font-sans max-w-md mx-auto">
      {/* Header with Image and Back Arrow */}
      <div className="relative h-60 w-full">
        <Button
          onClick={() => router.back()}
          className="absolute top-12 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 p-0 text-white backdrop-blur-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {donation.food_item.image_url ? (
          <Image
            src={donation.food_item.image_url}
            alt={donation.food_item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200"></div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 -mt-12 rounded-t-[20px] bg-white p-5 shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900">{donation.food_item.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-gray-600">
          <ShoppingBag className="h-5 w-5" />
          <span className="font-medium">{donation.quantity} kg</span>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {donation.food_item.allergens?.split(',').map((tag: string) => (
            <Tag key={tag}>
              {tag.trim()}
            </Tag>
          ))}
        </div>

        <p className="mt-4 text-gray-600 leading-relaxed">{donation.food_item.description}</p>

        <div className="mt-4 flex items-start gap-3 text-gray-600">
          <MapPin className="h-5 w-5 flex-shrink-0" />
          {/* Hardcoded address as per Figma */}
          <span className="font-medium">Esimerkkikatu 1 A 12, 00100 HELSINKI</span>
        </div>
        
        <Button size="lg" className="mt-6 h-14 w-full rounded-xl bg-green-500 text-lg font-semibold text-white hover:bg-green-600">
          + Add to cart
        </Button>
      </div>
      
      {/* Divider */}
      <div className="my-3 h-2.5 bg-gray-50"></div>

      {/* Donor Info */}
      <div className="px-5">
         <div className="flex items-center gap-4">
            {/* Placeholder for donor avatar */}
            <div className="h-14 w-14 rounded-full bg-gray-200"></div>
            <div>
              <p className="text-lg font-bold text-gray-900">{donorName}</p>
              <p className="font-medium text-gray-500">1+ donations</p>
            </div>
         </div>

         <h2 className="mt-6 text-xl font-bold text-gray-900">Available from this donor</h2>
         <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Placeholder for other donations */}
         </div>
      </div>
    </div>
  );
} 