
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
  if (!post.attributes) {
    return null;
  }
  const { title, slug, excerpt, publishedAt, cover_image } = post.attributes;
  const media: StrapiMedia | undefined = (cover_image as any)?.data ?? (cover_image as any);
  const imageUrl = getImageUrl(media);

  return (
    <article className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      <Link href={`/community/${slug}`} className="block">
        <div className="relative h-56 w-full">
          <Image
            src={imageUrl}
            alt={(media as any)?.alternativeText || media?.attributes?.alternativeText || `Cover image for ${title}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 leading-tight">{title}</h3>
          <p className="text-gray-600 mb-4">{excerpt}</p>
          <p className="text-sm text-gray-500">
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </Link>
    </article>
  );
}
