'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DonationThankYouPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base p-6 text-center">
      <div className="max-w-md">
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-positive" />
        <h1 className="mb-4 text-titleMd font-display text-primary">
          Thank You!
        </h1>
        <p className="mb-8 text-bodyLg text-secondary">
          Your donation offer has been successfully submitted. We appreciate your contribution to reducing food waste!
        </p>
        <Button
          onClick={() => router.push('/donate')}
          variant="primary"
          size="lg"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
} 