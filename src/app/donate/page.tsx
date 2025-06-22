'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import { ArrowRight, Info, ChevronDown, PlusIcon, PackageIcon, Scale, Utensils, Euro, Leaf } from 'lucide-react';
import { Database } from '@/lib/supabase/types';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { jsPDF } from 'jspdf';
import SummaryOverview from '@/components/SummaryOverview';
import DonationCard from '@/components/donations/DonationCard';
import { useDonationStore } from '@/store/donation';

type DonationWithFoodItem = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    expiry_date: string;
    allergens: string | null;
  };
  quantity: number;
  status: string;
  pickup_time: string;
  created_at: string;
};

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

type DonorDashboardData = {
    profile: ProfileRow | null;
    donations: DonationWithFoodItem[];
}

export default function DonorDashboardPage(): React.ReactElement {
  const router = useRouter();
  const { donationItems, setDonationItems } = useDonationStore();
  const [dashboardData, setDashboardData] = useState<DonorDashboardData>({ profile: null, donations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate last 3 months
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth(); // 0-11
  const lastThreeMonthsIndices = [
      (currentMonthIndex - 2 + 12) % 12, // Two months ago
      (currentMonthIndex - 1 + 12) % 12, // One month ago
      currentMonthIndex // Current month
  ];
  const lastThreeMonths = lastThreeMonthsIndices.map(index => allMonths[index]);

  // Set default selected month to the current month
  const [selectedMonth, setSelectedMonth] = useState(allMonths[currentMonthIndex]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<ProfileRow>();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select(`
          id,
          quantity,
          status,
          pickup_time,
          created_at,
          food_item:food_items!inner(
            name,
            description,
            image_url,
            allergens
          )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })
        .returns<DonationWithFoodItem[]>();

      if (donationsError) throw donationsError;

      setDashboardData({ profile: profileData, donations: donationsData || [] });

      if (donationsData) {
        const itemsForStore = donationsData.map((d) => ({
          id: d.id,
          name: d.food_item.name,
          quantity: String(d.quantity),
          description: d.food_item.description,
          allergens: d.food_item.allergens
            ? d.food_item.allergens.split(',').map(a => a.trim())
            : ['Gluten-Free', 'Lactose-Free'],
          imageUrl: d.food_item.image_url || undefined,
        }));
        setDonationItems(itemsForStore);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder PDF generation function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Zipli Summary', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food offered: 46kg`, 10, 20);
    doc.text(`Portions offered: 131`, 10, 30);
    doc.text(`Saved in food disposal costs: 125€`, 10, 40);
    doc.text(`Emission reduction: 89%`, 10, 50);
    doc.save('zipli-summary.pdf');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={dashboardData.profile?.organization_name || dashboardData.profile?.full_name || 'Donor'} />

      <main className="relative z-20 mt-4 rounded-t-3xl md:rounded-t-none py-4 px-4 md:px-12 space-y-6">
        {/* This section is being removed as it's redundant with the header */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-primary mb-4">Your impact</h2>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="underline underline-offset-4 inline-flex items-center gap-1 text-primary text-lg font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-1">
                        {selectedMonth}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    {lastThreeMonths.map((month) => (
                      <DropdownMenuItem key={month} onSelect={() => setSelectedMonth(month)}>
                        {month}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* Total food offered */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">46kg</span>
                </div>
                <span className="text-sm text-primary-75">Total food offered</span>
              </div>
              {/* Portions offered */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">131</span>
                </div>
                <span className="text-sm text-primary-75">Portions offered</span>
              </div>
              {/* Saved in food disposal costs */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">125€</span>
                </div>
                <span className="text-sm text-primary-75">Saved in food disposal costs</span>
              </div>
              {/* CO2 Avoided */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">10t</span>
                </div>
                <span className="text-sm text-primary-75">CO2 Avoided</span>
              </div>
            </div>
        </section>

        {/* Export to PDF as a text link */}
        <div className="my-4">
          <a
            onClick={handleExportPDF}
            className="text-primary underline font-semibold cursor-pointer"
            tabIndex={0}
            role="button"
          >
            Export to PDF
          </a>
          <span className="block text-sm text-primary-75 mt-1">
            Environmental and social impact data for reporting, and operation planning.
          </span>
        </div>
        
        {/* This is whom you've helped section */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">This is whom you've helped</h2>
          
          <div className="space-y-4">
            {/* Recipient 1 - Tsänssi */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image 
                  src="/images/tsänssi.jpg" 
                  alt="Tsänssi logo" 
                  fill
                  className="object-contain bg-white"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Tsänssi</h3>
                <p className="text-sm text-primary-75">3 kg · Warm food</p>
              </div>
            </div>
            
            {/* Recipient 2 - Red cross */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image 
                  src="/images/redcross.jpg" 
                  alt="Red Cross logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Red cross</h3>
                <p className="text-sm text-primary-75">10 kg · Warm food; Cold food</p>
              </div>
            </div>
            
            {/* Recipient 3 - Andreas church */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image 
                  src="/images/kirkko.jpg" 
                  alt="Andreas church logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Andreas church</h3>
                <p className="text-sm text-primary-75">7 kg · Cold food</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />

      {/* Force-hide any rogue Figma card section if it still exists */}
      <style>{`.rogue-donation-card { display: none !important; }`}</style>
    </div>
  );
}