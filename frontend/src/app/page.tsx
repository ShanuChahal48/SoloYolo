import Link from 'next/link';
import { getTestimonials, getBlogPosts } from '@/lib/api';
import FeaturedTrips from '@/components/FeaturedTrips';
import TestimonialCard from '@/components/TestimonialCard';
import BlogCard from '@/components/BlogCard';
import { BlogPost, TestimonialItem } from '@/types';

export default async function HomePage() {
  // Fetch all necessary data in parallel for maximum efficiency
  const [testimonials, blogPosts] = await Promise.all([
    getTestimonials(),
    getBlogPosts(),
  ]);

  // We only want to show a few items on the homepage to keep it clean
  const featuredTestimonials: TestimonialItem[] = testimonials.slice(0, 3);
  const recentPosts: BlogPost[] = blogPosts.slice(0, 3);

  return (
    <main
      className="overflow-hidden relative"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      {/* --- Hero Section --- */}
      <section className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
        {/* Subtle Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40 z-10"></div>
        <video
          src="/travelVideo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{objectFit: 'cover'}}
        />
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float z-20"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-amber-400/20 rounded-full animate-float z-20" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-teal-400/20 rounded-full animate-float z-20" style={{animationDelay: '2s'}}></div>
        <div className="relative z-30 container mx-auto px-6 max-w-6xl">
          <div className="animate-fade-in-up">
            <h1 className="text-responsive-3xl font-serif font-bold tracking-tight leading-tight mb-6 gradient-text">
              Travel Beyond The Ordinary
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-100 leading-relaxed">
              Curated journeys for the modern explorer. Discover your next unforgettable adventure with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/trips" 
                className="btn-primary text-lg px-8 py-4 hover-lift hover-glow"
              >
                Explore Our Trips
              </Link>
              <Link 
                href="/about" 
                className="btn-secondary text-lg px-8 py-4 hover-lift"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
          {/* Tree Divider Overlapping Bottom of Hero Image */}
          <div className="absolute left-0 right-0 bottom-0 w-full overflow-visible pointer-events-none" style={{lineHeight: 0}}>
            <img src="/mountain-divider.svg" alt="Section divider" className="w-full h-auto block" />
          </div>

      {/* --- Featured Trips Section --- */}


      {/* Remove extra divider background for seamless transition to dark starry section */}
      </section>

      {/* --- Featured Trips Section --- */}
      <section className="pt-0 relative">
        <div className="relative z-10">
          <FeaturedTrips />
        </div>
      </section>


      {/* --- Testimonials Section --- */}
      {featuredTestimonials.length > 0 && (
        <section
          className="relative py-24 overflow-hidden"
          style={{
            backgroundColor: '#0f172a',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-responsive-2xl font-serif font-bold text-slate-100 mb-6">
                What Our Travelers Say
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed">
                Real stories from adventurers who have journeyed with us.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Recent Blog Posts Section --- */}
      {recentPosts.length > 0 && (
         <section className="bg-transparent py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
            
            <div className="relative z-10 container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-responsive-2xl font-serif font-bold text-slate-100 mb-6">
                      Stories from the Road
                    </h2>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                      Get inspired for your next journey with our latest articles and travel tips.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post, index) => {
                      const postData = post.attributes || post;
                      if (!postData.slug) return null;
                      return (
                        <Link
                          href={`/community/${postData.slug}`}
                          key={post.id}
                          className="animate-fade-in-up hover-lift"
                          style={{animationDelay: `${index * 0.15}s`}}
                        >
                          <BlogCard post={post} />
                        </Link>
                      );
                    })}
                </div>
                
                <div className="text-center mt-16 animate-fade-in-up">
                    <Link 
                      href="/community" 
                      className="inline-flex items-center text-teal-400 font-semibold hover:text-white transition-all duration-300 group"
                    >
                      Read More on Our Community Hub 
                      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                </div>
            </div>
        </section>
      )}

    </main>
  );
}