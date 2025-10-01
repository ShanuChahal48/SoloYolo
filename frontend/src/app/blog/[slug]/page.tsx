import { getPostBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import Image from 'next/image';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
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
      className="max-w-4xl mx-auto py-12 px-4 overflow-hidden relative min-h-screen"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
  <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">{title}</h1>
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
          <p className="font-semibold text-slate-100">{authorData?.name}</p>
          <p className="text-sm text-slate-300">
            {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : ''}
          </p>
        </div>
      </div>
  <article className="prose max-w-none prose-headings:text-slate-100 prose-p:text-slate-200 prose-a:text-cyan-400 prose-strong:text-white prose-blockquote:text-slate-300 prose-code:text-cyan-300 prose-pre:bg-slate-900" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </main>
  );
}
