"use client";

import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { getBlogPosts, getTestimonials } from '@/lib/api';
import type { BlogPost, StrapiMedia, Testimonial } from '@/types';
import BlogCard from '@/components/BlogCard';
import TestimonialCard from '@/components/TestimonialCard';
import {ChevronLeft,ChevronRight} from 'lucide-react'
import BlogPostModal from '@/components/BlogPostModal'; // We will create this new component


// interface TestimonialItem {
//   id: number;
//   attributes?: {
//     traveler_name?: string;
//     trip_taken?: string;
//     quote?: string;
//     rating?: number;
//     picture?: { data?: { attributes?: { url?: string; formats?: Record<string, { url?: string }> } } };
//   };
// }

export default function BlogPage() {
  // Fetch both blog posts and testimonials at the same time for better performance.
 const [posts, setPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // State to manage if arrows should be enabled or disabled
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // --- NEW: State to manage the modal ---
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);

  // Since this is now a client component, we fetch data using useEffect
  useEffect(() => {
    async function fetchData() {
      const [blogData, testimonialData] = await Promise.all([
        getBlogPosts(),
        getTestimonials()
      ]);
      setPosts(blogData);
      setTestimonials(testimonialData);
    }
    fetchData();
  }, []);

   // --- NEW: Functions to control the modal ---
  // const openModal = (index: number) => {
  //   console.log('BlogCard clicked, opening modal for index:', index);
  //   setActivePostIndex(index);
  //   document.body.style.overflow = 'hidden'; // Prevent background scroll
  // };

  const closeModal = () => {
    setActivePostIndex(null);
    document.body.style.overflow = ''; // Re-enable background scroll
  };

  const navigateModal = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < posts.length) {
      setActivePostIndex(newIndex);
    }
  };

  // This function checks if there's more content to scroll to
  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (el) {
      // Disable left arrow if first blog is fully in view
      setCanScrollLeft(el.scrollLeft > 5);
      // Disable right arrow if last blog is fully in view
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  // Set up event listener to check scrollability whenever the user scrolls or posts load
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScrollability(); // Initial check
      el.addEventListener('scroll', checkScrollability);
    }
    // Cleanup the event listener when the component is removed
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [posts]); // Re-run this check when the posts data has loaded

  // Function to handle the arrow button clicks
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      // Scroll by 80% of the visible width for a nice "paging" effect
      const scrollAmount = direction === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Normalize author from possible Strapi shapes (wrapped or flattened)
  interface NormalizedAuthor {
    name?: string;
    title?: string;
    picture?: { data?: StrapiMedia } | { data?: { attributes?: { url?: string; formats?: Record<string, { url?: string }> } } } | undefined;
  }

  const extractAuthor = (raw: unknown): NormalizedAuthor | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    // Wrapped form: { data: { attributes: { name, title, picture } } }
    if ('data' in raw) {
      const wrapped = (raw as { data?: { attributes?: Record<string, unknown> } }).data;
      const attrs = wrapped?.attributes;
      if (attrs && (typeof attrs === 'object')) {
        return attrs as NormalizedAuthor;
      }
    }
    // Flattened form: { name, title, picture }
    if ('name' in raw || 'title' in raw) {
      return raw as NormalizedAuthor;
    }
    return undefined;
  };



  return (
  <div
    className="min-h-screen"
    style={{
      backgroundColor: '#0f172a',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '100px 100px',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
    }}
  >
      {/* Hero Section with Animation */}
  <section className="relative bg-transparent text-white py-24 text-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-amber-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Traveler Stories</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
              Dive into authentic experiences, travel tips, and inspiring stories from fellow adventurers who have explored the world with us.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
  <section className="py-20 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-slate-100 mb-6">From Our Blog</h2>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed text-center">
              Discover travel insights, destination guides, and personal stories from our community of adventurers.
            </p>
          </div>

     {posts.length > 0 ? (
            <div className="relative">
              {/* Blog Card List */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-8 pb-8 -mx-6 px-6 scrollbar-hide"
              >
                {posts.map((post: BlogPost) => {
                  const attr = post.attributes;
                  if (!attr?.slug) return null;
                  const normalizedAuthor = extractAuthor(attr.author);
                  const normalized = {
                    id: post.id,
                    attributes: {
                      title: attr.title,
                      slug: attr.slug,
                      excerpt: attr.excerpt,
                      publishedAt: attr.publishedAt,
                      cover_image: attr.cover_image,
                      author: normalizedAuthor,
                    }
                  };
                  return (
                    <Link
                      href={`/community/${attr.slug}`}
                      key={post.id}
                      className="animate-fade-in-up hover-lift"
                      aria-label={`Open blog post: ${attr.title}`}
                    >
                      <BlogCard post={normalized} />
                    </Link>
                  );
                })}
              </div>
              {/* Centered vertical arrows for scrolling */}
              <div className="absolute left-0 right-0 top-1/2 pointer-events-none" style={{transform: 'translateY(-50%)'}}>
                {canScrollLeft && (
                  <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-2 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all pointer-events-auto"
                    style={{top: '50%', transform: 'translateY(-50%)'}}
                    aria-label="Scroll Left"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-2 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all pointer-events-auto"
                    style={{top: '50%', transform: 'translateY(-50%)'}}
                    aria-label="Scroll Right"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-teal-300 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Loading Stories...</h3>
                <p className="text-gray-600 leading-relaxed">
                  Please wait while we fetch the latest travel stories from our community.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
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
          {/* Soft radial glow overlays */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-[32rem] h-[32rem] bg-amber-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-slate-100 mb-6 drop-shadow">What Our Travelers Say</h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Real experiences and heartfelt stories from adventurers who have journeyed with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <TestimonialCard
                    testimonial={testimonial as unknown as {
                      attributes: {
                        traveler_name: string;
                        trip_taken: string;
                        quote: string;
                        rating: number;
                        picture: { data: StrapiMedia };
                      };
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    {/* Render modal at the top level so it overlays the entire page, not just inside the scroll container */}
    {activePostIndex !== null && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
        <BlogPostModal
          posts={posts}
          initialPostIndex={activePostIndex}
          onClose={closeModal}
          onNavigate={navigateModal}
        />
      </div>
    )}
    </div>
  );
}