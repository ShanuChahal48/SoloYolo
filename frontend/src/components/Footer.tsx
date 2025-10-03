import React from 'react';
import Link from 'next/link';
import { getFooterSettings } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';

// Force this component (and any page/layout rendering it) to be dynamic so
// footer data is always fetched at request time, avoiding stale or missing
// values on otherwise static routes like /about and /trips.
export const dynamic = 'force-dynamic';
export const revalidate = 0; // explicit clarity; no ISR caching

interface FooterProps { data?: any }

export default async function Footer({ data }: FooterProps) {
  let footer = data;
  if (!footer) {
    try {
      footer = await getFooterSettings();
    } catch (e) {
      console.error('[Footer] Failed to fetch footer settings:', e);
    }
  }
  const attrs = footer?.attributes || footer;
  const bgMedia = attrs?.background_image?.data || attrs?.background_image;
  const bgUrl = getMediaUrl(bgMedia) || '/forest_footer.jpg';

  const quickLinks: { label: string; href: string }[] = [
    { label: 'About Us', href: '/about' },
    { label: 'Our Trips', href: '/trips' },
    { label: 'Community', href: '/community' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const social = [
    { name: 'Instagram', href: attrs?.instagram_url || '#', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z' },
    { name: 'Facebook', href: attrs?.facebook_url || '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'YouTube', href: attrs?.youtube_url || '#', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
  ];

  return (
    <footer className="relative text-white overflow-hidden" style={{
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '400px',
    }}>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-teal-900/80 pointer-events-none"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 flex flex-col justify-center items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 text-center md:text-left">
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start justify-center h-full">
            <h3 className="text-3xl font-extrabold gradient-text mb-4">{attrs?.company_name || 'Solo Yolo'}</h3>
            <p className="text-gray-200 mb-6 leading-relaxed max-w-xs">
              {attrs?.tagline || 'Crafting unforgettable journeys beyond the beaten path. Your adventure starts here.'}
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              {social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-teal-600/30 rounded-full flex items-center justify-center hover:bg-teal-600/60 transition-all duration-300 hover:scale-110 shadow-lg"
                  aria-label={social.name}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start justify-center h-full">
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-teal-400 transition-all duration-300 hover:translate-x-1 inline-block font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start justify-center h-full">
            <h3 className="text-lg font-semibold mb-6 text-white">Get In Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-teal-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-200">{attrs?.email || 'soloyoloindia@gmail.com'}</p>
                  <p className="text-sm text-gray-300">We'll respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-teal-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-gray-200">{attrs?.phone || '+1 (555) 123-4567'}</p>
                  <p className="text-sm text-gray-300">Mon-Fri 9AM-6PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-700 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 w-full">
            <p className="text-gray-300 text-center md:text-left">
              &copy; {new Date().getFullYear()} {attrs?.company_name || 'SoloYolo'}. All Rights Reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-teal-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-300 hover:text-teal-400 transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};