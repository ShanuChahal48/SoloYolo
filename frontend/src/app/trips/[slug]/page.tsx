
// Ensure getTripBySlug is exported from '@/lib/api'
import { getTripBySlug } from '@/lib/api';
import { } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BookingButton from '@/components/BookingButton';
import { resolveServerSideBookingLink } from '@/lib/logoutWorld';
import React from 'react';


const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const getStrapiImageUrl = (
  mediaObject:
    | { url?: string; formats?: Record<string, { url?: string }> }
    | { data?: { attributes?: { url?: string; formats?: Record<string, { url?: string }> } } }
    | { attributes?: { url?: string; formats?: Record<string, { url?: string }> } }
    | undefined,
  format: 'large' | 'medium' | 'small' | 'thumbnail' = 'large'
) => {
  if (!mediaObject) return '';

  let url = '';

  // Direct url
  if ('url' in mediaObject && mediaObject.url) {
    url = mediaObject.url;
  }
  // Nested data.attributes
  else if ('data' in mediaObject && mediaObject.data?.attributes?.url) {
    url = mediaObject.data.attributes.url;
  }
  // Direct attributes
  else if ('attributes' in mediaObject && mediaObject.attributes?.url) {
    url = mediaObject.attributes.url;
  }

  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
};

// Strapi trip attribute shape (extend as needed)
interface TripAttributes {
  title: string;
  price: number;
  duration: string;
  category?: string;
  itinerary?: unknown;
  featured_image?: any; // Strapi upload media object
  gallery?: any;
  slug?: string;
  booking_url?: string | null;
  booking_url_verified?: boolean;
}

type TripEntity = { id: number; attributes: TripAttributes } | (TripAttributes & { id?: number });

export default async function TripDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  // Extract attributes whether Strapi returned nested or flattened structure
  const rawAttributes: TripAttributes = (trip as TripEntity && 'attributes' in (trip as any))
    ? (trip as any).attributes
    : (trip as TripAttributes);

  const { title, price, duration, category, itinerary, featured_image, gallery, slug: internalTripSlug, booking_url, booking_url_verified } = rawAttributes;

  // Prefer confirmed booking URL if verified
  const confirmedBookingUrl: string | undefined = booking_url || undefined;
  const confirmedVerified: boolean = !!booking_url_verified;

  // Server-side booking link resolution (HEAD validates & may fallback) for SEO and structured data.
  const bookingLink = confirmedBookingUrl && confirmedVerified
    ? { primary: confirmedBookingUrl, fallback: confirmedBookingUrl, usingFallback: false, validated: true }
    : await resolveServerSideBookingLink({ title, internalSlug: internalTripSlug });

  // Render itinerary blocks as paragraphs
  type RichTextBlock = { type: 'paragraph'; children?: { text: string }[] };
  const itineraryBlocks: RichTextBlock[] = Array.isArray(itinerary)
    ? itinerary as RichTextBlock[]
    : typeof itinerary === 'string'
    ? [{ type: 'paragraph', children: [{ text: itinerary }] }]
    : [];

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
      {/* Hero Section with Featured Image */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {getStrapiImageUrl(featured_image) ? (
          <Image
            src={getStrapiImageUrl(featured_image)}
            alt={featured_image?.data?.attributes?.alternativeText || title}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
            className="transform scale-105 transition-transform duration-700 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-amber-500 flex items-center justify-center text-white">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4">{title}</h1>
              <p className="text-xl">Adventure Awaits</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Floating Title */}
        <div className="absolute inset-0 flex items-end justify-center pb-16">
          <div className="text-center text-white animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-lg">{title}</h1>
            <div className="flex items-center justify-center space-x-6 text-teal-200">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-lg font-medium">{duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-lg font-medium">{category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Itinerary */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in-up"
              style={{
                background: 'linear-gradient(180deg, rgba(30,64,175,0.18) 0%, rgba(15,23,42,0.85) 100%)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '100px 100px',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                color: '#f1f5f9',
              }}
            >
              <h2 className="text-4xl font-bold text-slate-100 mb-8">Trip Itinerary</h2>
              {/* Render the HTML from markdown */}
              <article className="prose lg:prose-xl max-w-none prose-headings:text-slate-100 prose-p:text-slate-200 prose-a:text-cyan-400 prose-strong:text-white prose-blockquote:text-slate-300 prose-code:text-cyan-300 prose-pre:bg-slate-900">
                {itineraryBlocks.map((block, idx) => {
                  if (block.type === 'paragraph' && block.children) {
                    const text = block.children.map((child) => child.text).join(' ');
                    if (text.trim()) {
                      return (
                        <div key={idx} className="mb-6 p-6 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <p className="text-lg text-gray-700 leading-relaxed m-0">
                            {text}
                          </p>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </article>
            </div>
          </div>

          {/* Sidebar: Booking & Details */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-8 rounded-2xl shadow-xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-teal-700 mb-2">
                  ₹{price.toLocaleString('en-IN')}
                  <span className="text-lg font-normal text-gray-600 block">per person</span>
                </h3>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center p-4 bg-teal-50 rounded-xl">
                  <div className="p-3 bg-teal-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Duration</p>
                    <p className="text-gray-600">{duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-amber-50 rounded-xl">
                  <div className="p-3 bg-amber-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Category</p>
                    <p className="text-gray-600">{category}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Pass through original title/slug for client analytic event; server prevalidated link used for SEO in JSON-LD */}
                <BookingButton title={title} internalSlug={internalTripSlug} directUrl={confirmedBookingUrl} />
                <button className="w-full bg-gray-100 text-gray-800 font-bold py-4 px-6 rounded-xl text-lg hover:bg-gray-200 transition-all duration-300 hover-lift">
                  Enquire
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Gallery Section */}
        {gallery && Array.isArray(gallery) && gallery.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-slate-100 mb-4 drop-shadow">Trip Gallery</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Explore the beautiful moments and stunning locations from this amazing journey.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map((img: { id: number; alternativeText?: string; url?: string; formats?: Record<string, { url?: string }> }, index) => {
                const imageUrl = getStrapiImageUrl(img, 'small');
                return (
                  <div 
                    key={img.id} 
                    className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-up group"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={img.alternativeText || 'Trip gallery image'}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* JSON-LD Structured Data for Trip / Offer including external booking URL */}
      <script
        type="application/ld+json"
        // We intentionally keep this minimal; can be extended with geo, organizer, etc.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Trip',
            name: title,
            description: `${title} – ${category || 'Travel Experience'}`,
            offers: {
              '@type': 'Offer',
              price: typeof price === 'number' ? price : undefined,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              url: bookingLink.primary,
            },
            provider: {
              '@type': 'Organization',
              name: 'Solo Yolo',
              url: 'https://logout.world/tours/hosts/solo-yolo/'
            }
          })
        }}
      />
  </main>
  );
}