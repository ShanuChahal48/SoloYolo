"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { StrapiMedia } from '@/types'; // Assuming types file exists
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { marked } from 'marked';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

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
    const directUrl = (media as any)?.formats?.[format]?.url || (media as any)?.url;
    const attrsUrl = media?.attributes?.formats?.[format]?.url || media?.attributes?.url;
    const url = directUrl || attrsUrl || '';
    return `${STRAPI_URL}${url}`;
  };

  const { title, content, publishedAt, cover_image, author } = post.attributes || {};
  const media: StrapiMedia | undefined = (cover_image as any)?.data ?? (cover_image as any);
  const imageUrl = getImageUrl(media);
  const contentHtml = content ? marked.parse(content) : '';
  const authorData = author?.data?.attributes;
  let authorPic: any = undefined;
  if (authorData?.picture) {
    if (authorData.picture.data) {
      authorPic = authorData.picture.data.attributes || authorData.picture.data;
    } else if (typeof authorData.picture === 'object' && 'attributes' in authorData.picture) {
      authorPic = (authorData.picture as any).attributes;
    } else {
      authorPic = authorData.picture;
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