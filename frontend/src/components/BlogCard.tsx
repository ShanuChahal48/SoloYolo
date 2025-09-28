
import Image from 'next/image';
import Link from 'next/link';
import { StrapiMedia } from '@/types'; // Assuming types file exists

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface BlogCardAttributesShape {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  cover_image: StrapiMedia | { data: StrapiMedia };
}

interface BlogCardProps {
  post: {
    id: number;
    attributes?: BlogCardAttributesShape;
    // Handle direct format (without attributes wrapper)
    title?: string;
    slug?: string;
    excerpt?: string;
    publishedAt?: string;
    cover_image?: StrapiMedia | { data: StrapiMedia };
  };
}

const getImageUrl = (
  media: StrapiMedia | undefined,
  format: 'thumbnail' | 'small' | 'medium' | 'large' = 'small'
) => {
  const directUrl = (media as any)?.formats?.[format]?.url || (media as any)?.url;
  const attrsUrl = media?.attributes?.formats?.[format]?.url || media?.attributes?.url;
  const url = directUrl || attrsUrl || '';
  return `${STRAPI_URL}${url}`;
};

export default function BlogCard({ post }: BlogCardProps) {
  // Handle both formats: with attributes wrapper and direct format
  const postData = post.attributes || post;
  if (!postData.title || !postData.slug) {
    return null;
  }
  const { title, slug, excerpt, publishedAt, cover_image } = postData;
  const media: StrapiMedia | undefined = (cover_image as any)?.data ?? (cover_image as any);
  const imageUrl = getImageUrl(media);
  // Check if media is a video (mp4)
  const isVideo = imageUrl.endsWith('.mp4');

  return (
    <article className="w-[350px] flex-shrink-0 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group">
      <div className="block">
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-emerald-400/20 via-white/0 to-emerald-600/30 rounded-t-xl" />
          {isVideo ? (
            <video
              src={imageUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover rounded-t-xl shadow-md"
              poster={(media as any)?.preview || undefined}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={imageUrl}
              alt={(media as any)?.alternativeText || media?.attributes?.alternativeText || `Cover image for ${title}`}
              fill
              sizes="350px"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110 rounded-t-xl shadow-md"
            />
          )}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-white/0 opacity-80 rounded-t-xl" />
        </div>
        <div className="p-6">
          <h3 className="h-16 text-xl font-bold mb-3 text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors duration-300 drop-shadow-sm">{title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3 drop-shadow-xs">{excerpt}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : ''}
            </p>
            <div className="flex items-center text-emerald-600 group-hover:text-emerald-800 transition-colors duration-300">
              <span className="text-sm font-medium">Read More</span>
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
