'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/BottomNav';
import { PlusIcon, PackageIcon, Calendar, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function DonorDashboard() {
  return (
    <div className="min-h-screen pb-20 bg-cream">
      <Header title="Donor Dashboard" />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-white p-4 space-y-6">
        <section>
          <h1 className="text-2xl font-bold mb-2 text-earth">
            Welcome, Donor!
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your food donations and help reduce waste in your community.
          </p>
        </section>

        <section className="grid gap-4">
          <Link href="/donate/new">
            <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <PlusIcon className="w-6 h-6 text-earth" />
                <div>
                  <h3 className="font-semibold text-earth">
                    Create New Donation
                  </h3>
                  <p className="text-sm text-gray-600">
                    List available food items for pickup
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/donate/all-offers">
            <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <PackageIcon className="w-6 h-6 text-earth" />
                <div>
                  <h3 className="font-semibold text-earth">My Donations</h3>
                  <p className="text-sm text-gray-600">
                    Track and manage your active donations
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-500">
                  Pickup Schedules
                </h3>
                <p className="text-sm text-gray-500">
                  Coming soon - manage your pickup times
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <FileDown className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-500">Impact Reports</h3>
                <p className="text-sm text-gray-500">
                  Coming soon - download your donation impact
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
