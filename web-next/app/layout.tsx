import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/src/providers/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bibently — Znajdź wydarzenia w Twojej okolicy',
  description:
    'Odkrywaj koncerty, imprezy, wystawy i inne wydarzenia w swoim mieście. Bibently — Twoja wyszukiwarka eventów.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} font-sans h-screen overflow-hidden bg-background text-foreground flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
