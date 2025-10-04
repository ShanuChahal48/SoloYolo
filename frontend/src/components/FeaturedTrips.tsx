import { fetchApi } from '@/lib/api';
import { Trip } from '@/types';
import TripCard from './TripCard';

async function getFeaturedTrips() {
  const query = {
    filters: {
      is_featured: {
        $eq: true,
      },
    },
    populate: ['featured_image'],
    pagination: {
        limit: 3,
    }
  };
  const res = await fetchApi('/trips', query);
  
  if (!res?.data) {
    return [];
  }
  
  return res.data as Trip[];
}

export default async function FeaturedTrips() {
  const featuredTrips = await getFeaturedTrips();

  if (featuredTrips.length === 0) {
    return null; // Don't render the section if there are no featured trips
  }

  return (
  <section className="relative bg-transparent py-24 overflow-hidden">
      {/* Background Elements */}
      {/* Remove light background elements for dark mode */}
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16" data-reveal-group>
          <h2 className="text-responsive-2xl font-serif font-bold text-white mb-6" data-reveal="fade-up">
            Featured Trips
          </h2>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed" data-reveal="fade-up" data-reveal-delay="120">
            Hand-picked journeys that you won&apos;t want to miss.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-reveal-group>
          {featuredTrips.map((trip, index) => (
            <div key={trip.id} data-reveal="fade-up" data-reveal-delay={(index * 120).toString()} className="hover-lift">
              <TripCard trip={trip} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}