import { getAboutPage } from '@/lib/api';
import type { Metadata } from 'next';
import { excerpt, absoluteUrl, siteDefaults } from '@/lib/seo';
import { StrapiMedia } from '@/types'; // Assuming you have a types file
import Image from 'next/image';

// This page now uses ISR via per-fetch revalidation (see getAboutPage cacheStrategy 'long').
// Removing force-dynamic + revalidate=0 allows static generation with incremental updates.
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

// Enhance markdown HTML to handle inline <img> tags with float styles from CMS
function enhanceContent(markdown: string): string {
  const raw = marked.parse(markdown || '');
  const rawHtml = typeof raw === 'string' ? raw : '';
  // Replace images that have inline float styles (especially float:right) with responsive class-based styling
  const transformed = rawHtml.replace(/<img([^>]*?)style=\"[^\"]*float:\s*right;?[^\"]*\"([^>]*?)>/gi, (match: string, preAttrs: string, postAttrs: string) => {
    const srcMatch = match.match(/src=\"([^\"]+)\"/i);
    const altMatch = match.match(/alt=\"([^\"]*)\"/i);
    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    return `<img src=\"${src}\" alt=\"${alt}\" class=\"about-float-img-right\" />`;
  });
  return transformed;
}

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
  const contentHtml = enhanceContent(main_content);

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
              className="about-content prose lg:prose-xl mx-auto prose-invert prose-a:text-teal-400 prose-hr:border-teal-700 prose-li:marker:text-teal-500"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <div className="clear-both" />
          </div>
        </div>
      </section>
      {/* Non-styled-jsx inline style injection: we rely on a small inline <style> tag without styled-jsx attributes to keep Server Component compatibility */}
      <style>{`
        .about-content .about-float-img-right {float:right;width:200px;max-width:50%;height:auto;margin-left:2.5rem;margin-right:0;margin-bottom:2.5rem;border-radius:15px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4),0 8px 10px -6px rgba(0,0,0,0.3);} 
        @media (max-width:768px){.about-content .about-float-img-right{float:none;display:block;margin:0 auto 1.75rem auto;width:70%;max-width:260px;}}
      `}</style>

      {/* Team Section */}
      {team_members && team_members.length > 0 && (
        <section className="relative mt-12 md:mt-16 pt-28 md:pt-32 pb-32 overflow-hidden">
          {/* Subtle decorative gradients repositioned */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-[-140px] right-[-180px] w-[540px] h-[540px] bg-gradient-to-br from-teal-500/10 to-transparent rounded-full" />
              <div className="absolute bottom-[-180px] left-[-200px] w-[480px] h-[480px] bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full" />
            </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center">
            <div className="w-full text-center mb-24 animate-fade-in-up">
              <h2 className="text-5xl font-bold text-white mb-7 tracking-tight leading-tight">{team_section_title}</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Meet the passionate individuals who make our adventures possible.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-20 gap-y-16 w-full px-2">
              {team_members.map((member: TeamMember, index: number) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center w-[320px] max-w-sm text-center bg-slate-900/40 backdrop-blur-sm p-12 rounded-3xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up border border-white/5"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="relative w-44 h-44 mx-auto mb-8">
                    {(() => {
                      const photo = member.photo?.data || member.photo;
                      const imgUrl = getImageUrl(photo, 'thumbnail');
                      return imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={member.name}
                          fill
                          sizes="176px"
                          style={{ objectFit: 'cover' }}
                          className="rounded-full border-4 border-teal-400/60 shadow-lg"
                          priority={index < 3}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-800 to-amber-800 flex items-center justify-center text-teal-300 rounded-full border-4 border-teal-400/50">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3 tracking-wide">{member.name}</h3>
                  <p className="text-teal-400 font-medium uppercase text-xs tracking-[0.2em]">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutAttributes = await getAboutPage();
  const attrs = aboutAttributes?.attributes || aboutAttributes;
  const { name: SITE_NAME } = siteDefaults();
  const title = attrs?.title ? `${attrs.title} | ${SITE_NAME}` : `About Us | ${SITE_NAME}`;
  const desc = excerpt(attrs?.subtitle || attrs?.main_content || '', 160) || 'Learn more about our mission and team.';
  return {
    title,
    description: desc,
    alternates: { canonical: '/about' },
    openGraph: { title, description: desc, url: '/about', images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630, alt: title }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}