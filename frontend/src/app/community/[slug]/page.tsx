import { getBlogPostBySlug } from '@/lib/api';
import { StrapiMedia } from '@/types';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { marked } from 'marked';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

const getImageUrl = (media: StrapiMedia, format = 'large') => {
  const url = media?.attributes.formats?.[format]?.url || media?.attributes.url;
  return `${STRAPI_URL}${url}`;
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { title, content, publishedAt, cover_image, author } = post.attributes;
  const contentHtml = marked.parse(content);
  const authorData = author.data.attributes;
  const authorImageUrl = `${STRAPI_URL}${authorData.picture.data.attributes.url}`;

  return (
    <div className="bg-white">
      <div className="relative h-[50vh] w-full">
        <Image
          src={getImageUrl(cover_image.data)}
          alt={cover_image.data.attributes.alternativeText || `Cover for ${title}`}
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl -mt-24 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
          
          <div className="flex items-center mb-8 text-gray-600">
            <div className="relative w-12 h-12 mr-4">
              <Image
                src={authorImageUrl}
                alt={authorData.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
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