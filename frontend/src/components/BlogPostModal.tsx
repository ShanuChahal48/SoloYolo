"use client";

// import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { StrapiMedia } from '@/types'; // Assuming types file exists
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { marked } from 'marked';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface BlogPostModalProps {
  posts: BlogPost[];
  initialPostIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export default function BlogPostModal(props: BlogPostModalProps) {
  const { posts, initialPostIndex, onClose, onNavigate } = props;
  const postIndex = initialPostIndex;
  if (postIndex === null) return null;
  const post = posts[postIndex];
  if (!post || !post.attributes) return null;

  const getImageUrl = (
    media: StrapiMedia | undefined,
    format: 'thumbnail' | 'small' | 'medium' | 'large' = 'large'
  ) => {
    let url = '';
    if (media) {
      if (media.formats && media.formats[format]?.url) {
        url = media.formats[format]?.url ?? '';
      } else if (media.url) {
        url = media.url;
      } else if (media.attributes) {
        if (media.attributes.formats && media.attributes.formats[format]?.url) {
          url = media.attributes.formats[format]?.url ?? '';
        } else if (media.attributes.url) {
          url = media.attributes.url;
        }
      }
    }
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  const { title, content, publishedAt, cover_image, author } = post.attributes || {};
  let media: StrapiMedia | undefined = undefined;
  if (cover_image && typeof cover_image === 'object') {
    if ('data' in cover_image && cover_image.data && typeof cover_image.data.id === 'number') {
      media = cover_image.data;
    } else if ('id' in cover_image && typeof cover_image.id === 'number') {
      media = cover_image as StrapiMedia;
    }
  }
  const imageUrl = getImageUrl(media);
  const contentHtml = content ? marked.parse(content) : '';
  const authorData = author?.data?.attributes;
  let authorPic: StrapiMedia | undefined = undefined;
  if (authorData?.picture) {
    // If picture is { data: StrapiMedia }
    if ('data' in authorData.picture && authorData.picture.data && authorData.picture.data.id) {
      authorPic = authorData.picture.data;
    }
    // If picture is StrapiMedia
    else if ('id' in authorData.picture && typeof authorData.picture.id === 'number') {
      authorPic = authorData.picture as StrapiMedia;
    }
  }
  const authorImageUrl = authorPic?.formats?.thumbnail?.url
    ? `${STRAPI_URL}${authorPic.formats.thumbnail.url}`
    : authorPic?.url
    ? `${STRAPI_URL}${authorPic.url}`
    : '';

  const hasNext = postIndex < posts.length - 1;
  const hasPrev = postIndex > 0;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
      onClick={onClose}
    >
      <div
        className="relative flex flex-row w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        {hasPrev && (
          <button
            onClick={() => onNavigate(postIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
            aria-label="Previous Post"
          >
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
        )}
        {/* Image Section */}
        <div className="flex items-center justify-center w-[60%] h-full bg-black">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        {/* Content Section */}
        <div className="flex flex-col w-[40%] h-full p-8 overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center space-x-3 text-gray-500 mb-4">
            {authorImageUrl && (
              <Image
                src={authorImageUrl}
                alt={authorData?.name || ''}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="font-semibold text-gray-800">{authorData?.name}</span>
            <span className="text-xs">
              {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) : ''}
            </span>
          </div>
          <article
            className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-teal-600"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
        {/* Right Arrow */}
        {hasNext && (
          <button
            onClick={() => onNavigate(postIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
            aria-label="Next Post"
          >
            <ArrowRight className="h-6 w-6 text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
  try {
    return createPortal(modalContent, document.body);
  } catch {
    return modalContent;
  }
}