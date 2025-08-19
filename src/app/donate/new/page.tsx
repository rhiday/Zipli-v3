'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDonationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to manual donation form
    router.replace('/donate/manual');
  }, [router]);

  return null;
}
