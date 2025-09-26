import { getBlogPosts, getTestimonials } from '@/lib/api';
import type { BlogPost, StrapiMedia } from '@/types';
import BlogCard from '@/components/BlogCard';
import TestimonialCard from '@/components/TestimonialCard';

interface TestimonialItem {
  id: number;
  attributes?: {
    traveler_name?: string;
    trip_taken?: string;
    quote?: string;
    rating?: number;
    picture?: { data?: { attributes?: { url?: string; formats?: Record<string, { url?: string }> } } };
  };
}

export default async function BlogPage() {
  // Fetch both blog posts and testimonials at the same time for better performance.
  const [posts, testimonials]: [BlogPost[], TestimonialItem[]] = await Promise.all([
    getBlogPosts(),
    getTestimonials()
  ]);


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
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">From Our Blog</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover travel insights, destination guides, and personal stories from our community of adventurers.
            </p>
          </div>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: BlogPost, index) => (
                <div 
                  key={post.id} 
                  className="animate-fade-in-up hover-lift"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Stories Coming Soon</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're working on amazing travel stories and insights. Check back soon for inspiring content from our community!
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
              {testimonials.map((testimonial: TestimonialItem, index) => (
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
    </div>
  );
}