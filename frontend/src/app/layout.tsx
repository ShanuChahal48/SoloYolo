import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google';
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Matches your CSS variable
  display: 'swap',
});

// const playfairDisplay = Playfair_Display({
//   subsets: ['latin'],
//   variable: '--font-serif', // Matches your CSS variable
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: "Soumil Travels - Offbeat Journeys for the Modern Explorer",
  description: "Curated travel experiences to unconventional destinations. Join a community of passionate travelers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-white text-gray-800 antialiased`}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}