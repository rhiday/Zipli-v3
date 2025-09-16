'use client';

import React from 'react';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';

export default function TerminalCrmPage() {
  return (
    <TerminalUIShell>
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">CRM</h1>
          <p className="text-gray-600 mt-2">
            Placeholder for CRM features. Customer and partner management will
            appear here.
          </p>
        </div>
      </div>
    </TerminalUIShell>
  );
}
