import { getPostBySlug } from '@/lib/api';
import type { Metadata } from 'next';
import { excerpt, absoluteUrl, siteDefaults } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import Image from 'next/image';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  // Support both Strapi shapes: legacy (attributes wrapper) & flattened
  interface MediaFormats { [k: string]: { url?: string } }
  interface MediaAttributes { url?: string; formats?: MediaFormats }
  interface MediaLike { url?: string; formats?: MediaFormats; attributes?: MediaAttributes; data?: { attributes?: MediaAttributes } }
  interface AuthorPicture { url?: string; formats?: MediaFormats; attributes?: MediaAttributes; data?: { attributes?: MediaAttributes } }
  interface AuthorLike { name?: string; title?: string; picture?: AuthorPicture; data?: { attributes?: AuthorLike } }
  interface PostShape { title?: string; content?: string; cover_image?: MediaLike; author?: AuthorLike; publishedAt?: string; attributes?: PostShape }
  const rawPost: PostShape = post as PostShape;
  const postData: PostShape = rawPost.attributes ? rawPost.attributes : rawPost;
  const { title, content, cover_image, author, publishedAt } = postData;
  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Cover image (handle either cover_image.data.attributes.url or direct url/formats)
  const coverMedia: MediaAttributes | null = cover_image?.data?.attributes || cover_image?.attributes || cover_image || null;
  const coverFormats = coverMedia?.formats || {};
  const coverUrlRel = coverFormats?.large?.url || coverFormats?.medium?.url || coverFormats?.small?.url || coverMedia?.url || '';
  const imageUrl: string = coverUrlRel ? (coverUrlRel.startsWith('http') ? coverUrlRel : `${STRAPI}${coverUrlRel}`) : '';

  // Author normalization (direct object OR relation object with data)
  const authorNode: AuthorLike | null = author?.data?.attributes || author || null;
  const pictureAttrs = authorNode?.picture?.data?.attributes || authorNode?.picture?.attributes || authorNode?.picture || null;
  const picFormats = pictureAttrs?.formats || {};
  const chosenPic = picFormats?.thumbnail?.url || picFormats?.small?.url || pictureAttrs?.url || '';
  const authorPic = chosenPic ? (chosenPic.startsWith('http') ? chosenPic : `${STRAPI}${chosenPic}`) : '';
  const authorName = authorNode?.name || '';
  const authorTitle = authorNode?.title || '';

  const contentHtml = content ? marked.parse(content) : '';

  // --- Article JSON-LD ---
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/blog/${params.slug}`;
  const rawContent = content || '';
  const plainExcerpt = rawContent
    .replace(/```[\s\S]*?```/g, ' ') // remove code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/[#>*_~\-]/g, ' ') // markdown syntax
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
    .slice(0, 220);
  const absoluteImage = imageUrl && !imageUrl.startsWith('http') ? `${siteUrl}${imageUrl}` : imageUrl;
  const absoluteAuthorPic = authorPic && !authorPic.startsWith('http') ? `${siteUrl}${authorPic}` : authorPic;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: title,
    description: plainExcerpt,
    image: absoluteImage ? [absoluteImage] : undefined,
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
          ...(authorTitle ? { jobTitle: authorTitle } : {}),
          ...(absoluteAuthorPic ? { image: absoluteAuthorPic } : {}),
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Solo Yolo',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/vercel.svg`,
      },
    },
    datePublished: publishedAt || undefined,
    dateModified: publishedAt || undefined,
  };

  return (
    <main
      className="min-h-screen overflow-hidden relative py-12 px-4"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-3xl mx-auto -mt-24 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd, null, 2) }} />
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>
          {imageUrl && (
            <div className="mb-8">
              <Image src={imageUrl} alt={title || 'Blog cover'} width={800} height={400} className="rounded-xl object-cover" />
            </div>
          )}
          {(authorName || authorPic) && (
            <div className="flex items-center space-x-4 mb-6">
              {authorPic ? (
                <Image src={authorPic} alt={authorName || 'Author'} width={48} height={48} className="rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                  {authorName ? authorName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div>
                {authorName && <p className="font-semibold text-gray-800">{authorName}</p>}
                {authorTitle && <p className="text-xs text-gray-500 -mt-1 mb-1">{authorTitle}</p>}
                <p className="text-sm text-gray-500">
                  {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : ''}
                </p>
              </div>
            </div>
          )}
          <article className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-700 prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-code:text-cyan-800 prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-li:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post Not Found', description: 'Requested blog post does not exist.' };
  }
  interface PostShape { title?: string; content?: string; attributes?: PostShape }
  const raw = post as PostShape;
  const data = raw.attributes || raw;
  const { name: SITE_NAME } = siteDefaults();
  const title = data.title ? `${data.title} | ${SITE_NAME}` : `Blog Post | ${SITE_NAME}`;
  const desc = excerpt(data.content || '', 160) || 'Travel story on our blog.';
  const canonical = `/blog/${params.slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}
