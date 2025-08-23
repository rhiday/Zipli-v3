import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Manrope, Space_Grotesk } from 'next/font/google'; // Import fonts
import DevLoginSwitcher from '@/components/dev/DevLoginSwitcher';
import DevSwitcherOverlay from '@/components/dev/DevSwitcherOverlay';
import LangSetter from '@/components/LangSetter';
import Script from 'next/script';

// Configure fonts
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope', // CSS Variable for body/sans
  weight: ['400', '500', '600'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk', // CSS Variable for display
  weight: ['500'],
});

export const metadata: Metadata = {
  title: 'Zipli - Food Donation Platform',
  description: 'Connecting food donors and receivers to reduce waste.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zipli',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === 'development';
  // Read persisted language on client; default en on first render
  // We keep html lang reactive via a data-attr on body for simplicity
  return (
    <html className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <LangSetter />
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
          {isDev && <DevSwitcherOverlay />}
        </ErrorBoundary>
        {/* Performance monitoring in development */}
        {isDev && (
          <Script
            id="performance-monitor"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  import('/src/lib/performance-monitor.js').then(module => {
                    const monitor = module.getPerformanceMonitor();
                    window.__performanceMonitor = monitor;
                  }).catch(() => {});
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
