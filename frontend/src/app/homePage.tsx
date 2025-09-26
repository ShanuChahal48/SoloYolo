import React from 'react';

// Sections for the homepage will be imported here later
// import HeroSection from '@/components/HeroSection';
// import FeaturedTrips from '@/components/FeaturedTrips';
// import Testimonials from '@/components/Testimonials';

export default function HomePage() {
  return (
    <div>
      {/* Placeholder for the Hero Section */}
      <section className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Soumil Travels
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Journeys Beyond the Ordinary.
          </p>
        </div>
      </section>

      {/* Placeholder for other sections */}
      <div className="py-20 text-center text-lg">
        <p>Featured Trips, About Us, and Testimonials sections will be built here.</p>
      </div>
    </div>
  );
}