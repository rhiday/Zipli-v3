import React from 'react';
import Link from 'next/link';
import { BackArrowIcon } from '@/components/ui/icons/BackArrowIcon';

interface SecondaryNavbarProps {
  title: string;
  backHref?: string;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

export const SecondaryNavbar: React.FC<SecondaryNavbarProps> = ({
  title,
  backHref,
  onBackClick,
  children,
}) => (
  <header className="p-4 bg-white relative h-[80px] flex items-center">
    <div className="flex items-center relative w-full">
      {onBackClick ? (
        <button onClick={onBackClick} className="text-black z-10">
          <BackArrowIcon />
        </button>
      ) : backHref ? (
        <Link href={backHref} className="text-black z-10">
          <BackArrowIcon />
        </Link>
      ) : null}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold text-black leading-normal whitespace-nowrap">
        {title}
      </h1>
    </div>
    {children}
  </header>
);
