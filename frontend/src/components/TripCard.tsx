import Link from 'next/link';
import Image from 'next/image';
import { Trip } from '@/types';
import { getMediaUrl, extractMediaAttributes, StrapiMedia } from '@/lib/media';

interface TripCardProps {
  trip: Trip;
  index?: number; // for optional per-card delay composition if needed later
}

// STRAPI_URL not needed directly; media helpers build absolute URLs.

export default function TripCard({ trip }: TripCardProps) {
  if (!trip) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
        Invalid trip data
      </div>
    );
  }
  const { title, slug, price, duration, excerpt, featured_image, category } = trip;
  
  let media: StrapiMedia | undefined;
  if (featured_image?.data) {
    const alt = featured_image.data.alternativeText || undefined;
    media = { data: { id: featured_image.data.id, attributes: { url: featured_image.data.url, alternativeText: alt } } };
  } else if (featured_image?.url) {
    media = { url: featured_image.url };
  }
  const imageUrl = getMediaUrl(media);
  const mediaAttrs = extractMediaAttributes(media);

  return (
  <Link href={`/trips/${slug}`} className="group block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-black/60 hover-lift backdrop-blur-sm" data-reveal="fade-up">
  <div className="relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={mediaAttrs?.alternativeText || title}
            width={400}
            height={300}
            sizes="400px"
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white py-2 px-4 rounded-full font-semibold text-sm shadow-lg">
          {duration}
        </div>
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-cyan-200 py-1 px-3 rounded-full font-medium text-sm">
          {category}
        </div>
        {/* Start Date (if available) */}
        {trip.start_date && (
          <div className="absolute bottom-4 left-4 bg-white/90 text-slate-900 py-1 px-3 rounded-full font-semibold text-xs shadow">
            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-200 mb-6 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-cyan-300">
              ₹{price?.toLocaleString?.('en-IN')}
            </p>
            <p className="text-sm text-slate-400">per person</p>
          </div>
          <div className="flex items-center text-cyan-200 font-semibold group-hover:text-cyan-300 transition-colors duration-300">
            <span className="mr-2">Explore</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}