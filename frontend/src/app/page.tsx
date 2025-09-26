import Link from 'next/link';
import { getFeaturedTrips, getTestimonials, getBlogPosts } from '@/lib/api';
import FeaturedTrips from '@/components/FeaturedTrips';
import TestimonialCard from '@/components/TestimonialCard';
import BlogCard from '@/components/BlogCard';
import { Trip, Testimonial, BlogPost } from '@/types';

export default async function HomePage() {
  // Fetch all necessary data in parallel for maximum efficiency
  const [featuredTrips, testimonials, blogPosts] = await Promise.all([
    getFeaturedTrips(),
    getTestimonials(),
    getBlogPosts(),
  ]);

  // We only want to show a few items on the homepage to keep it clean
  const featuredTestimonials: Testimonial[] = testimonials.slice(0, 3);
  const recentPosts: BlogPost[] = blogPosts.slice(0, 3);

  return (
    <main>
      {/* --- Hero Section --- */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-white text-center shadow-lg">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          // Ensure your video file is named 'travel-video.mp4' and placed in the /public folder
          src="/travel-video.mp4" 
        >
          Your browser does not support the video tag.
        </video>
        <div className="relative z-20 container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4 animate-fade-in-down">
            Travel Beyond The Ordinary
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up">
            Curated journeys for the modern explorer. Discover your next unforgettable adventure with us.
          </p>
          <Link 
            href="/trips" 
            className="bg-teal-500 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-teal-600 transition-transform duration-300 transform hover:scale-105 inline-block"
          >
            Explore Our Trips
          </Link>
        </div>
      </section>

      {/* --- Featured Trips Section --- */}
      <FeaturedTrips trips={featuredTrips as Trip[]} />

      {/* --- Testimonials Section --- */}
      {featuredTestimonials.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Travelers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Real stories from adventurers who have journeyed with us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Recent Blog Posts Section --- */}
      {recentPosts.length > 0 && (
         <section className="bg-white py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Stories from the Road</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Get inspired for your next journey with our latest articles and travel tips.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>
                 <div className="text-center mt-16">
                    <Link href="/community" className="text-teal-600 font-semibold hover:text-teal-800 transition-colors duration-300">
                        Read More on Our Community Hub &rarr;
                    </Link>
                </div>
            </div>
        </section>
      )}

    </main>
  );
}