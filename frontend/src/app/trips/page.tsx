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
    <div className="bg-gradient-to-br from-gray-50 to-teal-50 min-h-screen">
      {/* Hero Section with Animation */}
      <header className="relative bg-gradient-to-br from-teal-900 via-teal-700 to-amber-600 text-white py-24 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-amber-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">All Our Expeditions</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              Discover extraordinary journeys that will take you beyond the beaten path. 
              Each adventure is carefully crafted to create unforgettable memories.
            </p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-6 py-20">
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, index) => (
              <div 
                key={trip.id} 
                className="animate-fade-in-up hover-lift"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Adventures Coming Soon</h2>
              <p className="text-gray-600 leading-relaxed">
                We're crafting amazing new experiences for you. Check back soon for incredible journeys that await!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}