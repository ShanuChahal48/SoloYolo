import { fetchApi } from '@/lib/api';
import { Trip } from '../../types/index';
import TripCard from '../../components/TripCard';

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
    <div className="bg-gray-100">
      <header className="bg-gray-800 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">All Our Expeditions</h1>
        <p className="mt-4 text-lg text-gray-300">Find your next adventure among our curated list of offbeat journeys.</p>
      </header>
      
      <div className="container mx-auto px-6 py-16">
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700">No trips available right now.</h2>
            <p className="text-gray-500 mt-2">Please check back later for new and exciting adventures!</p>
          </div>
        )}
      </div>
    </div>
  );
}