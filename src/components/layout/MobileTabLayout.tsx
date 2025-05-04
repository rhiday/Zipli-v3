'use client';

import React from 'react';
import Link from 'next/link';

const MobileTabLayout: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-base border-t border-border flex justify-around items-center md:hidden">
    <Link href="/donate" className="text-primary font-medium">Dashboard</Link>
    <Link href="/donate/new" className="text-primary font-medium">Add</Link>
    <Link href="/feed" className="text-primary font-medium">Explore</Link>
  </nav>
);

export default MobileTabLayout; 