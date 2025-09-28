import { getPostBySlug } from '@/lib/api';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postData = (post as { attributes?: import('@/types').BlogPostAttributes }).attributes ?? post;
  const { title, content, publishedAt, cover_image, author } = postData as import('@/types').BlogPostAttributes;
  const media = (cover_image?.data ?? cover_image) as import('@/types').StrapiMedia;
  const contentHtml = marked.parse(content);
    const authorAttributes = author?.data?.attributes ?? undefined;
    const authorPic = authorAttributes?.picture?.data?.attributes ?? undefined;
    const authorImageUrl = authorPic?.formats?.thumbnail?.url
      ? `${STRAPI_URL}${authorPic.formats.thumbnail.url}`
      : authorPic?.url
      ? `${STRAPI_URL}${authorPic.url}`
      : '';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {(() => {
          const url = getImageUrl(media);
          if (!url) {
            return <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600" />;
          }
          if (url.endsWith('.mp4')) {
            return (
              <video
                src={url}
                controls
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
                  poster={undefined}
              >
                Your browser does not support the video tag.
              </video>
            );
          }
          return (
            <Image
              src={url}
              alt={media?.alternativeText || media?.attributes?.alternativeText || `Cover for ${title}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
              className="absolute inset-0 w-full h-full"
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        {/* Floating Title Overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-16">
          <div className="text-center text-white animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{title}</h1>
            <div className="flex items-center justify-center space-x-4 text-teal-200">
              <div className="relative w-12 h-12">
                {authorImageUrl ? (
                  <Image
                    src={authorImageUrl}
                      alt={authorAttributes?.name || 'Author'}
                    fill
                    sizes="48px"
                    style={{ objectFit: 'cover' }}
                    className="rounded-full border-2 border-white/30"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/20" />
                )}
              </div>
              <div className="text-left">
                  <p className="font-semibold text-white">{authorAttributes?.name || ''}</p>
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
            className="prose lg:prose-xl max-w-none prose-headings:text-black prose-p:text-black prose-a:text-teal-700 prose-strong:text-black prose-code:bg-gray-100 prose-code:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-teal-400 prose-blockquote:text-gray-800 prose-img:rounded-xl prose-img:shadow-md prose-table:text-black prose-table:border prose-table:border-gray-300 prose-th:bg-gray-100 prose-th:text-black prose-td:text-black prose-td:bg-white prose-hr:border-teal-300 prose-li:marker:text-teal-600 prose-li:text-black prose-ul:text-black prose-ol:text-black prose-pre:bg-gray-900 prose-pre:text-white prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-700 prose-pre:mb-6 prose-pre:mt-6 prose-pre:mx-0 prose-pre:my-0 prose-pre:max-w-full prose-pre:whitespace-pre-wrap prose-pre:break-words prose-pre:font-mono prose-pre:text-sm prose-pre:leading-relaxed prose-pre:tracking-wide prose-pre:font-semibold prose-pre:shadow-none prose-pre:border-none prose-pre:bg-opacity-95 prose-pre:text-opacity-100 prose-pre:prose-code:text-white prose-pre:prose-code:bg-transparent prose-pre:prose-code:font-mono prose-pre:prose-code:text-sm prose-pre:prose-code:leading-relaxed prose-pre:prose-code:tracking-wide prose-pre:prose-code:font-semibold prose-pre:prose-code:shadow-none prose-pre:prose-code:border-none prose-pre:prose-code:bg-opacity-95 prose-pre:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:prose-code:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-opacity-100 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-white prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:bg-transparent prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:font-mono prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-sm prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:leading-relaxed prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:tracking-wide prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:font-semibold prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:shadow-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:border-none prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:bg-opacity-95 prose-pre:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:prose-code:text-opacity-100"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}
