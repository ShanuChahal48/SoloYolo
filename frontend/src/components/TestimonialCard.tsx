import Image from 'next/image';
import { StrapiMedia } from '@/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// Star SVG component for rating
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface TestimonialCardProps {
  testimonial: {
    attributes?: {
      traveler_name?: string;
      trip_taken?: string;
      quote?: string;
      rating?: number;
      picture?: {
        data?: StrapiMedia;
      };
    };
    traveler_name?: string;
    trip_taken?: string;
    quote?: string;
    rating?: number;
    picture?: {
      data?: StrapiMedia;
    };
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const src = (testimonial.attributes || testimonial) as {
    traveler_name?: string;
    trip_taken?: string;
    quote?: string;
    rating?: number;
    picture?: { data?: StrapiMedia };
  };
  const { traveler_name, trip_taken, quote, rating, picture } = src;
  const safeRating = typeof rating === 'number' ? rating : 0;
  const media = (picture as any)?.data?.attributes || (picture as any)?.attributes || (picture as any) || {};
  const rawUrl = media?.formats?.thumbnail?.url || media?.url || '';
  const imageUrl = rawUrl ? `${STRAPI_URL}${rawUrl}` : '';

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col h-full">
      <div className="flex items-center mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < safeRating} />
        ))}
      </div>
      <p className="text-gray-600 italic flex-grow">&quot;{quote}&quot;</p>
      <div className="mt-6 flex items-center">
        <div className="relative w-14 h-14 mr-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={traveler_name || ''}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200" />
          )}
        </div>
        <div>
          <p className="font-bold text-gray-900">{traveler_name}</p>
          <p className="text-sm text-gray-500">{trip_taken}</p>
        </div>
      </div>
    </div>
  );
}