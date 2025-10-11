// This file will hold all the TypeScript types for our project.

// Type for a Strapi media object
export interface StrapiMedia {
    id: number;
    name?: string;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
    formats?: {
        thumbnail?: StrapiImageFormat;
        small?: StrapiImageFormat;
        medium?: StrapiImageFormat;
        large?: StrapiImageFormat;
    } | null;
    url?: string;
    mime?: string;
    ext?: string;
    attributes?: {
        name?: string;
        alternativeText?: string | null;
        caption?: string | null;
        width?: number | null;
        height?: number | null;
        formats?: {
            thumbnail?: StrapiImageFormat;
            small?: StrapiImageFormat;
            medium?: StrapiImageFormat;
            large?: StrapiImageFormat;
        } | null;
        url?: string;
        mime?: string;
        ext?: string;
    };
}

export interface StrapiImageFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    url: string;
}

// Main type for our Trip data
export interface Trip {
    id: number;
    documentId?: string;
    title: string;
    slug: string;
    excerpt: string;
    price: number;
    duration: string;
    category: 'India' | 'International';
  destination?: string; // optional destination/location
  start_date?: string; // ISO date string for trip start
  capacity?: number; // max guests (optional)
    is_featured?: boolean;
    featured_image?: {
        url?: string;
        data?: StrapiMedia;
    };
    itinerary?: string;
    gallery?: {
        data: StrapiMedia[];
    };
}
export interface BlogPostAttributes {
  title: string;
  slug: string;
  content: string;
  publishedAt: string;
  excerpt: string; // <-- 🐛 FIX 1: Removed '?' to make it required
  cover_image: {
      data: StrapiMedia;
  };
  author?: {
    data: {
      attributes?: {
        name: string;
        picture: {
            data: StrapiMedia;
        };
        title?: string;
      }
    }
  };
}

// 2. Define the main BlogPost type to match the API response structure
export interface BlogPost {
  id: number;
  attributes: BlogPostAttributes;
}

// Minimal Testimonial type for homepage usage
export interface Testimonial {
  id: number;
  attributes?: {
    name?: string;
    content?: string;
  };
}

// TestimonialItem interface for testimonial cards
export interface TestimonialItem {
  id: number;
  attributes?: {
    traveler_name?: string;
    trip_taken?: string;
    quote?: string;
    rating?: number;
    picture?: {
      data: StrapiMedia;
    };
  };
}