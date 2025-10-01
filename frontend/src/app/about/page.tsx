import { getAboutPage } from '@/lib/api';
import { StrapiMedia } from '@/types'; // Assuming you have a types file
import Image from 'next/image';
import { marked } from 'marked';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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
  const formats = media.formats || media.attributes?.formats || {} as Record<string, { url?: string }>;
  let url = (formats[format]?.url) || media.url || media.attributes?.url;
  if (!url) {
    const firstFormat = Object.values(formats)[0];
    url = (firstFormat && firstFormat.url) || media.url || media.attributes?.url;
  }
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
};

export default async function AboutPage() {
  const aboutAttributes = await getAboutPage();

  if (!aboutAttributes) {
    return (
      <div className="bg-white text-gray-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">About page data not found</h1>
          <p className="text-lg text-gray-600">Please check your Strapi backend or API response.</p>
        </div>
      </div>
    );
  }

  const { title, subtitle, main_content, cover_image, team_section_title, team_members } = aboutAttributes;
  const contentHtml = marked.parse(main_content);

  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      {/* Hero Section with Proper Video Layout */}
      <section className="relative w-full h-screen flex items-center justify-center text-center text-white overflow-hidden">
        {cover_image && cover_image.url ? (
          cover_image.mime && cover_image.mime.startsWith('video') ? (
            <video
              src={cover_image.url.startsWith('http') ? cover_image.url : `${STRAPI_URL}${cover_image.url}`}
              className="absolute inset-0 w-full h-full object-cover z-0"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <Image
              src={getImageUrl(cover_image, 'large') || getImageUrl(cover_image)}
              alt={cover_image.alternativeText || 'About us cover image'}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              className="z-0"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-teal-600 to-amber-500 flex items-center justify-center text-gray-100">
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4">About Us</h1>
              <p className="text-xl">Discover our story</p>
            </div>
          </div>
        )}
        
        {/* Overlay with gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 px-6 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">{title}</h1>
            <p className="text-xl md:text-2xl text-gray-100 leading-relaxed">{subtitle}</p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="animate-fade-in-up">
            <article 
              className="prose lg:prose-xl mx-auto prose-invert prose-a:text-teal-400 prose-hr:border-teal-700 prose-li:marker:text-teal-500"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team_members && team_members.length > 0 && (
  <section className="relative py-24 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
          
          <div className="relative z-10 container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{team_section_title}</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Meet the passionate individuals who make our adventures possible.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {team_members.map((member: TeamMember, index: number) => (
                <div 
                  key={member.id} 
                  className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover-lift animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    {(() => {
                      const photo = member.photo?.data || member.photo;
                      const imgUrl = getImageUrl(photo, 'thumbnail');
                      return imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={member.name}
                          fill
                          sizes="160px"
                          style={{ objectFit: 'cover' }}
                          className="rounded-full border-4 border-teal-400/50"
                          priority={index < 3}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-800 to-amber-800 flex items-center justify-center text-teal-400 rounded-full border-4 border-teal-400/50">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-teal-400 font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}