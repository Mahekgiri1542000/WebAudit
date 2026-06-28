import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'WebAudit — AI-Powered Website Auditing',
    template: '%s | WebAudit',
  },
  description: 'Audit your website for SEO, GEO (AI search), AEO, PageSpeed, security, and worldwide rankings in 60 seconds.',
  keywords: ['website audit', 'SEO checker', 'PageSpeed', 'GEO', 'AI search optimization'],
  openGraph: {
    title: 'WebAudit — AI-Powered Website Auditing',
    description: 'Full website audit in 60 seconds — SEO, AI Visibility, PageSpeed, Security.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#020817] text-slate-100 antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
