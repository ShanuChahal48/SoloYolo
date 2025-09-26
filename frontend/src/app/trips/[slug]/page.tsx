
// Ensure getTripBySlug is exported from '@/lib/api'
import { getTripBySlug } from '@/lib/api';
import { } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Helper function to get a clean image URL
const getStrapiImageUrl = (
  mediaObject:
    | { url?: string; formats?: Record<string, { url?: string }> }
    | { data?: { attributes?: { url?: string; formats?: Record<string, { url?: string }> } } }
    | { attributes?: { url?: string; formats?: Record<string, { url?: string }> } }
    | undefined,
  format: 'large' | 'medium' | 'small' | 'thumbnail' = 'large'
) => {
  if (!mediaObject) return '';
  
  // Direct url (for gallery items)
  if ('url' in mediaObject && mediaObject.url) {
    return `http://localhost:1337${mediaObject.url}`;
  }
  
  // Direct formats (for gallery items)
  if ('formats' in mediaObject && mediaObject.formats) {
    if (mediaObject.formats[format]?.url) {
      return `http://localhost:1337${mediaObject.formats[format].url}`;
    }
    // Fallback to any available format
    for (const key of ['large', 'medium', 'small', 'thumbnail'] as const) {
      if (mediaObject.formats[key]?.url) {
        return `http://localhost:1337${mediaObject.formats[key].url}`;
      }
    }
  }
  
  // Nested data.attributes (for featured_image)
  const attrs = (mediaObject as any).data?.attributes || (mediaObject as any).attributes;
  if (attrs?.url) return `http://localhost:1337${attrs.url}`;
  if (attrs?.formats?.[format]?.url) return `http://localhost:1337${attrs.formats[format].url}`;
  const fmt = attrs?.formats;
  if (fmt) {
    for (const key of ['large', 'medium', 'small', 'thumbnail'] as const) {
      if (fmt[key]?.url) return `http://localhost:1337${fmt[key]?.url}`;
    }
  }
  return '';
};

export default async function TripDetailPage({ params }: { params: { slug: string } }) {
  const trip = await getTripBySlug(params.slug);

  if (!trip) {
    notFound();
  }

  const { title, price, duration, category, itinerary, featured_image, gallery } = trip;

  // Render itinerary blocks as paragraphs
  type RichTextBlock = { type: 'paragraph'; children?: { text: string }[] };
  const itineraryBlocks: RichTextBlock[] = Array.isArray(itinerary)
    ? (itinerary as RichTextBlock[])
    : typeof itinerary === 'string'
    ? [{ type: 'paragraph', children: [{ text: itinerary }] }]
    : [];

  return (
    <div className="bg-white">
      {/* Hero Section with Featured Image */}
      <div className="relative h-[50vh] w-full">
        {getStrapiImageUrl(featured_image) ? (
          <Image
            src={getStrapiImageUrl(featured_image)}
            alt={featured_image?.data?.attributes?.alternativeText || title}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Itinerary */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Trip Itinerary</h2>
            {/* Render the HTML from markdown */}
            <article className="prose lg:prose-xl max-w-none">
              {itineraryBlocks.map((block, idx) => {
                if (block.type === 'paragraph' && block.children) {
                  const text = block.children.map((child) => child.text).join(' ');
                  if (text.trim()) {
                    return (
                      <p key={idx} className="mb-4 text-lg text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 shadow">
                        {text}
                      </p>
                    );
                  }
                }
                return null;
              })}
            </article>
          </div>

          {/* Sidebar: Booking & Details */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-gray-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-teal-700 mb-2">
                ₹{price.toLocaleString('en-IN')}
                <span className="text-base font-normal text-gray-600"> / person</span>
              </h3>
              <div className="space-y-4 my-6 text-lg">
                <p className="flex items-center"><strong className="w-24">Duration:</strong> {duration}</p>
                <p className="flex items-center"><strong className="w-24">Category:</strong> {category}</p>
              </div>
              <button className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-teal-700 transition duration-300">
                Book Now
              </button>
              <button className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-gray-300 transition duration-300">
                Enquire
              </button>
            </div>
          </aside>
        </div>

        {/* Gallery Section */}
        {gallery && Array.isArray(gallery) && gallery.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Trip Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img: { id: number; alternativeText?: string; url?: string; formats?: Record<string, { url?: string }> }) => {
                const imageUrl = getStrapiImageUrl(img, 'small');
                return (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={img.alternativeText || 'Trip gallery image'}
                        layout="fill"
                        objectFit="cover"
                        className="hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}