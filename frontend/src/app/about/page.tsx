import { getAboutPage } from '@/lib/api';
import { StrapiMedia } from '@/types'; // Assuming you have a types file
import Image from 'next/image';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo: {
    data: StrapiMedia;
  };
}

// A simple helper to get image URLs
const getImageUrl = (media: StrapiMedia, format: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium') => {
  if (!media) return '';
  // If media is a direct object (not .attributes), use its fields
  const formats = media.formats || media.attributes?.formats || {};
  let url = formats[format]?.url || media.url || media.attributes?.url;
  if (!url) {
    const availableFormat = Object.values(formats)[0] as any;
    url = availableFormat?.url || media.url || media.attributes?.url;
  }
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
};

export default async function AboutPage() {
  const aboutData = await getAboutPage();

  if (!aboutData || !aboutData.data) {
    return (
      <div className="bg-white text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">About page data not found</h1>
          <p className="text-lg text-gray-600">Please check your Strapi backend or API response.</p>
        </div>
      </div>
    );
  }

  const { title, subtitle, main_content, cover_image, team_section_title, team_members } = aboutData.data;
  const contentHtml = marked.parse(main_content);

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
  <section className="relative w-full flex items-center justify-center text-center text-white" style={{ background: 'black' }}>
        {cover_image && cover_image.url ? (
          cover_image.mime && cover_image.mime.startsWith('video') ? (
            <video
              src={cover_image.url.startsWith('http') ? cover_image.url : `${STRAPI_URL}${cover_image.url}`}
              className="w-full h-full object-cover z-0"
              autoPlay
              loop
              muted
              playsInline
              style={{ position: 'absolute', inset: 0 }}
            />
          ) : (
            <Image
              src={getImageUrl(cover_image, 'large') || getImageUrl(cover_image)}
              alt={cover_image.alternativeText || 'About us cover image'}
              width={cover_image.width || cover_image.attributes?.width || 800}
              height={cover_image.height || cover_image.attributes?.height || 600}
              className="z-0 w-full h-auto object-contain"
              priority
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Media</div>
        )}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-lg md:text-xl text-gray-200">{subtitle}</p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <article 
            className="prose lg:prose-lg mx-auto"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </section>

      {/* Team Section */}
      {team_members && team_members.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{team_section_title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team_members.map((member: TeamMember) => (
                <div key={member.id} className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    {(() => {
                      const photo = member.photo?.data || member.photo;
                      const imgUrl = getImageUrl(photo, 'thumbnail');
                      return imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={member.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 rounded-full">No Image</div>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-teal-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}