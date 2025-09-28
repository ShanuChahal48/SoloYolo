
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
  const attrs = (mediaObject as import('@/types').StrapiMedia).attributes;
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

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const { title, price, duration, category, itinerary, featured_image, gallery } = trip;

  // Render itinerary blocks as paragraphs
  type RichTextBlock = { type: 'paragraph'; children?: { text: string }[] };
  const itineraryBlocks: RichTextBlock[] = Array.isArray(itinerary)
    ? itinerary as RichTextBlock[]
    : typeof itinerary === 'string'
    ? [{ type: 'paragraph', children: [{ text: itinerary }] }]
    : [];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-teal-50 min-h-screen">
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
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">Trip Itinerary</h2>
              {/* Render the HTML from markdown */}
              <article className="prose lg:prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-teal-600 prose-strong:text-gray-900">
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
                <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-4 px-6 rounded-xl text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover-lift">
                  Book Now
                </button>
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
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Trip Gallery</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
    </div>
  );
}