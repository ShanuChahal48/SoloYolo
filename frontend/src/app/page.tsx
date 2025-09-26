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
    <main className="overflow-hidden">
      {/* --- Hero Section --- */}
      <section className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
        {/* Subtle Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40 z-10"></div>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="/travelVideo.mp4" 
        >
          Your browser does not support the video tag.
        </video>
        
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
      </section>

      {/* --- Featured Trips Section --- */}
      <FeaturedTrips />

      {/* --- Testimonials Section --- */}
      {featuredTestimonials.length > 0 && (
        <section className="relative bg-gradient-to-br from-gray-50 to-teal-50 py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-responsive-2xl font-serif font-bold text-gray-800 mb-6">
                What Our Travelers Say
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
                Real stories from adventurers who have journeyed with us.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="animate-fade-in-up hover-lift"
                  style={{animationDelay: `${index * 0.2}s`}}
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
         <section className="bg-white py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-100 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
            
            <div className="relative z-10 container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-responsive-2xl font-serif font-bold text-gray-800 mb-6">
                      Stories from the Road
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      Get inspired for your next journey with our latest articles and travel tips.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post, index) => (
                      <div 
                        key={post.id} 
                        className="animate-fade-in-up hover-lift"
                        style={{animationDelay: `${index * 0.15}s`}}
                      >
                        <BlogCard post={post} />
                      </div>
                    ))}
                </div>
                
                <div className="text-center mt-16 animate-fade-in-up">
                    <Link 
                      href="/community" 
                      className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-800 transition-all duration-300 group"
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