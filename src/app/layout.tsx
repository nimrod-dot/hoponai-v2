import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hoponai — The AI That Knows How Your Company Works',
  description: 'Interactive AI-powered training that adapts to every employee. Onboarding, continuous learning, SOPs, and customer training — all in one platform.',
  keywords: ['AI training', 'employee onboarding', 'corporate training', 'interactive learning', 'AI onboarding', 'SOP training'],
  openGraph: {
    title: 'Hoponai — The AI That Knows How Your Company Works',
    description: 'Interactive training that adapts to every employee.',
    url: 'https://hoponai.com',
    siteName: 'Hoponai',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
