'use client';

import React from 'react';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';

export default function TerminalHelpPage() {
  return (
    <TerminalUIShell>
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Help</h1>
          <div className="mt-3 space-y-2 text-gray-700">
            <p>
              Need assistance? Check documentation or contact support via the
              contact icon in the header.
            </p>
            <ul className="list-disc pl-5">
              <li>How to process incoming donations</li>
              <li>How to schedule and dispatch routes</li>
              <li>Who to contact for technical issues</li>
            </ul>
          </div>
        </div>
      </div>
    </TerminalUIShell>
  );
}
