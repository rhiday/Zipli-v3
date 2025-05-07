'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { ChevronLeft, FilterXIcon, PackageIcon, HandshakeIcon, SlidersHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Database } from '@/lib/supabase/types';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

type FoodItemDetails = {
  name: string;
  description: string | null;
  image_url: string | null;
};

type DonationItem = Database['public']['Tables']['donations']['Row'] & {
  itemType: 'donation';
  food_item: FoodItemDetails;
};

type RequestItem = Database['public']['Tables']['requests']['Row'] & {
  itemType: 'request';
};

type DisplayItem = DonationItem | RequestItem;

export default function AllItemsPage(): React.ReactElement {
  const router = useRouter();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');

  const [offerTypeFilter, setOfferTypeFilter] = useState<'donations' | 'requests'>('donations');
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [quantityFilter, setQuantityFilter] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [offerTypeFilter, statusFilter, quantityFilter, startDateFilter, endDateFilter]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_name, full_name')
        .eq('id', user.id)
        .single<Pick<Database['public']['Tables']['profiles']['Row'], 'organization_name' | 'full_name'>>();
      
      if (profileData) {
        setUserName(profileData.organization_name || profileData.full_name || 'User');
      }

      let fetchedItems: DisplayItem[] = [];

      if (offerTypeFilter === 'donations') {
        let query = supabase
          .from('donations')
          .select(`
            *,
            food_item:food_items!inner(
              name, description, image_url
            )
          `)
          .eq('donor_id', user.id);

        if (statusFilter) query = query.eq('status', statusFilter);
        if (quantityFilter && showAdditionalFilters) {
          const minQty = parseInt(quantityFilter);
          if (!isNaN(minQty) && minQty > 0) query = query.gte('quantity', minQty);
        }
        if (startDateFilter && showAdditionalFilters) query = query.gte('pickup_time', new Date(startDateFilter).toISOString());
        if (endDateFilter && showAdditionalFilters) {
          const adjustedEndDate = new Date(endDateFilter);
          adjustedEndDate.setHours(23, 59, 59, 999);
          query = query.lte('pickup_time', adjustedEndDate.toISOString());
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        fetchedItems = (data || []).map(d => ({ ...d, itemType: 'donation' } as DonationItem));

      } else if (offerTypeFilter === 'requests') {
        let query = supabase
          .from('requests')
          .select('id, created_at, description, is_recurring, people_count, pickup_date, pickup_end_time, pickup_start_time, status, updated_at, user_id')
          .eq('user_id', user.id);

        if (statusFilter) query = query.eq('status', statusFilter);
        if (quantityFilter && showAdditionalFilters) {
          const minPeople = parseInt(quantityFilter);
          if (!isNaN(minPeople) && minPeople > 0) query = query.gte('people_count', minPeople);
        }
        if (startDateFilter && showAdditionalFilters) query = query.gte('pickup_date', startDateFilter);
        if (endDateFilter && showAdditionalFilters) query = query.lte('pickup_date', endDateFilter);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        fetchedItems = (data || []).map(r => ({ ...r, itemType: 'request' } as RequestItem));
      }
      setItems(fetchedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to load items.');
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setQuantityFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setShowAdditionalFilters(false);
  };

  const donationStatuses = ["available", "claimed", "picked_up", "cancelled"];
  const requestStatuses = ["active", "fulfilled", "cancelled"];
  const currentStatusOptions = offerTypeFilter === 'donations' ? donationStatuses : requestStatuses;
  const quantityLabel = offerTypeFilter === 'donations' ? "Min. Quantity" : "Min. People";
  const dateInputClassName = "mt-1 block w-full pl-3 pr-3 py-2 text-base border-primary-25 focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm rounded-md shadow-sm bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base pb-20">
      <Header title={`All ${offerTypeFilter === 'donations' ? 'Donations' : 'Requests'} by ${userName}`} />

      <main className="relative z-20 -mt-6 rounded-t-3xl md:rounded-t-none bg-base py-6 px-4 md:px-8 space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-primary-75">Item Type</Label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={offerTypeFilter === 'donations' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => { setOfferTypeFilter('donations'); setStatusFilter(""); setShowAdditionalFilters(false); }}
              className="rounded-full px-4 py-1.5 text-sm"
            >
              <PackageIcon className="mr-2 h-4 w-4" /> Donations
            </Button>
            <Button 
              variant={offerTypeFilter === 'requests' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => { setOfferTypeFilter('requests'); setStatusFilter(""); setShowAdditionalFilters(false); }}
              className="rounded-full px-4 py-1.5 text-sm"
            >
              <HandshakeIcon className="mr-2 h-4 w-4" /> Requests
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="block text-sm font-medium text-primary-75">Status</Label>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === "" ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setStatusFilter("")}
              className="rounded-full px-4 py-1.5 text-sm"
            >
              All Statuses
            </Button>
            {currentStatusOptions.map(status => (
              <Button 
                key={status} 
                variant={statusFilter === status ? 'primary' : 'secondary'} 
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="rounded-full px-4 py-1.5 text-sm capitalize"
              >
                {status.replace('_',' ')}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
            className="text-primary hover:text-primary/90 text-xs p-1 sm:text-sm sm:p-2 flex items-center self-start"
          >
            {showAdditionalFilters ? <ChevronUpIcon className="mr-1 sm:mr-2 h-4 w-4" /> : <ChevronDownIcon className="mr-1 sm:mr-2 h-4 w-4" />}
            {showAdditionalFilters ? 'Less' : 'More'} Filters
          </Button>
          <Button 
            onClick={clearFilters} 
            variant="ghost" 
            className="text-primary hover:text-primary/80 text-xs p-1 sm:text-sm sm:size-auto flex items-center self-end"
          >
              <FilterXIcon className="mr-1 sm:mr-2 h-4 w-4" /> Clear All Filters
          </Button>
        </div>

        {showAdditionalFilters && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-end">
              <div>
                <Label htmlFor="quantity-filter" className="block text-sm font-medium text-primary-75 mb-1">{quantityLabel}</Label>
                <Input id="quantity-filter" type="number" placeholder="e.g., 10" value={quantityFilter} onChange={(e) => setQuantityFilter(e.target.value)} />
              </div>
              <div></div>
              <div>
                <Label htmlFor="start-date-filter" className="block text-sm font-medium text-primary-75 mb-1">Date From</Label>
                <Input id="start-date-filter" type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className={dateInputClassName} />
              </div>
              <div>
                <Label htmlFor="end-date-filter" className="block text-sm font-medium text-primary-75 mb-1">Date Until</Label>
                <Input id="end-date-filter" type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className={dateInputClassName} />
              </div>
            </div>
          </div>
        )}

        {error && <div className="mb-6 rounded-md bg-red-100 p-4 text-sm text-red-700"><p>Error: {error}</p></div>}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {items.map((item) => {
              const isDonation = item.itemType === 'donation';
              const title = isDonation ? (item as DonationItem).food_item.name : (item as RequestItem).description.substring(0, 30) + ((item as RequestItem).description.length > 30 ? '...':'');
              const description = isDonation ? (item as DonationItem).food_item.description : (item as RequestItem).description;
              const displayStatus = item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              const dateLabel = isDonation ? "Offered" : "Requested";
              const itemDate = item.created_at;
              const detailLink = isDonation ? `/donate/${item.id}` : `/request/${item.id}`;
              const quantityOrPeople = isDonation ? `${(item as DonationItem).quantity} units` : `${(item as RequestItem).people_count} people`;

              return (
                <Link key={item.id} href={detailLink} className="block transform rounded-xl border border-border bg-base p-4 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-md font-semibold text-primary line-clamp-2 flex items-center">
                      {isDonation ? <PackageIcon className="mr-2 h-4 w-4 text-green-600" /> : <HandshakeIcon className="mr-2 h-4 w-4 text-blue-600" />}
                      {title}
                    </h3>
                    <span className={cn(
                        'whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
                        item.status === 'available' || item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'claimed' || item.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'picked_up' ? 'bg-purple-100 text-purple-800' : 
                        item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      )}>{displayStatus}</span>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground line-clamp-3 h-12 overflow-hidden">{description || "No description."}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isDonation ? "Quantity:" : "For:"} {quantityOrPeople}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dateLabel}: {new Date(itemDate).toLocaleDateString()}
                    {isDonation && (item as DonationItem).pickup_time && ` | Pickup: ${new Date((item as DonationItem).pickup_time!).toLocaleDateString()}`}
                    {!isDonation && (
                      <> 
                        | Needed on: {new Date((item as RequestItem).pickup_date + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        {' from '}{(item as RequestItem).pickup_start_time} to {(item as RequestItem).pickup_end_time}
                      </>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="col-span-full py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zm3-12V3m0 18v-2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found matching your filters.</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or clear them to see all items.</p>
          </div>
        )}
      </main>
    </div>
  );
} 