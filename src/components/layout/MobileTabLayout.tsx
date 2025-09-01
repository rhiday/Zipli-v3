'use client';

import React from 'react';
import Link from 'next/link';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

const MobileTabLayout: React.FC = () => {
  const { t } = useCommonTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-base border-t border-border flex justify-around items-center md:hidden">
      <Link href="/donate" className="text-primary font-medium">
        {t('navigation.dashboard')}
      </Link>
      <Link href="/donate/new" className="text-primary font-medium">
        {t('navigation.add')}
      </Link>
      <Link href="/feed" className="text-primary font-medium">
        {t('navigation.explore')}
      </Link>
    </nav>
  );
};

export default MobileTabLayout;
