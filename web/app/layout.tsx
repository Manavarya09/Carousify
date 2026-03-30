import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Carousify - Instagram Grid Carousel Maker',
  description: 'Create stunning Instagram carousel posts with prebuilt collage templates and AI-powered features.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50">{children}</body>
    </html>
  );
}
