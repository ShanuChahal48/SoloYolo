import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Soumil Travels</h3>
            <p className="text-gray-400">Crafting unforgettable journeys beyond the beaten path.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/trips" className="hover:text-teal-400 transition-colors">Trips</Link></li>
              <li><Link href="/community" className="hover:text-teal-400 transition-colors">Community</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            {/* Social media icons will go here */}
            <p className="text-gray-400">social@soumiltravels.com</p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Soumil Travels. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;