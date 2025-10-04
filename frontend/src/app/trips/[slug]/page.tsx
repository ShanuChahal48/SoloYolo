
// Ensure getTripBySlug is exported from '@/lib/api'
import { getTripBySlug } from '@/lib/api';
import type { Metadata } from 'next';
import { excerpt, absoluteUrl, siteDefaults } from '@/lib/seo';
import { } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
// Removed unused Link import
import BookingButton from '@/components/BookingButton';
import { resolveServerSideBookingLink } from '@/lib/logoutWorld';
import { getMediaUrl, getMediaAlt, StrapiMedia } from '@/lib/media';
import TripGalleryLightboxClient from '@/components/TripGalleryLightboxClient';
import TripEnquiry from '@/components/TripEnquiry';
import React from 'react';


// (Removed unused STRAPI_URL constant)

// Removed unused getStrapiImageUrl helper (replaced by getMediaUrl)

// Strapi trip attribute shape (extend as needed)
type ItineraryBlock = { type: string; children?: { text: string }[] };
type ItineraryValue = string | ItineraryBlock[] | null | undefined;

interface TripAttributes {
  title: string;
  price: number;
  duration: string;
  category?: string;
  itinerary?: ItineraryValue;
  featured_image?: StrapiMedia;
  gallery?: StrapiMedia[];
  slug?: string;
  booking_url?: string | null;
  booking_url_verified?: boolean;
  experience_highlights?: { label: string }[];
}

type TripEntity = { id: number; attributes: TripAttributes } | (TripAttributes & { id?: number });

function hasAttributes(entity: TripEntity | null | undefined): entity is { id: number; attributes: TripAttributes } {
  return !!entity && typeof entity === 'object' && 'attributes' in entity && typeof (entity as { attributes?: unknown }).attributes === 'object';
}

// Media helpers now imported from '@/lib/media'

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15: dynamic route params are async – must await before accessing properties
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  // Extract attributes whether Strapi returned nested or flattened structure
  const rawAttributes: TripAttributes = hasAttributes(trip as TripEntity)
    ? (trip as { attributes: TripAttributes }).attributes
    : (trip as TripAttributes);

  const { title, price, duration, category, itinerary, featured_image, gallery, slug: internalTripSlug, booking_url, booking_url_verified, experience_highlights } = rawAttributes;

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
        {getMediaUrl(featured_image) ? (
          <Image
            src={getMediaUrl(featured_image)}
            alt={getMediaAlt(featured_image, title)}
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
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg">{title}</h1>
            {Array.isArray(experience_highlights) && experience_highlights.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {experience_highlights.map((h, i) => (
                  <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium tracking-wide border border-white/20 text-teal-100">
                    {h.label}
                  </span>
                ))}
              </div>
            )}
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
                <TripEnquiry tripTitle={title} tripSlug={internalTripSlug} />
              </div>
            </div>
          </aside>
        </div>

        {/* Gallery Section with Lightbox */}
        {gallery && Array.isArray(gallery) && gallery.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-slate-100 mb-4 drop-shadow">Trip Gallery</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Explore the beautiful moments and stunning locations from this amazing journey.
              </p>
            </div>
            <TripGalleryLightboxClient
              images={gallery as StrapiMedia[]}
              gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              thumbClassName="animate-fade-in-up"
            />
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const trip = await getTripBySlug(params.slug);
  if (!trip) return { title: 'Trip Not Found', description: 'Requested trip does not exist.' };
  let raw: TripAttributes;
  if (hasAttributes(trip as TripEntity)) {
    raw = (trip as { attributes: TripAttributes }).attributes;
  } else {
    raw = trip as TripAttributes;
  }
  const { name: SITE_NAME } = siteDefaults();
  const title = raw.title ? `${raw.title} | ${SITE_NAME}` : `Trip | ${SITE_NAME}`;
  const desc = excerpt(raw.itinerary && typeof raw.itinerary === 'string' ? raw.itinerary : '', 160) || 'Adventure travel experience.';
  const canonical = `/trips/${params.slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}