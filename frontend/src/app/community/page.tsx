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
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-teal-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Traveler Stories</h1>
          <p className="mt-2 text-lg text-teal-100">Insights, tales, and advice from the road less traveled.</p>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">From Our Blog</h2>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: BlogPost) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No blog posts yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {/* This section will only appear if there are testimonials to display */}
      {testimonials.length > 0 && (
        <section className="bg-teal-50 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Travelers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: TestimonialItem) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial as unknown as { attributes: { traveler_name: string; trip_taken: string; quote: string; rating: number; picture: { data: StrapiMedia } } }} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}