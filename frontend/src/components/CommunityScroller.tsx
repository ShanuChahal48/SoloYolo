"use client";
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import BlogCard from './BlogCard';
import type { BlogPost } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { posts: BlogPost[] }

export default function CommunityScroller({ posts }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const check = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    check();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', check);
    return () => el.removeEventListener('scroll', check);
  }, [posts]);

  const handleScroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amt = dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8;
    el.scrollBy({ left: amt, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-8 pb-8 -mx-6 px-6 scrollbar-hide"
      >
        {posts.map((post, i) => {
          const attr = post.attributes;
          if (!attr?.slug) return null;
          return (
            <Link
              href={`/community/${attr.slug}`}
              key={post.id}
              className="hover-lift"
              data-reveal="fade-up"
              data-reveal-delay={(i * 110).toString()}
              aria-label={`Open blog post: ${attr.title}`}
            >
              <BlogCard post={post} />
            </Link>
          );
        })}
      </div>
      <div className="absolute left-0 right-0 top-1/2 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
        {canLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-2 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all pointer-events-auto"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-2 p-3 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all pointer-events-auto"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
}
