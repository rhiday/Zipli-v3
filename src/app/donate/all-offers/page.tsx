'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { ChevronLeft, FilterXIcon, PackageIcon, HandshakeIcon, SlidersHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Database, Json } from '@/lib/supabase/types';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import FilterBar from '@/components/ui/FilterBar';

type FoodItemDetails = {
  name: string;
  description: string | null;
  image_url: string | null;
  food_type: string | null;
};

type DonationItem = {
  id: string;
  created_at: string;
  donor_id: string;
  food_item_id: string;
  pickup_time: string | null;
  pickup_slots: Json | null;
  quantity: number;
  status: string;
  updated_at: string;
  itemType: 'donation';
  food_item: FoodItemDetails;
  unit?: string;
};

type RequestItem = Database['public']['Tables']['requests']['Row'] & {
  itemType: 'request';
};

type DisplayItem = DonationItem | RequestItem;

const FOOD_TYPE_OPTIONS = ["Prepared meals", "Fresh produce", "Cold packaged foods", "Bakery and Pastry", "Other"];

export default function AllItemsPage(): React.ReactElement {
  const router = useRouter();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');

  const [filters, setFilters] = useState({
    type: 'donations',
    allergens: [],
    foodType: '',
    status: '',
    minQty: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchItems();
  }, [filters]);

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
        .single();
      if (profileData) {
        setUserName(profileData.organization_name || profileData.full_name || 'User');
      }

      let fetchedItems = [];
      if (filters.type === 'donations') {
        let query = supabase
          .from('donations')
          .select('id, created_at, donor_id, food_item_id, pickup_time, pickup_slots, quantity, status, updated_at, food_item:food_items(name, description, image_url, food_type)')
          .eq('donor_id', user.id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.foodType) query = query.eq('food_items.food_type', filters.foodType);
        if (filters.minQty) {
          const minQty = parseInt(filters.minQty);
          if (!isNaN(minQty) && minQty > 0) query = query.gte('quantity', minQty);
        }
        if (filters.dateFrom) query = query.gte('pickup_time', new Date(filters.dateFrom).toISOString());
        if (filters.dateTo) {
          const adjustedEndDate = new Date(filters.dateTo);
          adjustedEndDate.setHours(23, 59, 59, 999);
          query = query.lte('pickup_time', adjustedEndDate.toISOString());
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        fetchedItems = (data || [])
          .filter(d => d && d.food_item)
          .map(d => {
            const foodItem = Array.isArray(d.food_item) && d.food_item.length > 0 
              ? d.food_item[0] 
              : d.food_item;
            if (!foodItem) return null;
            return {
              ...d,
              itemType: 'donation',
              food_item: foodItem
            };
          })
          .filter(Boolean);
      } else if (filters.type === 'requests') {
        let query = supabase
          .from('requests')
          .select('id, created_at, description, is_recurring, people_count, pickup_date, pickup_end_time, pickup_start_time, status, updated_at, user_id')
          .eq('user_id', user.id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.minQty) {
          const minPeople = parseInt(filters.minQty);
          if (!isNaN(minPeople) && minPeople > 0) query = query.gte('people_count', minPeople);
        }
        if (filters.dateFrom) query = query.gte('pickup_date', filters.dateFrom);
        if (filters.dateTo) query = query.lte('pickup_date', filters.dateTo);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        fetchedItems = (data || []).map(r => ({ ...r, itemType: 'request' }));
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
    setFilters({
      type: 'donations',
      allergens: [],
      foodType: '',
      status: '',
      minQty: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const donationStatuses = ["available", "claimed", "picked_up", "cancelled"];
  const requestStatuses = ["active", "fulfilled", "cancelled"];
  const currentStatusOptions = filters.type === 'donations' ? donationStatuses : requestStatuses;
  const quantityLabel = filters.type === 'donations' ? "Min. Quantity" : "Min. People";
  const dateInputClassName = "mt-1 block w-full pl-3 pr-3 py-2 text-base border-primary-25 focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm rounded-md shadow-sm bg-base dark:bg-gray-700 dark:border-gray-600 dark:text-primary dark:placeholder-gray-400";

  const formatPickupWindow = (donation: DonationItem) => {
    if (!donation || !donation.pickup_time) return '';
    try {
      if (donation.pickup_slots && 
          Array.isArray(donation.pickup_slots) && 
          donation.pickup_slots.length > 0 &&
          typeof donation.pickup_slots[0] === 'object' &&
          donation.pickup_slots[0] !== null &&
          'start' in donation.pickup_slots[0] && 
          'end' in donation.pickup_slots[0]) {
        
        const slot = donation.pickup_slots[0] as { start: string; end: string };
        const date = new Date(donation.pickup_time);
        const dateStr = date.toLocaleDateString();
        return `Pickup: ${dateStr}, ${slot.start}–${slot.end}`;
      }
      const date = new Date(donation.pickup_time);
      return `Pickup: ${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch (error) {
      console.error('Error formatting pickup window:', error);
      return 'Pickup time not available';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base pb-20">
      <Header title={`All ${filters.type === 'donations' ? 'Donations' : 'Requests'} by ${userName}`} />

      <main className="relative z-20 -mt-6 rounded-t-3xl md:rounded-t-none bg-base py-6 px-4 md:px-8 space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <FilterBar
          onFilterChange={(key, value) => setFilters(f => ({ ...f, [key]: value }))}
          activeFilters={filters}
          showStatus={true}
          statusOptions={filters.type === 'donations' ? ["available", "claimed", "picked_up", "cancelled"] : ["active", "fulfilled", "cancelled"]}
          showType={true}
          showAllergens={false}
          showFoodType={true}
          showMinQty={true}
          showDateRange={true}
        />

        {error && <div className="mb-6 rounded-md bg-red-100 p-4 text-sm text-red-700"><p>Error: {error}</p></div>}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {items.map((item) => {
              const isDonation = item.itemType === 'donation';
              
              if (isDonation && !(item as DonationItem).food_item) {
                return null;
              }
              
              const title = isDonation && (item as DonationItem).food_item 
                ? (item as DonationItem).food_item.name 
                : !isDonation ? (item as RequestItem).description.substring(0, 30) + ((item as RequestItem).description.length > 30 ? '...' : '') 
                : 'No title';
                
              const description = isDonation && (item as DonationItem).food_item
                ? (item as DonationItem).food_item.description 
                : !isDonation ? (item as RequestItem).description 
                : null;
              
              const displayStatus = item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              const dateLabel = isDonation ? "Offered" : "Requested";
              const itemDate = item.created_at;
              const detailLink = isDonation ? `/donate/${item.id}` : `/request/${item.id}`;
              const quantityOrPeople = isDonation ? `${(item as DonationItem).quantity} ${(item as DonationItem).unit || 'kg'}` : `${(item as RequestItem).people_count} people`;

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
                  {isDonation && (item as DonationItem).food_item && (item as DonationItem).food_item.food_type && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Type: {(item as DonationItem).food_item.food_type}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{isDonation ? "Quantity:" : "For:"} {quantityOrPeople}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isDonation && (item as DonationItem).pickup_time && formatPickupWindow(item as DonationItem)}
                    {!isDonation && (
                      <> 
                        Needed on: {new Date((item as RequestItem).pickup_date + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
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