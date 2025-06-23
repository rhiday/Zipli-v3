'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase, DonationWithFoodItem } from '@/store/databaseStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

// Simplified type for the feed
type FeedItem = DonationWithFoodItem;

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, donations, foodItems, isInitialized } = useDatabase();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Enrich donations with food item details
    const enrichedDonations = donations
      .map(donation => {
        const foodItem = foodItems.find(fi => fi.id === donation.food_item_id);
        return foodItem ? { ...donation, food_item: foodItem } : null;
      })
      .filter((d): d is DonationWithFoodItem => d !== null); // Type guard to filter out nulls

    // For now, the feed will just show all available donations.
    // We filter out donations made by the current user.
    const availableDonations = enrichedDonations
      .filter(d => d.status === 'available' && d.donor_id !== currentUser.id);
    
    setFeedItems(availableDonations);
    setLoading(false);
  }, [isInitialized, currentUser, donations, foodItems, router]);

  const filteredItems = feedItems.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      item.food_item.name.toLowerCase().includes(searchTermLower) ||
      (item.food_item.description && item.food_item.description.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-titleLg font-display text-primary">
            Explore available donations
          </h1>
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-50" />
            <Input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/donate/detail/${item.id}`} className="block group">
                <div className="overflow-hidden rounded-xl border border-primary-10 bg-white shadow-sm transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-0.5">
                  <div className="relative h-48 w-full">
                    {item.food_item.image_url ? (
                      <Image
                        src={item.food_item.image_url}
                        alt={item.food_item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        {/* Placeholder Icon */}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="truncate font-semibold text-primary">
                      {item.food_item.name}
                    </h3>
                    <p className="mt-1 text-sm text-primary-75">
                      {item.quantity} · {item.food_item.description}
                    </p>
                    {/* Simplified status display */}
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-positive">
                      {item.status}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-primary">No donations found</h3>
            <p className="mt-2 text-primary-75">
              There are no available donations matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 