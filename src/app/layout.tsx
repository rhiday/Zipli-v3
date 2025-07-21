import type { Metadata } from 'next';
import './globals.css'; // Assuming globals.css exists for Tailwind base styles
import AppShell from '@/components/AppShell';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Manrope, Space_Grotesk } from 'next/font/google'; // Import fonts
import DevLoginSwitcher from '@/components/dev/DevLoginSwitcher';
import DevSwitcherOverlay from '@/components/dev/DevSwitcherOverlay';

// Configure fonts
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope', // CSS Variable for body/sans
  weight: ['400', '500', '600']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk', // CSS Variable for display
  weight: ['500']
});

export const metadata: Metadata = {
  title: 'Zipli - Food Donation Platform',
  description: 'Connecting food donors and receivers to reduce waste.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDev = process.env.NODE_ENV === 'development';
  return (
    // Apply font variables to html tag
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}> 
      <body>
        <ErrorBoundary>
          <AppShell>{children}</AppShell>
          {isDev && <DevSwitcherOverlay />}
        </ErrorBoundary>
      </body>
    </html>
  );
}
