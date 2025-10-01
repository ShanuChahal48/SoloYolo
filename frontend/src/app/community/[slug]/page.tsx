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

// NOTE: Using Promise-wrapped params to align with current PageProps constraint in project setup
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
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
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
            className="prose lg:prose-xl max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}
