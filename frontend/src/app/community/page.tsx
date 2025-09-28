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
  const openModal = (index: number) => {
  console.log('BlogCard clicked, opening modal for index:', index);
  setActivePostIndex(index);
  document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

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



  return (
    <div className="bg-gradient-to-br from-gray-50 to-teal-50 min-h-screen">
      {/* Hero Section with Animation */}
      <section className="relative bg-gradient-to-br from-teal-800 via-teal-600 to-amber-500 text-white py-24 text-center overflow-hidden">
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
       <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">From Our Blog</h2>
            <p className="text-lg text-gray-600 max-w-3xl leading-relaxed text-center">
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
                  const postData = post.attributes || post;
                  if (!postData.slug) return null;
                  return (
                    <Link
                      href={`/community/${postData.slug}`}
                      key={post.id}
                      className="animate-fade-in-up hover-lift"
                      aria-label={`Open blog post: ${postData.title}`}
                    >
                      <BlogCard post={post} />
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
        <section className="relative bg-gradient-to-br from-teal-50 to-amber-50 py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">What Our Travelers Say</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Real experiences and heartfelt stories from adventurers who have journeyed with us.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="animate-fade-in-up hover-lift"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <TestimonialCard testimonial={testimonial as unknown as { attributes: { traveler_name: string; trip_taken: string; quote: string; rating: number; picture: { data: StrapiMedia } } }} />
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