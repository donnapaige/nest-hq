import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConfettiProvider } from '@/src/components/ConfettiOverlay';
import { AuthProvider } from '@/src/context/AuthContext';
import { HouseholdProvider } from '@/src/context/HouseholdContext';
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
        <AuthProvider>
          <HouseholdProvider>
            <ConfettiProvider>
              {children}
            </ConfettiProvider>
          </HouseholdProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
