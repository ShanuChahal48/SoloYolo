"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink { name: string; href: string; }

const NAV_LINKS: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Trips', href: '/trips' },
  { name: 'About Us', href: '/about' },
  { name: 'Community', href: '/community' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // hydration-safe: only affects data attribute

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Consider scrolled after 32px for earlier subtle effect
      setScrolled(prev => (prev === (y > 32) ? prev : y > 32));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent transition-all duration-500" data-header-scrolled={scrolled ? 'true' : 'false'}>
      <nav className="relative container mx-auto flex items-center justify-between px-4 sm:px-6 py-5">
        {/* Brand */}
        <Link href="/" aria-label="Solo Yolo Home" className="text-2xl font-bold tracking-tight text-white transition-transform duration-300 hover:scale-[1.04]">
          Solo Yolo
        </Link>

        {/* Desktop Nav (centered, content-width pill) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul
            role="menubar"
            className="inline-flex gap-1 md:gap-1.5 lg:gap-2 px-2.5 md:px-3 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-500"
            data-nav-pill
          >
            {NAV_LINKS.map(l => (
              <li key={l.href} role="none">
                <Link
                  href={l.href}
                  role="menuitem"
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={
                    'relative px-3 md:px-3.5 lg:px-4 py-1.5 md:py-2 rounded-full text-[13px] md:text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ' +
                    (isActive(l.href)
                      ? 'bg-gradient-to-r from-emerald-500/70 to-teal-500/70 text-white shadow ring-1 ring-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/10')
                  }
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-white transition-colors duration-300 hover:bg-white/20"
          aria-label="Toggle mobile menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <svg className={'h-6 w-6 transition-transform duration-300 ' + (open ? 'rotate-90' : '')} viewBox="0 0 24 24" stroke="currentColor" fill="none">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={'lg:hidden overflow-hidden transition-all duration-400 ' + (open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')}>
        <div className="backdrop-blur-xl border-t border-white/10 bg-black/40">
          <ul role="menu" className="container mx-auto px-4 py-4 space-y-2">
            {NAV_LINKS.map(l => (
              <li key={l.href} role="none">
                <Link
                  href={l.href}
                  role="menuitem"
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={
                    'block rounded-xl py-3 px-4 font-medium transition-all duration-300 ' +
                    (isActive(l.href)
                      ? 'bg-emerald-500/70 text-white shadow'
                      : 'text-white/80 hover:text-white hover:bg-white/10')
                  }
                  onClick={() => setOpen(false)}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}