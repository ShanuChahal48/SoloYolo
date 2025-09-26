import { getPostBySlug } from '@/lib/api';
import { StrapiMedia } from '@/types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

const getImageUrl = (
  media: any,
  format: 'thumbnail' | 'small' | 'medium' | 'large' = 'large'
) => {
  if (!media) return '';
  const direct = media?.formats?.[format]?.url || media?.url;
  const attrs = media?.attributes;
  const viaAttrs = attrs?.formats?.[format]?.url || attrs?.url;
  const url = direct || viaAttrs || '';
  return url ? `${STRAPI_URL}${url}` : '';
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const a: any = (post as any).attributes ?? post;
  const { title, content, publishedAt, cover_image, author } = a;
  const media: any = (cover_image as any)?.data ?? cover_image;
  const contentHtml = marked.parse(content);
  const authorData: any = (author as any)?.data?.attributes ?? author;
  const authorPic = authorData?.picture?.data?.attributes || authorData?.picture?.attributes || authorData?.picture;
  const authorImageUrl = authorPic?.formats?.thumbnail?.url
    ? `${STRAPI_URL}${authorPic.formats.thumbnail.url}`
    : authorPic?.url
    ? `${STRAPI_URL}${authorPic.url}`
    : '';

  return (
    <div className="bg-white">
      <div className="relative h-[50vh] w-full">
        {getImageUrl(media) ? (
          <Image
            src={getImageUrl(media)}
            alt={media?.attributes?.alternativeText || `Cover for ${title}`}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl -mt-24 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
          
          <div className="flex items-center mb-8 text-gray-600">
            <div className="relative w-12 h-12 mr-4">
              {authorImageUrl ? (
                <Image
                  src={authorImageUrl}
                  alt={authorData.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200" />
              )}
            </div>
            <div>
              <p className="font-semibold">{authorData.name}</p>
              <p className="text-sm">
                Published on {new Date(publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          
          <article 
            className="prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}