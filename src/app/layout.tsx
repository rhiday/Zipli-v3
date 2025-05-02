import type { Metadata } from 'next';
import './globals.css'; // Assuming globals.css exists for Tailwind base styles
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Zipli - Food Donation Platform',
  description: 'Connecting food donors and receivers to reduce waste.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
