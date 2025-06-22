'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { SearchIcon, FilterXIcon, ChevronDownIcon, ChevronUpIcon, PackageIcon, HandshakeIcon, MapPinIcon, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import FilterBar from '@/components/ui/FilterBar';
import Link from 'next/link';

type DonationFeed = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    allergens: string | null;
    food_type: string | null;
  };
  quantity: number;
  status: string;
  donor: {
    organization_name: string;
    address: string;
  };
  pickup_time: string;
  created_at: string;
  unit?: string;
  pickup_slots?: { start: string; end: string }[];
  donor_id: string;
};

type RequestFeedItem = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: string;
  user: {
    organization_name: string;
    address: string;
  };
  created_at: string;
};

const COMMON_ALLERGENS = ["Lactose-Free", "Low-Lactose", "Gluten-Free", "Soy-Free"];
const FOOD_TYPE_OPTIONS = ["Prepared meals", "Fresh produce", "Cold packaged foods", "Bakery and Pastry", "Other"];

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<(DonationFeed | RequestFeedItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeViewType, setActiveViewType] = useState<'donations' | 'requests'>('donations');

  const [filters, setFilters] = useState({
    foodType: '',
    minQty: '',
    dateFrom: '',
    dateTo: '',
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchFeedData();
  }, [activeViewType, filters]);

  const fetchFeedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      let query;
      if (activeViewType === 'donations') {
        query = supabase
          .from('donations')
          .select(`
            id, quantity, status, pickup_time, created_at, donor_id,
            food_item:food_items!inner(name, description, image_url, allergens, food_type),
            donor:profiles!donations_donor_id_fkey!inner(organization_name, address)
          `)
          .eq('status', 'available');

        if (filters.foodType) {
          query = query.eq('food_items.food_type', filters.foodType);
        }
        if (filters.minQty) {
          const minQuantity = parseInt(filters.minQty);
          if (!isNaN(minQuantity) && minQuantity > 0) {
            query = query.gte('quantity', minQuantity);
          }
        }
        if (filters.dateFrom) {
          query = query.gte('pickup_time', new Date(filters.dateFrom).toISOString());
        }
        if (filters.dateTo) {
          const adjustedEndDate = new Date(filters.dateTo);
          adjustedEndDate.setHours(23, 59, 59, 999);
          query = query.lte('pickup_time', adjustedEndDate.toISOString());
        }
      } else {
        query = supabase
          .from('requests')
          .select(`
            id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, status, created_at,
            user:profiles!inner(organization_name, address)
          `)
          .eq('status', 'active')
          .neq('user_id', user.id);

        if (filters.minQty) {
          const minPeople = parseInt(filters.minQty);
          if (!isNaN(minPeople) && minPeople > 0) {
            query = query.gte('people_count', minPeople);
          }
        }
        if (filters.dateFrom) {
          query = query.gte('pickup_date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('pickup_date', filters.dateTo);
        }
      }

      const { data, error: queryError } = await query
        .order('created_at', { ascending: false })
        .returns<(DonationFeed[] | RequestFeedItem[])>();

      if (queryError) throw queryError;
      setFeedItems(data || []);
    } catch (err: any) {
      console.error("Error fetching feed data:", err);
      setError(err.message || `Failed to fetch ${activeViewType}.`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActiveViewType('donations');
    setFilters({
      foodType: '',
      minQty: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const filteredItems = feedItems.filter(item => {
    const isDonation = 'food_item' in item;
    const itemDescription = isDonation ? (item as DonationFeed).food_item.description : (item as RequestFeedItem).description;
    const matchesSearch = searchTerm === '' ||
      (isDonation && (item as DonationFeed).food_item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isDonation ? 
        ((item as DonationFeed).donor?.organization_name && (item as DonationFeed).donor.organization_name.toLowerCase().includes(searchTerm.toLowerCase())) :
        ((item as RequestFeedItem).user?.organization_name && (item as RequestFeedItem).user.organization_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    return matchesSearch;
  });
  
  const dateInputClassName = "mt-1 block w-full pl-3 pr-3 py-2 text-base border-primary-25 focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm rounded-md shadow-sm bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400";

  const formatPickupWindow = (donation: DonationFeed) => {
    if (donation.pickup_slots && Array.isArray(donation.pickup_slots) && donation.pickup_slots.length > 0) {
      const slot = donation.pickup_slots[0];
      const date = new Date(donation.pickup_time);
      const dateStr = date.toLocaleDateString();
      return `Pickup: ${dateStr}, ${slot.start}–${slot.end}`;
    }
    const date = new Date(donation.pickup_time);
    return `Pickup: ${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };

  const handleClaimDonation = async (donationId: string) => {
    if (!currentUserId) {
      router.push('/auth/login');
      return;
    }
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status: 'claimed', receiver_id: currentUserId })
        .eq('id', donationId)
        .eq('status', 'available');

      if (error) throw error;
      fetchFeedData(); 
    } catch (err: any) {
      console.error("Error claiming donation:", err);
      setError(err.message || 'Failed to claim donation.');
    }
  };

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
            Explore all available offers
          </h1>
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-50" />
            <Input
              type="text"
              placeholder="Search donations, requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeViewType === 'donations' ? 'primary' : 'secondary'}
            onClick={() => setActiveViewType('donations')}
            className="flex-1 sm:flex-none"
          >
            <PackageIcon className="mr-2 h-4 w-4" /> Donations
          </Button>
          <Button
            variant={activeViewType === 'requests' ? 'primary' : 'secondary'}
            onClick={() => setActiveViewType('requests')}
            className="flex-1 sm:flex-none"
          >
            <HandshakeIcon className="mr-2 h-4 w-4" /> Requests
          </Button>
        </div>

        <FilterBar
          onFilterChange={(key, value) => {
            if (key === 'type') return;
            setFilters(f => ({ ...f, [key]: value as string | string[] }));
          }}
          activeFilters={filters}
          showStatus={false}
          showType={false}
          showAllergens={false}
          showFoodType={true}
          showMinQty={true}
          showDateRange={true}
        />

        {error && (
          <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isDonation = 'food_item' in item;
              if (isDonation) {
                const donation = item as DonationFeed;
                return (
                  <Link href={`/donate/detail/${donation.id}`} key={donation.id} className="block group">
                    <div className="overflow-hidden rounded-xl border border-primary-10 bg-white shadow-sm transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
                      <div className="relative h-48 w-full">
                        {donation.food_item.image_url ? (
                          <Image
                            src={donation.food_item.image_url}
                            alt={donation.food_item.name}
                            fill
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 text-primary font-semibold px-3 py-1.5 rounded-full text-xs flex items-center shadow">
                          <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                          500m
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-primary truncate group-hover:text-primary-700">
                          {donation.food_item.name}
                        </h3>
                        <p className="text-sm text-primary-75 mt-1">
                          {`${donation.quantity} ${donation.unit || 'kg'} · from ${donation.donor?.organization_name || 'Unknown Donor'}`}
                        </p>
                        {donation.food_item.food_type && (
                          <p className="text-xs text-primary-60 mt-0.5 italic">
                            {donation.food_item.food_type}
                          </p>
                        )}
                        <p className="text-xs text-primary-60 mt-0.5">
                          {formatPickupWindow(donation)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                const request = item as RequestFeedItem;
                return (
                  <div
                    key={request.id}
                    className="overflow-hidden rounded-lg bg-base shadow transition-shadow hover:shadow-md"
                  >
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                       <HandshakeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                         <HandshakeIcon className="w-5 h-5 mr-2 text-primary" />
                         <h3 className="text-titleXs font-semibold text-primary">
                          Food Request
                         </h3>
                      </div>
                      <p className="mt-2 text-body text-primary-75 line-clamp-3 h-[60px]">
                        {request.description}
                      </p>
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-primary-75"><span className="font-medium text-primary">People to Feed:</span> {request.people_count}</p>
                        <p className="text-primary-75"><span className="font-medium text-primary">Requester:</span> {request.user?.organization_name || 'N/A'}</p>
                        <p className="text-primary-75"><span className="font-medium text-primary">Location:</span> {request.user?.address || 'N/A'}</p>
                        <p className="text-primary-75">
                          <span className="font-medium text-primary">Needed:</span>{' '}
                          {new Date(request.pickup_date + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}{' '}
                          from {request.pickup_start_time} to {request.pickup_end_time}
                        </p>
                      </div>
                      {request.status === 'active' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={(e) => { e.stopPropagation(); router.push(`/request/${request.id}`); }} 
                        >
                          Rescue Food
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-body text-primary-75">
                {searchTerm || filters.foodType || filters.minQty || filters.dateFrom || filters.dateTo 
                  ? `No ${activeViewType} match your criteria` 
                  : `No ${activeViewType} available at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 