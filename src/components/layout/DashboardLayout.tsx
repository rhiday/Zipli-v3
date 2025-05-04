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

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-base flex flex-col">
    {children}
  </div>
);

export default DashboardLayout; 