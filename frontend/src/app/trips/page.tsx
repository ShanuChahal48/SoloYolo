import { fetchApi } from '@/lib/api';
import { Trip } from '../../types/index';
import TripCard from '../../components/TripCard';
import Image from 'next/image';

async function getTrips() {
  const query = {
    populate: ['featured_image'],
    sort: ['createdAt:desc'],
  };
  const res = await fetchApi('/trips', query);
  
  if (!res?.data) {
    return [];
  }
  
  return res.data as Trip[];
}

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <main
      className="overflow-hidden relative min-h-screen"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url('/galaxy.svg'), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat, repeat',
        backgroundSize: 'cover, 100px 100px',
        backgroundAttachment: 'fixed, fixed',
        backgroundPosition: 'center, center',
      }}
    >
      {/* Header Image with Overlayed Title and Description */}
      <div className="relative w-full bg-black">
        <div className="w-full h-[220px] sm:h-[320px] md:h-[400px] lg:h-[480px] xl:h-[560px] 2xl:h-[640px] relative flex items-center justify-center">
          <Image
            src="/desktop.adapt.1920.high.webp"
            alt="Trips Header"
            fill
            style={{ objectFit: 'cover', zIndex: 1 }}
            className="absolute inset-0 w-full h-full"
            sizes="100vw"
          />
          {/* Overlay with title and description inside the image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 sm:px-4 pt-20 sm:pt-24 md:pt-28 lg:pt-32" style={{ zIndex: 2 }}>
            <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl p-3 sm:p-6 md:p-10 mx-auto">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-5 text-white">All Our Expeditions</h1>
              <p className="text-xs sm:text-base md:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
                Discover extraordinary journeys that will take you beyond the beaten path.<br />
                Each adventure is carefully crafted to create unforgettable memories.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gap between header image and waterfall1 section */}
  <div className="w-full" style={{ height: '40px' }}></div>

      {/* First three trip cards above waterfall1.jpg, no mask */}
      <div className="relative w-full pb-12">
        {/* Blue overlay for visual consistency with homepage */}
        <div className="absolute inset-0 z-0" style={{background: 'linear-gradient(180deg, rgba(30,64,175,0.18) 0%, rgba(15,23,42,0.85) 100%)'}}></div>
        <div className="relative z-10">
  <div className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-24 md:pt-32">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-8 sm:mb-12 tracking-wide drop-shadow-lg text-center" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>Events &amp; Trip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.filter(trip => trip.is_featured).map((trip, index) => (
              <div 
                key={trip.id} 
                className="animate-fade-in-up flex"
                style={{animationDelay: `${index * 0.1}s`} }
              >
                <div className="w-full max-w-md mx-auto flex flex-col">
                  <TripCard trip={trip} />
                </div>
              </div>
            ))}
          </div>
  </div>
  </div>
      </div>

      {/* Upcoming Trips section below forest image */}
      <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-20">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 text-center">Upcoming Trips</h2>
        {trips.filter(trip => !trip.is_featured).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.filter(trip => !trip.is_featured).map((trip, index) => (
              <div 
                key={trip.id} 
                className="animate-fade-in-up flex"
                style={{animationDelay: `${index * 0.1}s`} }
              >
                <div className="w-full max-w-md mx-auto flex flex-col">
                  <TripCard trip={trip} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in-up">
            <div
              className="rounded-2xl shadow-xl p-12 max-w-md mx-auto"
              style={{
                backgroundColor: '#0f172a',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '100px 100px',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                color: '#f1f5f9',
              }}
            >
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">Adventures Coming Soon</h2>
              <p className="text-slate-300 leading-relaxed">
                We&apos;re crafting amazing new experiences for you. Check back soon for incredible journeys that await!
              </p>
            </div>
          </div>
        )}
      </div>
  </main>
  );
}