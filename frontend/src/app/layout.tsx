import type { Metadata } from "next";
import { orgJsonLd, websiteJsonLd, siteDefaults, absoluteUrl } from '@/lib/seo';
import { Inter } from 'next/font/google';
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getFooterSettings } from '@/lib/api';
import WhatsAppChatButton from "../components/WhatsAppChatButton";
import ScrollRevealProvider from "../components/ScrollRevealProvider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Matches your CSS variable
  display: 'swap',
});

// Removed unused Playfair_Display font to eliminate lint warning.

const { name: SITE_NAME, description: SITE_DESC } = siteDefaults();

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Offbeat Journeys for the Modern Explorer`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} – Curated Offbeat Travel Experiences`,
    description: SITE_DESC,
    url: '/',
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl('/home.jpg'),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} hero image`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} – Offbeat Journeys`,
    description: SITE_DESC,
    images: [absoluteUrl('/home.jpg')],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
// (Removed global dynamic/no-cache overrides to restore ISR & static optimization.)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Preload footer data once so each page render doesn't refetch it separately.
  const footerData = await getFooterSettings();
  // Use a single JSON-LD object with @graph instead of an array to avoid runtime parsers
  // that expect an object (was causing r["@context"].toLowerCase error when script content was an array)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      orgJsonLd(),
      websiteJsonLd(),
    ]
  } as const;
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} antialiased bg-[#0f172a] text-slate-100`}
        style={{
          backgroundImage: `url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E\")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        }}
      >
        <Header />
        <ScrollRevealProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <main>{children}</main>
        <Footer data={footerData} />
        <WhatsAppChatButton />
      </body>
    </html>
  );
}