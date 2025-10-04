import React from 'react';
import Link from 'next/link';
import { getFooterSettings } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';

// Footer now uses ISR via getFooterSettings (see api.ts) so we don't need to force dynamic.

interface StrapiMediaLike { url?: string; alternativeText?: string }

interface FooterAttributes {
  company_name?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  background_image?: { data?: unknown } | null;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
}

interface FooterEntity { id?: number; attributes?: FooterAttributes }

interface FooterProps { data?: FooterEntity | FooterAttributes | null }

export default async function Footer({ data }: FooterProps) {
  let footer = data;
  if (!footer) {
    try {
      footer = await getFooterSettings();
    } catch (e) {
      console.error('[Footer] Failed to fetch footer settings:', e);
    }
  }
  const attrs: FooterAttributes = (footer && typeof footer === 'object' && 'attributes' in footer)
    ? (footer as FooterEntity).attributes || {}
    : (footer as FooterAttributes) || {};
  const rawBg = attrs?.background_image;
  const bgMedia: StrapiMediaLike | undefined = rawBg && typeof rawBg === 'object' && 'data' in rawBg
    ? (rawBg as { data?: StrapiMediaLike | undefined }).data
    : (rawBg as StrapiMediaLike | null | undefined) || undefined;
  const bgUrl = getMediaUrl(bgMedia) || '/forest_footer.jpg';

  const quickLinks: { label: string; href: string }[] = [
    { label: 'About Us', href: '/about' },
    { label: 'Our Trips', href: '/trips' },
    { label: 'Community', href: '/community' },
    { label: 'Contact Us', href: '/contact' },
  ];

  const social = [
    // Instagram brand glyph (camera + circle) simplified for 24x24 viewBox
    { name: 'Instagram', href: attrs?.instagram_url || '#', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.324 3.608.059 1.266.07 1.646.07 4.85s-.011 3.584-.07 4.85c-.061 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.263-3.608 1.324-1.266.059-1.646.07-4.85.07s-3.584-.011-4.85-.07c-1.366-.061-2.633-.35-3.608-1.324-.975-.975-1.263-2.242-1.324-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.324C8.416 2.175 8.796 2.163 12 2.163Zm0 1.687c-3.17 0-3.552.012-4.805.07-1.042.049-1.61.218-1.986.363-.5.194-.86.426-1.237.803-.377.377-.608.737-.803 1.237-.145.376-.314.944-.363 1.986-.058 1.253-.07 1.635-.07 4.805s.012 3.552.07 4.805c.049 1.042.218 1.61.363 1.986.194.5.426.86.803 1.237.377.377.737.608 1.237.803.376.145.944.314 1.986.363 1.253.058 1.635.07 4.805.07s3.552-.012 4.805-.07c1.042-.049 1.61-.218 1.986-.363.5-.194.86-.426 1.237-.803.377-.377.608-.737.803-1.237.145-.376.314-.944.363-1.986.058-1.253.07-1.635.07-4.805s-.012-3.552-.07-4.805c-.049-1.042-.218-1.61-.363-1.986-.194-.5-.426-.86-.803-1.237-.377-.377-.737-.608-1.237-.803-.376-.145-.944-.314-1.986-.363-1.253-.058-1.635-.07-4.805-.07Zm0 3.89a5.26 5.26 0 1 1 0 10.52 5.26 5.26 0 0 1 0-10.52Zm0 8.673a3.413 3.413 0 1 0 0-6.826 3.413 3.413 0 0 0 0 6.826Zm5.406-9.87a1.23 1.23 0 1 1 0-2.46 1.23 1.23 0 0 1 0 2.46Z' },
    // Facebook brand F
    { name: 'Facebook', href: attrs?.facebook_url || '#', icon: 'M22.675 0H1.325A1.326 1.326 0 0 0 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.41c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.765v2.316h3.59l-.467 3.622h-3.123V24h6.116A1.326 1.326 0 0 0 24 22.676V1.325A1.326 1.326 0 0 0 22.675 0Z' },
    // YouTube play button
    { name: 'YouTube', href: attrs?.youtube_url || '#', icon: 'M23.499 6.203a2.974 2.974 0 0 0-2.09-2.103C19.691 3.5 12 3.5 12 3.5s-7.691 0-9.41.6A2.974 2.974 0 0 0 .5 6.203 31.533 31.533 0 0 0 0 12a31.533 31.533 0 0 0 .5 5.797 2.974 2.974 0 0 0 2.09 2.103c1.719.6 9.41.6 9.41.6s7.691 0 9.41-.6a2.974 2.974 0 0 0 2.09-2.103A31.533 31.533 0 0 0 24 12a31.533 31.533 0 0 0-.501-5.797ZM9.75 15.02V8.98L15.818 12 9.75 15.02Z' }
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
          <div className="flex flex-col items-center md:items-start justify-center h-full" data-reveal="fade-up">
            <h3 className="text-3xl font-extrabold gradient-text mb-4">{attrs?.company_name || 'Solo Yolo'}</h3>
            <p className="text-gray-200 mb-6 leading-relaxed max-w-xs">
              {attrs?.tagline || 'Crafting unforgettable journeys beyond the beaten path. Your adventure starts here.'}
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              {social.map((social) => {
                const external = social.href && social.href !== '#';
                return (
                  <a
                    key={social.name}
                    href={social.href || '#'}
                    className="w-10 h-10 bg-teal-600/30 rounded-full flex items-center justify-center hover:bg-teal-600/60 transition-all duration-300 hover:scale-110 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                    aria-label={social.name}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    title={social.name}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={social.icon} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start justify-center h-full" data-reveal="fade-up" data-reveal-delay="140">
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
          <div className="flex flex-col items-center md:items-start justify-center h-full" data-reveal="fade-up" data-reveal-delay="260">
            <h3 className="text-lg font-semibold mb-6 text-white">Get In Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-teal-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-200">{attrs?.email || 'soloyoloindia@gmail.com'}</p>
                  <p className="text-sm text-gray-300">We&apos;ll respond within 24 hours</p>
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