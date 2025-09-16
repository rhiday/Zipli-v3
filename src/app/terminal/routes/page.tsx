'use client';

import React from 'react';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';

export default function TerminalRoutesPage() {
  return (
    <TerminalUIShell>
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Routes</h1>
          <p className="text-gray-600 mt-2">
            Route management coming soon. You will be able to plan, track, and
            optimize delivery routes here.
          </p>
        </div>
      </div>
    </TerminalUIShell>
  );
}
