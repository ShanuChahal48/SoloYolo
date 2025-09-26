import React from 'react';
import Link from 'next/link';

const Header = () => {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Trips', href: '/trips' },
    { name: 'About Us', href: '/about' },
    { name: 'Community', href: '/community' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-teal-700">
          Soumil Travels
        </Link>
        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="text-gray-600 hover:text-teal-600 transition-colors duration-300">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="md:hidden">
          {/* Mobile Menu Button Placeholder */}
          <button className="text-gray-600 hover:text-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;