import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hoponai.com'),
  title: {
    default: 'Hoponai - The AI That Knows How Your Company Works',
    template: '%s | Hoponai',
  },
  description: 'Interactive AI-powered training that adapts to every employee. Onboard faster, train smarter, and keep your entire organization aligned.',
  keywords: ['AI training', 'employee onboarding', 'corporate training', 'interactive learning', 'AI onboarding', 'SOP training', 'compliance training', 'corporate training platform'],
  authors: [{ name: 'Hoponai' }],
  creator: 'Hoponai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hoponai.com',
    siteName: 'Hoponai',
    title: 'Hoponai - The AI That Knows How Your Company Works',
    description: 'Interactive AI-powered training that adapts to every employee. Onboard faster, train smarter, and keep your entire organization aligned.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoponai - The AI That Knows How Your Company Works',
    description: 'Interactive AI-powered training that adapts to every employee.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://hoponai.com',
  },
};

function StructuredData() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Hoponai',
      url: 'https://hoponai.com',
      applicationCategory: 'BusinessApplication',
      description: 'AI-powered interactive training platform for employee onboarding, continuous training, and SOP compliance.',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '12',
        offerCount: '3',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Hoponai',
      url: 'https://hoponai.com',
      description: 'AI-powered interactive training platform.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Hoponai',
      url: 'https://hoponai.com',
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <StructuredData />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}