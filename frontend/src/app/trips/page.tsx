import { getTrips, searchTrips } from '@/lib/api';
import type { Metadata } from 'next';
import { siteDefaults, absoluteUrl } from '@/lib/seo';
import { Trip } from '../../types/index';
import TripCard from '../../components/TripCard';
import FilterChips from '../../components/FilterChips';
import Image from 'next/image';
import HeroSearch from '@/components/HeroSearch';


export default async function TripsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const params = searchParams || {};
  const destination = typeof params.destination === 'string' ? params.destination : undefined;
  const from = typeof params.from === 'string' ? params.from : undefined;
  const to = typeof params.to === 'string' ? params.to : undefined;
  const guests = typeof params.guests === 'string' ? parseInt(params.guests, 10) : undefined;

  const hasFilters = Boolean(destination || from || to || guests);
  const trips: Trip[] = hasFilters
    ? await searchTrips({ destination, from, to, guests })
    : await getTrips();

  // Client-side guard to enforce AND logic for date range and destination
  const hasDateFilters = Boolean(from || to);
  const hasDestination = Boolean(destination);
  const hasGuests = typeof guests === 'number' && !Number.isNaN(guests);
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;
  const needle = destination?.toLowerCase() || '';

  const filteredTrips: Trip[] = (trips as any[]).filter((t: any) => {
    let ok = true;
    const title = (t?.title || '').toString().toLowerCase();
    const dest = (t?.destination || '').toString().toLowerCase();
    const cap = typeof t?.capacity === 'number' ? t.capacity : undefined;
    const sDate = t?.start_date ? new Date(t.start_date) : null;

    if (hasDateFilters) {
      if (!sDate || Number.isNaN(sDate.getTime())) return false;
      if (fromDate && sDate < fromDate) ok = false;
      if (toDate && sDate > toDate) ok = false;
    }
    if (hasDestination) {
      if (!(title.includes(needle) || dest.includes(needle))) ok = false;
    }
    if (hasGuests && typeof cap === 'number') {
      if (cap < (guests as number)) ok = false;
    }
    return ok;
  });

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
      {/* Header Image with refined (brighter) contrast overlay */}
      {/* Hero matching homepage height */}
      <div className="relative w-full h-screen overflow-hidden">
        <Image
          src="/carvan.jpg"
          alt="Caravan road trip"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center select-none"
        />
        {/* Soft gradient for legibility without dulling image */}
        <div className="absolute inset-0" style={{background:'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.65) 100%)'}} aria-hidden="true" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              All Our Expeditions
            </h1>
            <p className="mx-auto max-w-3xl text-sm sm:text-lg md:text-xl font-medium leading-relaxed text-white/95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)]">
              Discover extraordinary journeys that will take you beyond the beaten path. Each adventure is carefully crafted to create unforgettable memories.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <span className="inline-block rounded-full bg-black/40 px-5 py-2 text-xs sm:text-sm md:text-base text-white font-semibold backdrop-blur-[2px] ring-1 ring-white/25">
                Curated • Immersive • Unforgettable
              </span>
            </div>
          </div>
        </div>

        {/* Anchored search near the bottom of the trips hero */}
        <div className="absolute left-0 right-0 bottom-24 sm:bottom-28 md:bottom-32 lg:bottom-36 z-30 px-4">
          <div className="max-w-6xl mx-auto">
            <HeroSearch />
          </div>
        </div>

        {/* Mountain divider like homepage */}
        <div className="absolute left-0 right-0 bottom-0 w-full overflow-visible pointer-events-none" style={{lineHeight:0}}>
          <Image
            src="/mountain-divider.svg"
            alt="Section divider"
            width={1920}
            height={200}
            className="w-full h-auto block"
            priority
          />
        </div>
      </div>
      
    {/* Gap between header image and filters */}
    <div className="w-full" style={{ height: '24px' }}></div>
    <FilterChips resultsCount={filteredTrips.length} />
    <div className="w-full" style={{ height: '16px' }}></div>

      {/* Featured (Events & Trip) section on top of waterfall image */}
      <div className="relative w-full pb-12">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src="/waterfall1.jpg"
            alt="Waterfall scenic backdrop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 brightness-[0.85]"
          />
        </div>
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 z-10" style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.85) 100%)'}} />
        <div className="relative z-20">
  <div className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-24 md:pt-32">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-8 sm:mb-12 tracking-wide drop-shadow-lg text-center">
            Events &amp; Trip
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTrips.filter((trip: Trip) => trip.is_featured).map((trip: Trip, index: number) => (
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
  {filteredTrips.filter((trip: Trip) => !trip.is_featured).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTrips.filter((trip: Trip) => !trip.is_featured).map((trip: Trip, index: number) => (
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
              <h2 className="text-2xl font-semibold text-slate-100 mb-4">No trips match your filters</h2>
              <p className="text-slate-300 leading-relaxed">Try adjusting destination, dates, or guests to see more options.</p>
            </div>
          </div>
        )}
      </div>
  </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { name: SITE_NAME } = siteDefaults();
  const title = `All Trips | ${SITE_NAME}`;
  const desc = 'Browse curated expeditions and upcoming adventures across offbeat destinations.';
  return {
    title,
    description: desc,
    alternates: { canonical: '/trips' },
    openGraph: { title, description: desc, url: '/trips', images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}