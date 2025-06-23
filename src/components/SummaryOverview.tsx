import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Donation {
  status: string;
}

interface SummaryOverviewProps {
  userId?: string;
  donations: Donation[];
}

const SummaryOverview: React.FC<SummaryOverviewProps> = ({ userId, donations }) => {
  // Since we don't have active requests in our mock data, we'll just hardcode it for now.
  const activeRequests = 0;
  const activeOffers = donations.filter((d: Donation) => d.status === 'available' || d.status === 'claimed').length;

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-6 py-4 px-4 bg-base rounded-xl border border-border">
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <Link href="/donate/all-offers?filter=active&type=donations" className="focus:outline-none group flex flex-col items-center">
          <span className="text-2xl font-bold text-primary group-hover:underline cursor-pointer">{activeOffers}</span>
          <span className="text-sm text-primary-75 block group-hover:underline cursor-pointer">Active offers</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <Link href="/donate/all-offers?filter=active&type=requests" className="focus:outline-none group flex flex-col items-center">
          <span className="text-2xl font-bold text-primary group-hover:underline cursor-pointer">{activeRequests}</span>
          <span className="text-sm text-primary-75 block group-hover:underline cursor-pointer">Active requests</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col justify-end items-center md:items-end py-2">
        <Link href="/donate/all-offers?filter=active" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
          See all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default SummaryOverview; 