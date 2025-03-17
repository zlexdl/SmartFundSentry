import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartFundSentry - Solana链上资金监控系统',
  description: '监控Solana区块链上的智能资金动向，接收实时通知',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          {children}
        </div>
      </body>
    </html>
  );
}