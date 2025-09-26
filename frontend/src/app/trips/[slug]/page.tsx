
// Ensure getTripBySlug is exported from '@/lib/api'
import { getTripBySlug } from '@/lib/api';
import { Trip } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { marked } from 'marked';

// Helper function to get a clean image URL
const getStrapiImageUrl = (mediaObject: any, format = 'large') => {
  if (!mediaObject) return '';
  // Direct url property
  if (mediaObject.url) return `http://localhost:1337${mediaObject.url}`;
  // Nested data.attributes.url
  if (mediaObject.data?.attributes?.url) return `http://localhost:1337${mediaObject.data.attributes.url}`;
  // Formats (large, medium, small, thumbnail)
  if (mediaObject.data?.attributes?.formats?.[format]?.url) return `http://localhost:1337${mediaObject.data.attributes.formats[format].url}`;
  // Fallback to any available format
  const formats = mediaObject.data?.attributes?.formats;
  if (formats) {
    for (const key of ['large', 'medium', 'small', 'thumbnail']) {
      if (formats[key]?.url) return `http://localhost:1337${formats[key].url}`;
    }
  }
  return '';
};

export default async function TripDetailPage({ params }: { params: { slug: string } }) {
  const trip: Trip = await getTripBySlug(params.slug);

  if (!trip) {
    notFound();
  }

  // Access fields directly, not via attributes
  const { title, price, duration, category, itinerary, featured_image, gallery } = trip;
  // Debug: log featured_image structure
  console.log('featured_image', featured_image);

  // Debug: log featured_image structure
  console.log('featured_image', featured_image);

  // Safely parse the markdown content for the itinerary
  // Render itinerary blocks as paragraphs
  let itineraryBlocks: any[] = [];
  if (Array.isArray(itinerary)) {
    itineraryBlocks = itinerary;
  } else if (typeof itinerary === 'string') {
    itineraryBlocks = [{ type: 'paragraph', children: [{ text: itinerary }] }];
  }

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
                  const text = block.children.map((child: any) => child.text).join(' ');
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
        {gallery && gallery.data && gallery.data.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Trip Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.data.map((img: any) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={getStrapiImageUrl(img, 'small')}
                    alt={img.attributes?.alternativeText || 'Trip gallery image'}
                    layout="fill"
                    objectFit="cover"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}