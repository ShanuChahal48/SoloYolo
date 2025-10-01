import { getPostBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import Image from 'next/image';

// NOTE: Using Promise-wrapped params to align with existing project typing expectations elsewhere
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.attributes) return notFound();

  const { title, content, cover_image, author, publishedAt } = post.attributes;
  const imageUrl = cover_image?.data?.attributes?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL|| 'http://localhost:1337'}${cover_image.data.attributes.url}`
    : '';
  const authorData = author?.data?.attributes;
  const authorPic = authorData?.picture?.data?.attributes?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${authorData.picture.data.attributes.url}`
    : '';
  const contentHtml = content ? marked.parse(content) : '';

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
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>
          {imageUrl && (
            <div className="mb-8">
              <Image src={imageUrl} alt={title} width={800} height={400} className="rounded-xl object-cover" />
            </div>
          )}
          <div className="flex items-center space-x-4 mb-6">
            {authorPic && (
              <Image src={authorPic} alt={authorData?.name || ''} width={48} height={48} className="rounded-full" />
            )}
            <div>
              <p className="font-semibold text-gray-800">{authorData?.name}</p>
              <p className="text-sm text-gray-500">
                {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : ''}
              </p>
            </div>
          </div>
          <article className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cyan-700 prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-code:text-cyan-800 prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-li:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </main>
  );
}
