
import Image from 'next/image';
import { StrapiMedia } from '@/types';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface AuthorPictureFormats { [k: string]: { url?: string } }
interface AuthorPictureAttributes { url?: string; formats?: AuthorPictureFormats | null }
interface AuthorPicture { url?: string; formats?: AuthorPictureFormats | null; data?: { attributes?: AuthorPictureAttributes } }
interface AuthorShape { name?: string; title?: string; picture?: AuthorPicture; data?: { attributes?: AuthorShape } }

interface BlogCardAttributesShape {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  cover_image: StrapiMedia | { data: StrapiMedia };
  author?: AuthorShape; // normalized below
}

type BlogCardPostShape = {
  id: number;
  attributes?: BlogCardAttributesShape; // standard Strapi
  // flattened fallback
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  cover_image?: StrapiMedia | { data: StrapiMedia };
  author?: AuthorShape;
};

interface BlogCardProps {
  post: BlogCardPostShape;
  clickable?: boolean; // if true wrap content in anchor externally; component itself stays anchor-free
}

const getImageUrl = (
  media: StrapiMedia | undefined,
  format: 'thumbnail' | 'small' | 'medium' | 'large' = 'small'
) => {
  let url = '';
  if (media) {
    if (media.formats && media.formats[format]?.url) {
      url = media.formats[format]?.url ?? '';
    } else if (media.url) {
      url = media.url;
    } else if (media.attributes) {
      if (media.attributes.formats && media.attributes.formats[format]?.url) {
        url = media.attributes.formats[format]?.url ?? '';
      } else if (media.attributes.url) {
        url = media.attributes.url;
      }
    }
  }
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
};

export default function BlogCard({ post }: BlogCardProps) {
  // Handle both formats: with attributes wrapper and direct format
  const postData = post.attributes || post;
  if (!postData.title || !postData.slug) {
    return null;
  }
  const { title, excerpt, publishedAt, cover_image, author } = postData as BlogCardAttributesShape;

  // --- Cover Image Normalization ---
  const media: StrapiMedia | undefined = (cover_image as { data?: StrapiMedia })?.data
    || (cover_image as unknown as { attributes?: StrapiMedia })?.attributes
    || (cover_image as StrapiMedia);
  const imageUrl = getImageUrl(media);
  // Check if media is a video (mp4)
  const isVideo = imageUrl.endsWith('.mp4');

  // Normalize author (API returns embedded author object directly under attributes, not wrapped in .data)
  // --- Author Normalization (supports multiple shapes) ---
  const authorData: AuthorShape | null = (author?.data?.attributes as AuthorShape)
    || (author as AuthorShape)
    || null;
  const authorName = authorData?.name || '';
  const authorTitle = authorData?.title || '';
  const pictureNode: AuthorPicture | undefined = (authorData?.picture?.data?.attributes as AuthorPicture)
    || (authorData?.picture?.data as unknown as AuthorPicture)
    || (authorData?.picture as AuthorPicture);
  const picFormats = pictureNode?.formats || pictureNode?.data?.attributes?.formats || {};
  const authorPicUrlRel = picFormats?.thumbnail?.url
    || picFormats?.small?.url
    || pictureNode?.url
    || pictureNode?.data?.attributes?.url
    || '';
  const authorPicUrl = authorPicUrlRel ? (authorPicUrlRel.startsWith('http') ? authorPicUrlRel : `${STRAPI_URL}${authorPicUrlRel}`) : '';

  return (
  <article className="w-[350px] flex-shrink-0 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white group focus:outline-none focus:ring-2 focus:ring-emerald-500" data-reveal="fade-up">
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-emerald-400/20 via-white/0 to-emerald-600/30 rounded-t-xl" />
          {imageUrl && !isVideo && (
            <Image
              src={imageUrl}
              alt={media?.alternativeText || media?.attributes?.alternativeText || `Cover image for ${title}`}
              fill
              sizes="350px"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110 rounded-t-xl shadow-md"
            />
          )}
          {isVideo && (
            <video
              src={imageUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover rounded-t-xl shadow-md"
              poster={undefined}
            >
              Your browser does not support the video tag.
            </video>
          )}
          {!imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-200 to-emerald-400 text-emerald-900 font-semibold">
              No Image
            </div>
          )}
          <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-white/0 opacity-80 rounded-t-xl" />
        </div>
        <div className="p-6">
          <h3 className="h-16 text-xl font-bold mb-3 text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors duration-300 drop-shadow-sm">
            {title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3 drop-shadow-xs">{excerpt}</p>
          {(authorName || authorPicUrl) && (
            <div className="flex items-center mb-4 gap-3">
              {authorPicUrl ? (
                <Image
                  src={authorPicUrl}
                  alt={authorName || 'Author'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                  {authorName ? authorName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="leading-tight">
                {authorName && (
                  <p className="text-sm font-semibold text-gray-800">{authorName}</p>
                )}
                {authorTitle && <p className="text-xs text-gray-500">{authorTitle}</p>}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {publishedAt
                ? new Date(publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </p>
            <div className="flex items-center text-emerald-600 group-hover:text-emerald-800 transition-colors duration-300">
              <span className="text-sm font-medium">Read More</span>
              <svg
                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
  );
}
