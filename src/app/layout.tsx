'use client';
import type { Metadata } from 'next';
import './globals.css'; // Assuming globals.css exists for Tailwind base styles
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('@/components/NavBar'), { ssr: false });

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
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
