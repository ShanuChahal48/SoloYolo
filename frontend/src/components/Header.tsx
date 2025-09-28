"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Trips', href: '/trips' },
    { name: 'About Us', href: '/about' },
    { name: 'Community', href: '/community' },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);
      
      // Debounce the scroll event
      timeoutId = setTimeout(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Check if we're still in the hero section (first 80% of viewport height)
        const isInHeroSection = scrollY < (windowHeight * 0.8);
        
        // Only show background when we've scrolled past the hero section
        setIsScrolled(!isInHeroSection);
      }, 10); // Small debounce to prevent flickering
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
        <Link 
          href="/" 
          className={`text-2xl font-bold hover:scale-105 transition-all duration-300 ${
            isScrolled ? 'gradient-text' : 'text-white drop-shadow-lg'
          }`}
        >
          Solo Yolo
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                href={link.href} 
                  className={`relative transition-all duration-300 font-medium group ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-emerald-600' 
                      : 'text-white hover:text-emerald-200 drop-shadow-lg'
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                  isScrolled ? 'bg-emerald-600' : 'bg-emerald-200'
                }`}></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
            isScrolled 
              ? 'hover:bg-gray-100' 
              : 'hover:bg-white/20'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''} ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className={`backdrop-blur-lg border-t ${
          isScrolled 
            ? 'bg-white/95 border-gray-200' 
            : 'bg-black/20 border-white/20'
        }`}>
          <ul className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className={`block py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50' 
                      : 'text-white hover:text-emerald-200 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;