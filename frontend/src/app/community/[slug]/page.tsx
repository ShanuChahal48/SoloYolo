import { getPostBySlug } from '@/lib/api';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

// Removed unused STRAPI_URL constant (media helpers/build use env directly elsewhere)
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
  // Await dynamic params (Next.js 15+) then defensively normalize to a string
  const awaited = await params;
  const slug = typeof awaited.slug === 'string' ? awaited.slug : Array.isArray(awaited.slug) ? awaited.slug[0] : '';
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  interface MediaFormats { [k: string]: { url?: string } }
  interface MediaAttributes { url?: string; formats?: MediaFormats; alternativeText?: string }
  interface MediaLike { url?: string; formats?: MediaFormats; attributes?: MediaAttributes; data?: { attributes?: MediaAttributes } }
  interface AuthorPicture { url?: string; formats?: MediaFormats; attributes?: MediaAttributes; data?: { attributes?: MediaAttributes } }
  interface AuthorLike { name?: string; title?: string; picture?: AuthorPicture; data?: { attributes?: AuthorLike } }
  interface PostShape { title?: string; content?: string; cover_image?: MediaLike; author?: AuthorLike; publishedAt?: string; attributes?: PostShape }
  const rawPost: PostShape = post as PostShape;
  const postData: PostShape = rawPost.attributes ? rawPost.attributes : rawPost;
  const { title, content, publishedAt, cover_image, author } = postData;

  // --- Unified media unwrapping helper ---
  const unwrapMedia = (m: unknown): MediaAttributes | null => {
    if (!m || typeof m !== 'object') return null;
    const obj = m as Record<string, unknown>;
    if ('attributes' in obj && obj.attributes) return unwrapMedia(obj.attributes);
    if ('data' in obj && obj.data) return unwrapMedia(obj.data);
    // If it has url or formats, treat as media leaf
    if ('url' in obj || 'formats' in obj) return obj as MediaAttributes;
    return null;
  };

  // Cover media can appear as { data: RawMedia } or { data: { attributes: RawMedia } }
  const media: MediaAttributes | null = unwrapMedia(cover_image);
  const safeContent = content || '';
  const contentHtml = marked.parse(safeContent);

    // --- Author Normalization (supports flattened or nested) ---
  const authorNode: AuthorLike | null = (author?.data?.attributes as AuthorLike) || (author as AuthorLike) || null;
  const authorAttributes = authorNode || undefined;
  const authorPicRaw = unwrapMedia(authorNode?.picture);
  const picFormats = authorPicRaw?.formats || {};
  const picRel = picFormats?.thumbnail?.url
    || picFormats?.small?.url
    || authorPicRaw?.url
    || '';
  const authorImageUrl = picRel ? (picRel.startsWith('http') ? picRel : `${STRAPI_URL}${picRel}`) : '';

    // --- Article JSON-LD ---
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const canonicalUrl = `${siteUrl}/community/${slug}`;
    const rawContent = content || '';
    const plainExcerpt = rawContent
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/[#>*_~\-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220);
  const coverFormats = media?.formats || {};
  const coverUrlRel = coverFormats?.large?.url
    || coverFormats?.medium?.url
    || coverFormats?.small?.url
    || media?.url
    || '';
  const absoluteImage = coverUrlRel ? (coverUrlRel.startsWith('http') ? coverUrlRel : `${STRAPI_URL}${coverUrlRel}`) : '';
    const absoluteAuthorPic = authorImageUrl && !authorImageUrl.startsWith('http') ? `${siteUrl}${authorImageUrl}` : authorImageUrl;
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      headline: title,
      description: plainExcerpt,
      image: absoluteImage ? [absoluteImage] : undefined,
      author: authorAttributes?.name
        ? {
            '@type': 'Person',
            name: authorAttributes.name,
            ...(authorAttributes?.title ? { jobTitle: authorAttributes.title } : {}),
            ...(absoluteAuthorPic ? { image: absoluteAuthorPic } : {}),
          }
        : undefined,
      publisher: {
        '@type': 'Organization',
        name: 'Solo Yolo',
        logo: { '@type': 'ImageObject', url: `${siteUrl}/vercel.svg` },
      },
      datePublished: publishedAt || undefined,
      dateModified: publishedAt || undefined,
    };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd, null, 2) }} />
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
              alt={media?.alternativeText || `Cover for ${title}`}
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
                  {authorAttributes?.title && (
                    <p className="text-xs text-teal-300/90 mb-1">{authorAttributes.title}</p>
                  )}
                {publishedAt && (
                  <p className="text-sm text-teal-200">
                    {new Date(publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
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
