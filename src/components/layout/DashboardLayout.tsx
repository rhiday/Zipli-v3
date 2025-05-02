'use client';

import React from 'react';
import MobileTabLayout from './MobileTabLayout';

// TODO: Implement Sidebar component for desktop
const Sidebar = () => {
  return (
    <aside className="hidden md:block w-64 bg-cloud p-4 border-r border-border">
      {/* Placeholder for desktop sidebar content */}
      <h2 className="text-lg font-semibold mb-4">Sidebar</h2>
      {/* Add navigation links, user info, etc. */}
    </aside>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0"> {/* Add padding-bottom for mobile tab bar */}
        {children}
      </main>
      <MobileTabLayout />
    </div>
  );
} 