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
    <section className="relative bg-gradient-to-br from-white to-teal-50 py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-200/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-amber-200/20 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-teal-300/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-responsive-2xl font-serif font-bold text-gray-800 mb-6">
            Featured Trips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hand-picked journeys that you won&apos;t want to miss.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map((trip, index) => (
            <div 
              key={trip.id} 
              className="animate-fade-in-up hover-lift"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <TripCard trip={trip} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}