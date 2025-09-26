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
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Featured Trips</h2>
          <p className="text-gray-600 mt-2">Hand-picked journeys that you won't want to miss.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </section>
  );
}