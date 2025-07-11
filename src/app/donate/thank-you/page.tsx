'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DonationThankYouPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <div className="mt-12 mb-8">
        <svg width="164" height="231" viewBox="0 0 164 231" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M102.533 225.066C87.3522 204.977 65.8786 200.456 53.3378 195.845C40.7969 191.235 9.16717 185.971 9.00216 167.858C8.83715 149.745 18.1904 152.476 18.1905 137.851C18.1905 129.892 9.29198 121.422 13.6069 110.156C18.3922 97.6608 20.1706 93.2613 18.1904 86.1808C16.2103 79.1004 20.3356 63.1283 53.3378 65.2689C86.34 67.4095 104.656 76.1367 112.247 86.1808C119.837 96.225 108.122 109.365 98.7159 105.611C94.5906 103.964 86.6701 100.012 86.175 81.7348C85.68 63.4574 96.4057 25.6828 112.247 14.1566C128.088 2.63026 144.767 11.2001 138.484 32.1718C133.698 48.1439 124.293 70.577 141.619 99.8867C158.945 129.196 156.47 140.683 150.694 157.808C146.074 171.508 142.719 178.885 141.619 180.861" stroke="#18E170" strokeWidth="17"/>
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-center">Thank you!</h1>
      <p className="text-center text-base text-black mb-10 max-w-xs">
        Your donation offer has been submitted successfully. We appreciate your contribution to reducing food waste!
      </p>
      <Link href="/donate">
        <button className="bg-[#C6FFB7] text-black rounded-full px-8 py-3 font-semibold text-base shadow-sm hover:bg-[#A8F5A0] transition">
          Back to dashboard
        </button>
      </Link>
    </div>
  );
} 