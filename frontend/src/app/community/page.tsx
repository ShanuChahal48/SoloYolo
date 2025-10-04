import { getBlogPosts, getTestimonials, getCommunityPage } from '@/lib/api';
import { getMediaUrl, type StrapiMedia as LibStrapiMedia } from '@/lib/media';
import type { BlogPost, Testimonial } from '@/types';
import TestimonialCard from '@/components/TestimonialCard';
import CommunityScroller from '@/components/CommunityScroller';
import Image from 'next/image';

// Revalidate every 60 seconds (same cadence as other content fetches)
export const revalidate = 60;

interface CommunityPageAttributes {
  hero_title?: string;
  hero_subtitle?: string;
  hero_media?: { data?: LibStrapiMedia } | LibStrapiMedia | null;
}

interface CommunityPageEntity {
  id?: number;
  attributes?: CommunityPageAttributes;
  hero_title?: string; // tolerate already-flattened shape
  hero_subtitle?: string;
  hero_media?: { data?: LibStrapiMedia } | LibStrapiMedia | null;
}


export default async function CommunityPage() {
  const [posts, testimonials, communityPage] = await Promise.all([
    getBlogPosts(),
    getTestimonials(),
    getCommunityPage()
  ]) as [BlogPost[], Testimonial[], CommunityPageEntity | null];

  const hasPosts = posts.length > 0;
  const hasTestimonials = testimonials.length > 0;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 70, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* Hero Section */}
      <section className="relative bg-transparent text-white overflow-hidden">
        {(() => {
          const attrs = communityPage?.attributes || communityPage;
          const rawMedia = attrs?.hero_media;
          const media = (rawMedia && typeof rawMedia === 'object' && 'data' in rawMedia)
            ? (rawMedia as { data?: LibStrapiMedia }).data
            : rawMedia as LibStrapiMedia | undefined;
          const url = getMediaUrl(media);
          if (!url) return null; // allow parent starfield to show through identically
          const isVideo = url.match(/\.(mp4|webm|mov)$/i);
          return isVideo ? (
            <video key={url} src={url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Image
              key={url}
              src={url}
              alt={attrs?.hero_title || 'Community background'}
              fill
              priority={false}
              sizes="100vw"
              className="object-cover"
            />
          );
        })()}
        <div className="relative z-10 container mx-auto px-6">
          <div className="min-h-[55vh] md:min-h-[60vh] flex flex-col justify-center items-center text-center pt-28 md:pt-32 pb-16">
            <div className="animate-fade-in-up max-w-5xl">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{(communityPage?.attributes || communityPage)?.hero_title || 'Traveler Stories'}</h1>
              <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">{(communityPage?.attributes || communityPage)?.hero_subtitle || 'Dive into authentic experiences, travel tips, and inspiring stories from fellow adventurers who have explored the world with us.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-slate-100 mb-6">From Our Blog</h2>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed text-center">Discover travel insights, destination guides, and personal stories from our community of adventurers.</p>
          </div>
          {hasPosts ? (
            <CommunityScroller posts={posts} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">No Stories Yet</h3>
                <p className="text-gray-600 leading-relaxed mb-2">We couldn&apos;t find any published posts.</p>
                <p className="text-gray-500 text-sm">If you expect content here, verify your Strapi content is published.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {hasTestimonials && (
        <section
          className="relative py-24 overflow-hidden"
          style={{
            backgroundColor: '#0f172a',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='10' cy='15' r='1' fill='%23f1f5f9' opacity='0.25'/%3E%3Ccircle cx='60' cy='40' r='1.2' fill='%23f1f5f9' opacity='0.18'/%3E%3Ccircle cx='85' cy='20' r='0.9' fill='%23f1f5f9' opacity='0.32'/%3E%3Ccircle cx='30' cy='80' r='1.1' fill='%23f1f5f9' opacity='0.22'/%3E%3Ccircle cx='95' cy='92' r='0.7' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='5' cy='55' r='0.9' fill='%23f1f5f9' opacity='0.18'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.4' opacity='0.07' d='M0 60 C25 35, 75 85, 100 60'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 30, 25 70, 50 100'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center'
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-[32rem] h-[32rem] bg-amber-400/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-slate-100 mb-6 drop-shadow">What Our Travelers Say</h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">Real experiences and heartfelt stories from adventurers who have journeyed with us.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={t.id} className="hover-lift" data-reveal="fade-up" data-reveal-delay={(i * 90).toString()}>
                  {/* Extend testimonial shape minimally to satisfy TestimonialCard */}
                  {(() => {
                    type Extended = typeof t & { attributes?: { traveler_name?: string; trip_taken?: string; quote?: string; rating?: number; picture?: { data?: LibStrapiMedia } } };
                    const extended = t as Extended;
                    return <TestimonialCard testimonial={extended} />;
                  })()}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}