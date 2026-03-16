import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'GuessNumber Stellar — Cosmic Number Guessing Game',
  description:
    'A futuristic Web3 number guessing game powered by Stellar Soroban smart contracts. Immersive glassmorphism UI with 3D particle environments.',
  keywords: ['stellar', 'soroban', 'web3', 'game', 'blockchain', 'guessing game'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
