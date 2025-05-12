'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { SearchIcon, FilterXIcon, ChevronDownIcon, ChevronUpIcon, PackageIcon, HandshakeIcon, MapPinIcon, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type DonationFeed = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    allergens: string | null;
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

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<(DonationFeed | RequestFeedItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [itemTypeFilter, setItemTypeFilter] = useState<"donations" | "requests">("donations");
  const [allergenFilter, setAllergenFilter] = useState<string>("");
  const [quantityFilter, setQuantityFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

  useEffect(() => {
    fetchFeedData();
  }, [itemTypeFilter, allergenFilter, quantityFilter, startDateFilter, endDateFilter, showAdditionalFilters]);

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

      if (itemTypeFilter === "donations") {
        query = supabase
          .from('donations')
          .select(`
            id, quantity, status, pickup_time, created_at,
            food_item:food_items!inner(name, description, image_url, allergens),
            donor:profiles!donations_donor_id_fkey!inner(organization_name, address)
          `)
          .eq('status', 'available')

        if (allergenFilter) {
          query = query.ilike('food_items.allergens', `%${allergenFilter}%`);
        }
        if (quantityFilter && showAdditionalFilters) {
          const minQuantity = parseInt(quantityFilter);
          if (!isNaN(minQuantity) && minQuantity > 0) {
            query = query.gte('quantity', minQuantity);
          }
        }
        if (startDateFilter && showAdditionalFilters) {
          query = query.gte('pickup_time', new Date(startDateFilter).toISOString());
        }
        if (endDateFilter && showAdditionalFilters) {
          const adjustedEndDate = new Date(endDateFilter);
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

        if (quantityFilter && showAdditionalFilters) {
          const minPeople = parseInt(quantityFilter);
          if (!isNaN(minPeople) && minPeople > 0) {
            query = query.gte('people_count', minPeople);
          }
        }
        if (startDateFilter && showAdditionalFilters) {
          query = query.gte('pickup_date', startDateFilter);
        }
        if (endDateFilter && showAdditionalFilters) {
          query = query.lte('pickup_date', endDateFilter);
        }
      }

      const { data, error: queryError } = await query
        .order('created_at', { ascending: false })
        .returns<(DonationFeed[] | RequestFeedItem[])>();

      if (queryError) throw queryError;
      setFeedItems(data || []);
    } catch (err: any) {
      console.error("Error fetching feed data:", err);
      setError(err.message || `Failed to fetch ${itemTypeFilter}.`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setItemTypeFilter("donations");
    setAllergenFilter("");
    setQuantityFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setShowAdditionalFilters(false);
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
            Marketplace
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-primary-75">Show</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={itemTypeFilter === "donations" ? 'primary' : 'secondary'} 
                size="sm"
                onClick={() => setItemTypeFilter("donations")}
                className="rounded-full px-4 py-1.5 text-sm"
              >
                Donations
              </Button>
              <Button 
                variant={itemTypeFilter === "requests" ? 'primary' : 'secondary'} 
                size="sm"
                onClick={() => setItemTypeFilter("requests")}
                className="rounded-full px-4 py-1.5 text-sm"
              >
                Requests
              </Button>
            </div>
          </div>
          
          {itemTypeFilter === "donations" && (
            <div className="space-y-2 pt-2">
              <Label className="block text-sm font-medium text-primary-75">Filter by Dietary Preference</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={allergenFilter === "" ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => setAllergenFilter("")}
                  className="rounded-full px-4 py-1.5 text-sm"
                >
                  All Preferences
                </Button>
                {COMMON_ALLERGENS.map(allergen => (
                  <Button 
                    key={allergen} 
                    variant={allergenFilter === allergen ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setAllergenFilter(allergen)}
                    className="rounded-full px-4 py-1.5 text-sm capitalize"
                  >
                    {allergen}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
              className="text-primary hover:text-primary/90 text-xs p-1 sm:text-sm sm:p-2 flex items-center self-start"
            >
              {showAdditionalFilters ? <ChevronUpIcon className="mr-1 sm:mr-2 h-4 w-4" /> : <ChevronDownIcon className="mr-1 sm:mr-2 h-4 w-4" />}
              {showAdditionalFilters ? 'Less' : 'More'} Filters
            </Button>
            <Button onClick={clearFilters} variant="ghost" className="text-primary hover:text-primary/80 text-xs p-1 sm:text-sm sm:size-auto flex items-center self-end">
                <FilterXIcon className="mr-1 sm:mr-2 h-4 w-4" /> Clear All Filters
            </Button>
          </div>

          {showAdditionalFilters && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-end">
                <div>
                  <Label htmlFor="quantity-filter" className="block text-sm font-medium text-primary-75 mb-1">
                    {itemTypeFilter === 'donations' ? 'Min. Quantity' : 'Min. People to Feed'}
                  </Label>
                  <Input id="quantity-filter" type="number" placeholder="e.g., 10" value={quantityFilter} onChange={(e) => setQuantityFilter(e.target.value)} />
                </div>
                <div></div>
                <div>
                  <Label htmlFor="start-date-filter" className="block text-sm font-medium text-primary-75 mb-1">
                    {itemTypeFilter === 'donations' ? 'Pickup From' : 'Needed From'}
                  </Label>
                  <Input id="start-date-filter" type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className={dateInputClassName} />
                </div>
                <div>
                  <Label htmlFor="end-date-filter" className="block text-sm font-medium text-primary-75 mb-1">
                    {itemTypeFilter === 'donations' ? 'Pickup Until' : 'Needed Until'}
                  </Label>
                  <Input id="end-date-filter" type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className={dateInputClassName} />
                </div>
              </div>
            </div>
          )}
        </div>

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
                  <div
                    key={donation.id}
                    className="overflow-hidden rounded-lg bg-base shadow-md transition-shadow hover:shadow-lg cursor-pointer group"
                    onClick={() => router.push(`/donate/${donation.id}`)}
                  >
                    <div className="relative h-48 w-full">
                      {donation.food_item.image_url ? (
                        <img
                          src={donation.food_item.image_url}
                          alt={donation.food_item.name}
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
                      <p className="text-xs text-primary-60 mt-0.5">
                        {formatPickupWindow(donation)}
                      </p>
                    </div>
                  </div>
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
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => router.push(`/request/${request.id}`)} 
                      >
                        View Request Details
                      </Button>
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-body text-primary-75">
                {searchTerm || allergenFilter || quantityFilter || startDateFilter || endDateFilter 
                  ? `No ${itemTypeFilter} match your criteria` 
                  : `No ${itemTypeFilter} available at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 