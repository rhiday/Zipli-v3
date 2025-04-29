import type { Metadata } from 'next';
import './globals.css'; // Assuming globals.css exists for Tailwind base styles

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
      <body>{children}</body>
    </html>
  )
}
