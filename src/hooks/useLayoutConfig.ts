'use client';

import { usePathname } from 'next/navigation';

/**
 * Shared layout configuration hook
 * Consolidates layout decisions for AppShell and PageContainer
 */
export const useLayoutConfig = () => {
  const pathname = usePathname();

  // Single source of truth for flow pages that should hide bottom nav
  const flowRegex =
    /^\/(donate|request)\/(new|manual|pickup-slot|schedule|summary|thank-you|success|detail|one-time-form|recurring-form|select-type|[^/]+\/handover-confirm)/;

  const isFlowPage = flowRegex.test(pathname) || pathname === '/profile';

  return {
    showBottomNav: !isFlowPage,
    // For PageContainer footer spacing
    needsBottomNavSpacing: !isFlowPage,
  };
};
