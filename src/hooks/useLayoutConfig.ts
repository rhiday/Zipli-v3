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

  const isFlowPage =
    flowRegex.test(pathname) ||
    pathname === '/profile' ||
    pathname === '/feedback' ||
    pathname === '/contact';

  // Desktop dashboards should not show bottom navigation
  const isDesktopDashboard =
    pathname === '/city/dashboard' ||
    pathname === '/terminal/dashboard' ||
    pathname === '/terminal/profile';

  const hideBottomNav = isFlowPage || isDesktopDashboard;

  return {
    showBottomNav: !hideBottomNav,
    // For PageContainer footer spacing
    needsBottomNavSpacing: !hideBottomNav,
  };
};
