import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConfettiProvider } from '@/src/components/ConfettiOverlay';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Nest HQ',
  description: 'Family household management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-bg font-sans antialiased">
        <ConfettiProvider>
          {children}
        </ConfettiProvider>
      </body>
    </html>
  );
}
