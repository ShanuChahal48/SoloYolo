
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
import { getMediaUrl, getMediaAlt, getStrapiMediaUrl, StrapiMedia } from '@/lib/media';
import TripGalleryLightboxClient from '@/components/TripGalleryLightboxClient';
import TripEnquiry from '@/components/TripEnquiry';
import React from 'react';
import TripDetailsSectionsStacked from '@/components/TripDetailsSectionsStacked';


// (Removed unused STRAPI_URL constant)

// Removed unused getStrapiImageUrl helper (replaced by getMediaUrl)

// Strapi trip attribute shape (extend as needed)
type ItineraryBlock = { type: string; children?: { text: string }[] };
type ItineraryValue = string | ItineraryBlock[] | null | undefined;

type RteTextChild = { text?: string } | string;
type RteBlock = { type?: string; level?: number; children?: RteTextChild[] };

interface TripAttributes {
  title: string;
  price: number;
  duration: string;
  start_date?: string;
  category?: string;
  itinerary?: ItineraryValue;
  // Optional section fields – different Strapi envs may use different names
  overview?: unknown; // can be string or blocks
  excerpt?: string | null;
  inclusions?: string | string[] | null;
  inclusion?: string | string[] | null;
  included?: string | string[] | null;
  exclusions?: string | string[] | null;
  exclusion?: string | string[] | null;
  not_included?: string | string[] | null;
  other_info?: string | string[] | null;
  otherInfo?: string | string[] | null;
  must_carry?: string | string[] | null;
  travel_essentials?: string | string[] | null;
  gears?: string | string[] | null;
  clothes?: string | string[] | null;
  featured_image?: StrapiMedia;
  gallery?: StrapiMedia[];
  slug?: string;
  booking_url?: string | null;
  booking_url_verified?: boolean;
  experience_highlights?: { label: string }[];
  // Optional brochure PDF from Strapi (support a few likely keys)
  brochure?: StrapiMedia | null;
  brochure_pdf?: StrapiMedia | null;
  pdf?: StrapiMedia | null;
  // Day-based itinerary can vary
  days?: unknown;
  itinerary_days?: unknown;
  itineraryDays?: unknown;
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

  const { title, price, duration, start_date, category, itinerary, featured_image, gallery, slug: internalTripSlug, booking_url, booking_url_verified, experience_highlights } = rawAttributes;

  // Prefer confirmed booking URL if verified
  const confirmedBookingUrl: string | undefined = booking_url || undefined;
  const confirmedVerified: boolean = !!booking_url_verified;

  // Server-side booking link resolution (HEAD validates & may fallback) for SEO and structured data.
  const bookingLink = confirmedBookingUrl && confirmedVerified
    ? { primary: confirmedBookingUrl, fallback: confirmedBookingUrl, usingFallback: false, validated: true }
    : await resolveServerSideBookingLink({ title, internalSlug: internalTripSlug });

  // Render itinerary blocks as paragraphs
  type RichTextBlock = { type: 'paragraph'; children?: { text?: string }[] };
  const itineraryBlocks: RichTextBlock[] = Array.isArray(itinerary)
    ? (itinerary as unknown as RichTextBlock[])
    : typeof itinerary === 'string'
    ? [{ type: 'paragraph', children: [{ text: itinerary }] }]
    : [];

  // Helpers to extract plain text from rich text blocks and pick first available field
  const blocksToText = (blocks: ReadonlyArray<RichTextBlock>) =>
    (blocks || [])
      .map(b => (b?.children || []).map(c => c?.text || '').join(' ').trim())
      .filter(Boolean)
      .join('\n');

