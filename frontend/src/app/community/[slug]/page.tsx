import { getPostBySlug } from '@/lib/api';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

const getImageUrl = (
  media: unknown,
  format: 'thumbnail' | 'small' | 'medium' | 'large' = 'large'
) => {
  if (!media) return '';
  const mediaObj = media as { formats?: Record<string, { url?: string }>; url?: string; attributes?: { formats?: Record<string, { url?: string }>; url?: string } };
  const direct = mediaObj?.formats?.[format]?.url || mediaObj?.url;
  const attrs = mediaObj?.attributes;
  const viaAttrs = attrs?.formats?.[format]?.url || attrs?.url;
  const url = direct || viaAttrs || '';
  return url ? `${STRAPI_URL}${url}` : '';
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postData = (post as { attributes?: Record<string, unknown> }).attributes ?? post;
  const { title, content, publishedAt, cover_image, author } = postData as { title: string; content: string; publishedAt: string; cover_image: unknown; author: unknown };
  const media = (cover_image as { data?: unknown })?.data ?? cover_image;
  const contentHtml = marked.parse(content);
  const authorData = (author as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes ?? author;
  const authorPic = authorData?.picture?.data?.attributes || authorData?.picture?.attributes || authorData?.picture;
  const authorImageUrl = authorPic?.formats?.thumbnail?.url
    ? `${STRAPI_URL}${authorPic.formats.thumbnail.url}`
    : authorPic?.url
    ? `${STRAPI_URL}${authorPic.url}`
    : '';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {getImageUrl(media) ? (
          <Image
            src={getImageUrl(media)}
            alt={media?.attributes?.alternativeText || `Cover for ${title}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            className="transform scale-105 transition-transform duration-700 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Floating Title Overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-16">
          <div className="text-center text-white animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{title}</h1>
            <div className="flex items-center justify-center space-x-4 text-teal-200">
              <div className="relative w-12 h-12">
                {authorImageUrl ? (
                  <Image
                    src={authorImageUrl}
                    alt={authorData.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20" />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{authorData.name}</p>
                <p className="text-sm text-teal-200">
                  {new Date(publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with Better Spacing */}
      <div className="container mx-auto px-6 max-w-4xl -mt-16 relative z-10 pb-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in-up">
          <article 
            className="prose lg:prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-teal-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}