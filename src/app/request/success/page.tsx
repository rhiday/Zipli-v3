'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function RequestSuccessPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="text-center max-w-md w-full">
        <CheckCircle className="text-positive mx-auto h-16 w-16 mb-6" />
        <h1 className="text-titleMd md:text-titleLg font-display text-primary mb-4">
          Request Submitted!
        </h1>
        <p className="text-body text-primary-75 mb-8">
          Your food request has been successfully submitted. You can view its status or explore other listings.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:justify-center sm:space-x-4">
          <Link href="/donate/all-offers?type=requests" passHref>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 whitespace-nowrap">
              View My Requests
            </Button>
          </Link>
          <Link href="/feed" passHref>
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 whitespace-nowrap">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 