'use client';

import React from 'react';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';

export default function TerminalViestiPage() {
  return (
    <TerminalUIShell>
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Viesti</h1>
          <p className="text-gray-600 mt-2">
            Placeholder for messaging/communications. Internal terminal messages
            and notifications will appear here.
          </p>
        </div>
      </div>
    </TerminalUIShell>
  );
}
