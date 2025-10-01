import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppChatButton from "../components/WhatsAppChatButton";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Matches your CSS variable
  display: 'swap',
});

// Removed unused Playfair_Display font to eliminate lint warning.

export const metadata: Metadata = {
  title: "Solo YoloS - Offbeat Journeys for the Modern Explorer",
  description: "Curated travel experiences to unconventional destinations. Join a community of passionate travelers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} antialiased bg-[#0f172a] text-slate-100`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
        }}
      >
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <WhatsAppChatButton />
      </body>
    </html>
  );
}