  const pickString = (...vals: Array<unknown>) => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };

  const pickStringOrLines = (...vals: Array<unknown>): string | string[] | undefined => {
    for (const v of vals) {
      if (!v) continue;
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (Array.isArray(v)) return v as string[];
    }
    return undefined;
  };

  // Overview: support blocks or string. Prefer 'overview' field, then 'excerpt', then first itinerary paragraph.
  const isBlock = (node: unknown): node is RteBlock => !!node && typeof node === 'object';
  const childText = (c: RteTextChild): string => (typeof c === 'string' ? c : (typeof c?.text === 'string' ? c.text : ''));
  const blockToLine = (b: RteBlock): string => Array.isArray(b.children) ? b.children.map(childText).join(' ') : '';
  const coerceBlocksText = (v: unknown): string | undefined => {
    if (!Array.isArray(v)) return undefined;
    const lines = (v as unknown[])
      .map((b) => (isBlock(b) ? blockToLine(b) : ''))
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.length ? lines.join('\n') : undefined;
  };
  const overviewRaw = ((rawAttributes as unknown) as Record<string, unknown>).overview;
  const overviewFromBlocks = coerceBlocksText(overviewRaw);
  const overviewText: string | undefined =
    (typeof rawAttributes.overview === 'string' ? rawAttributes.overview : undefined) ||
    overviewFromBlocks ||
    (typeof rawAttributes.excerpt === 'string' ? rawAttributes.excerpt : undefined) ||
    (itineraryBlocks.length ? (itineraryBlocks[0]?.children || []).map(c => c.text).join(' ').trim() : undefined);

  // Itinerary string: join rich blocks if present
  const itineraryText: string | undefined =
    typeof itinerary === 'string' ? itinerary : (itineraryBlocks.length ? blocksToText(itineraryBlocks) : undefined);

  // Inclusions / Exclusions: support blocks, strings or arrays. Pass raw so client can flatten rich text.
  const inclusionsVal: unknown = (rawAttributes.inclusions ?? rawAttributes.inclusion ?? rawAttributes.included) as unknown;
  const exclusionsVal: unknown = (rawAttributes.exclusions ?? rawAttributes.exclusion ?? rawAttributes.not_included) as unknown;

  // Day-based itinerary support: try common shapes
  type DayInput =
    | { title?: string; label?: string; heading?: string; summary?: string; description?: string; content?: string; points?: unknown }
    | { [k: string]: unknown };
  const anyAttrs = (rawAttributes as unknown) as Record<string, unknown>;
  const rawDays: unknown = anyAttrs.days || anyAttrs.itinerary_days || anyAttrs.itineraryDays;
  const normalizeDay = (d: DayInput) => {
    const label = pickString(d.label, d.title, d.heading) || 'Day';
    const summary = pickString(d.summary, d.description, d.content);
    const points = asLinesCompat(d.points);
    // Also try to extract lines from a long summary string
    const linesFromSummary = summary ? summary.split(/\r?\n|•|\u2022|\t|\*/g).map(s=>s.trim()).filter(Boolean) : [];
    const lines = points.length ? points : linesFromSummary;
    return { label, summary: lines === linesFromSummary ? undefined : summary, lines };
  };
  // helper compatible with client asLines
  const asLinesCompat = (v: unknown): string[] => {
    if (!v) return [];
    if (typeof v === 'string') return v.split(/\r?\n|•|\u2022|\t|\*/g).map(s=>s.trim()).filter(Boolean);
    if (Array.isArray(v)) return (v as unknown[]).map(x => (typeof x === 'string' ? x.trim() : (typeof (x as { text?: string })?.text === 'string' ? ((x as { text?: string }).text as string).trim() : ''))).filter(Boolean);
    if (typeof v === 'object' && v !== null && Array.isArray((v as { children?: unknown[] }).children)) {
      const children = ((v as { children?: unknown[] }).children || []) as RteTextChild[];
      return children.map(childText).map((s)=>s.trim()).filter(Boolean);
    }
    return [];
  };
  const itineraryDays = Array.isArray(rawDays) ? (rawDays as DayInput[]).map(normalizeDay) : undefined;

  // Other Info: combine various buckets if available
  const otherBuckets: Array<{title: string; value?: string | string[]}> = [
    { title: 'Must Carry', value: pickStringOrLines(rawAttributes.must_carry) },
    { title: 'Travel Essentials', value: pickStringOrLines(rawAttributes.travel_essentials) },
    { title: 'Gears', value: pickStringOrLines(rawAttributes.gears) },
    { title: 'Clothes', value: pickStringOrLines(rawAttributes.clothes) },
  ];
  const genericOtherRaw: unknown = (rawAttributes.otherInfo ?? rawAttributes.other_info) as unknown;
  const otherInfoLines: string[] = [];
  for (const b of otherBuckets) {
    const v = b.value;
    if (!v) continue;
    otherInfoLines.push(b.title + ':');
    if (Array.isArray(v)) {
      otherInfoLines.push(...(v.filter(Boolean) as string[]));
    } else {
      otherInfoLines.push(...v.split(/\r?\n|•|\u2022|\t|\*/g).map(s => s.trim()).filter(Boolean));
    }
  }
  if (genericOtherRaw) {
    if (typeof genericOtherRaw === 'string') {
      otherInfoLines.push(...genericOtherRaw.split(/\r?\n|•|\u2022|\t|\*/g).map(s => s.trim()).filter(Boolean));
    } else if (Array.isArray(genericOtherRaw)) {
      otherInfoLines.push(...(genericOtherRaw as string[]).filter(Boolean));
    } else if (typeof genericOtherRaw === 'object' && genericOtherRaw !== null && Array.isArray((genericOtherRaw as { children?: unknown[] }).children)) {
      // if it's blocks, coerce to lines
      const text = coerceBlocksText(genericOtherRaw);
      if (text) otherInfoLines.push(...text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean));
    }
  }

  // Try to resolve a brochure PDF URL (support string, direct url object, or full media object)
  let brochureUrl: string | undefined;
  const candidate: unknown = (rawAttributes.brochure_pdf ?? rawAttributes.brochure ?? rawAttributes.pdf) as unknown;
  const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
  const pickUrl = (rec?: Record<string, unknown>): string | undefined => {
    if (!rec) return undefined;
    const u = rec.url as unknown;
    return typeof u === 'string' ? u : undefined;
  };

  if (typeof candidate === 'string') {
    brochureUrl = candidate;
  } else if (isObj(candidate)) {
    // Shape: { url }
    brochureUrl = pickUrl(candidate) ? getStrapiMediaUrl(pickUrl(candidate)) : undefined;
    if (!brochureUrl && isObj((candidate as Record<string, unknown>).data)) {
      // Shape: { data: { attributes: { url } } } or { data: { url } }
      const dataObj = (candidate as Record<string, unknown>).data as Record<string, unknown>;
      brochureUrl = pickUrl(dataObj.attributes as Record<string, unknown>)
        || pickUrl(dataObj);
      if (brochureUrl) brochureUrl = getStrapiMediaUrl(brochureUrl);
    } else if (!brochureUrl && Array.isArray((candidate as Record<string, unknown>).data)) {
      // Shape: { data: [ { attributes: { url } } | { url } ] }
      const arr = (candidate as Record<string, unknown>).data as unknown[];
      if (arr.length > 0 && isObj(arr[0])) {
        const first = arr[0] as Record<string, unknown>;
        brochureUrl = pickUrl(first.attributes as Record<string, unknown>) || pickUrl(first);
        if (brochureUrl) brochureUrl = getStrapiMediaUrl(brochureUrl);
      }
    } else if (!brochureUrl) {
      // Fallback: try StrapiMedia helper
      brochureUrl = getMediaUrl(candidate as StrapiMedia);
    }
  }
  const effectiveSlug = (internalTripSlug || slug || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();
  if (!brochureUrl) {
    // Example mapping: Spiti → local brochure in public
    if (effectiveSlug.includes('spiti') || titleLower.includes('spiti')) {
      brochureUrl = encodeURI('/Winter Spiti.pdf');
    }
  }

  // Use the brochure URL as provided. The client PDF viewer will try original first
  // and only fall back to a /raw/upload variant if needed.
  const brochureEmbedUrl: string | undefined = brochureUrl;

  return (
    <main
      className="relative min-h-screen overflow-visible"
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
            <div className="flex items-center justify-center gap-4 flex-wrap text-teal-200">
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
              {!!brochureEmbedUrl && (
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 shadow-md ring-1 ring-cyan-300/60 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 20h14v-2H5v2zM12 2l-5 5h3v6h4V7h3l-5-5z"/></svg>
                  <span className="text-sm md:text-base">Download Itinerary</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto px-6 py-20 -mt-16 relative z-10 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Stacked sections (reference.mov style) */}
          <div className="lg:col-span-2">
            <TripDetailsSectionsStacked
              overview={Array.isArray(overviewRaw) ? (overviewRaw as unknown as RteBlock[]) : overviewText}
              highlights={experience_highlights}
              itinerary={itineraryText}
              itineraryDays={itineraryDays}
              inclusions={inclusionsVal as unknown as (string | string[] | RteBlock[] | null | undefined)}
              exclusions={exclusionsVal as unknown as (string | string[] | RteBlock[] | null | undefined)}
              otherInfo={(otherInfoLines.length ? otherInfoLines : (genericOtherRaw as (string | string[] | RteBlock[] | null | undefined)))}
            />
            {!!brochureEmbedUrl && (
              <div className="mt-8 flex justify-center">
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold shadow"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 20h14v-2H5v2zM12 2l-5 5h3v6h4V7h3l-5-5z"/></svg>
                  Download Itinerary
                </a>
              </div>
            )}
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
                {start_date && (
                  <div className="flex items-center p-4 bg-sky-50 rounded-xl">
                    <div className="p-3 bg-sky-100 rounded-full mr-4">
                      <svg className="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 112 0v1zm13 6H4v10h16V8zM6 10h4v3H6v-3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Start date</p>
                      <p className="text-gray-600">{new Date(start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
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
                startDate: start_date ? new Date(start_date).toISOString() : undefined,
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
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
  const canonical = `/trips/${slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}