'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import { ArrowRight, Info, ChevronDown, PlusIcon, PackageIcon } from 'lucide-react';
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

type DonationWithFoodItem = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    expiry_date: string;
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
            image_url
          )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })
        .returns<DonationWithFoodItem[]>();

      if (donationsError) throw donationsError;

      setDashboardData({ profile: profileData, donations: donationsData || [] });

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
    <div className="min-h-screen bg-base pb-20">
      <Header title={dashboardData.profile?.organization_name || dashboardData.profile?.full_name || 'Donor'} />

      <main className="relative z-20 -mt-6 rounded-t-3xl md:rounded-t-none bg-base py-4 px-6 md:px-12 space-y-6">
        <section>
          <h2 className="text-titleXs font-medium text-primary mb-4">Your active offers and requests</h2>
          {error && (
            <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
              {error}
            </div>
          )}
          <SummaryOverview userId={dashboardData.profile?.id} donations={dashboardData.donations} />
        </section>

        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-primary">Your impact</h2>
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-6">
                <div className="flex flex-col justify-between rounded-xl bg-cream p-3 space-y-1 aspect-square sm:aspect-auto">
                    <div className="flex justify-between items-start">
                        <p className="text-2xl font-semibold text-green-800">46kg</p>
                        <button className="p-0.5 text-primary-50 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-sm font-normal text-primary-75">Total food offered</p>
                </div>
                <div className="flex flex-col justify-between rounded-xl bg-cream p-3 space-y-1 aspect-square sm:aspect-auto">
                    <div className="flex justify-between items-start">
                        <p className="text-2xl font-semibold text-green-800">131</p>
                        <button className="p-0.5 text-primary-50 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-sm font-normal text-primary-75">Portions offered</p>
                </div>
                <div className="flex flex-col justify-between rounded-xl bg-cream p-3 space-y-1 aspect-square sm:aspect-auto">
                    <div className="flex justify-between items-start">
                        <p className="text-2xl font-semibold text-green-800">125€</p>
                    </div>
                    <p className="text-sm font-normal text-primary-75">Saved in food disposal costs</p>
                </div>
                <div className="flex flex-col justify-between rounded-xl bg-cream p-3 space-y-1 aspect-square sm:aspect-auto">
                    <div className="flex justify-between items-start">
                        <p className="text-2xl font-semibold text-green-800">10t</p>
                        <button className="p-0.5 text-primary-50 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-sm font-normal text-primary-75">CO2 Avoided</p>
                </div>
          </div>
        </section>

        {/* Wrapper for Export to PDF section to control its width on desktop */}
        <div className="md:grid md:grid-cols-4 md:gap-3">
            <section
              onClick={handleExportPDF}
              role="button"
              tabIndex={0}
              className="md:col-span-2 rounded-xl border border-border bg-base p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
            >
               <div className="flex-1 mr-4">
                    <h3 className="text-base font-semibold text-primary mb-1">Export to PDF</h3>
                    <p className="text-sm text-muted-foreground">Environmental and social impact data for reporting, and operation planning.</p>
               </div>
               <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </section>
            {/* Optional: If you want to strictly enforce that it only takes up the left half and the right is empty,
                you could add an empty div for the remaining columns on md+ screens.
                Otherwise, it will naturally take the first 2 columns and the rest of the row will be empty.
            <div className="hidden md:block md:col-span-2"></div> */}
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
                  className="object-cover"
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
    </div>
  );
}