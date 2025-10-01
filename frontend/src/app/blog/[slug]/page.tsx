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
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">{title}</h1>
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
          <p className="text-sm text-slate-400">
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
