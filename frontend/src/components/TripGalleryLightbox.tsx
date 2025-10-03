"use client";
import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { extractMediaAttributes, getMediaUrl, StrapiMedia } from '@/lib/media';

interface TripGalleryLightboxProps {
  images: StrapiMedia[];
  thumbClassName?: string;
  gridClassName?: string;
}

export default function TripGalleryLightbox({ images, thumbClassName = '', gridClassName = '' }: TripGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const touchDataRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const open = useCallback((index: number) => setActiveIndex(index), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex(i => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setActiveIndex(i => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, close, next, prev]);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (activeIndex !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [activeIndex]);

  // Reset drag offset when image changes or closes
  useEffect(() => { setDragX(0); }, [activeIndex]);

  // Touch / swipe handlers (mobile navigation)
  const SWIPE_THRESHOLD = 50; // px
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchDataRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    setDragX(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDataRef.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - touchDataRef.current.x;
    const dy = t.clientY - touchDataRef.current.y;
    // Only show horizontal drag feedback if horizontal intent is stronger
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault(); // prevent vertical scroll bounce while swiping
      setDragX(dx);
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDataRef.current) return;
    const tData = touchDataRef.current;
    const dt = Date.now() - tData.time;
    const changed = e.changedTouches[0];
    const dx = changed.clientX - tData.x;
    const dy = changed.clientY - tData.y;
    touchDataRef.current = null;

    // Quick flicks can use a lower threshold based on time
    const velocityBoost = dt < 250 ? 0.6 : 1; // allow shorter swipe on quick flick
    const effectiveThreshold = SWIPE_THRESHOLD * velocityBoost;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > effectiveThreshold) {
      if (dx < 0) next(); else prev();
    }
    setDragX(0);
  };

  // Portal root (lazy to avoid SSR mismatch)
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Re-use existing portal root or create one
    let el = document.getElementById('overlay-root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'overlay-root';
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

  return (
    <>
      <div className={gridClassName}> 
        {images.map((img, index) => {
          const url = getMediaUrl(img);
          const attrs = extractMediaAttributes(img);
          return (
            <button
              key={attrs?.url ? `${attrs.url}-${index}` : index}
              type="button"
              onClick={() => open(index)}
              className={`relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${thumbClassName}`}
              aria-label={`Open image ${index + 1} of ${images.length}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {url ? (
                <Image
                  src={url}
                  alt={attrs?.alternativeText || 'Trip gallery image'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </div>

      {portalEl && activeIndex !== null && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={close}
            aria-label="Close lightbox"
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors text-3xl font-light"
          >
            &times;
          </button>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            className="relative w-[90vw] h-[70vh] max-w-5xl pointer-events-auto select-none"
            style={{
              transform: `translateX(${dragX}px)`,
              transition: dragX === 0 ? 'transform 0.25s ease' : 'none'
            }}
          >
            {(() => {
              const current = images[activeIndex];
              const url = getMediaUrl(current);
              const attrs = extractMediaAttributes(current);
              if (!url) return <div className="w-full h-full flex items-center justify-center text-white">No image</div>;
              const isVideo = url.endsWith('.mp4');
              return isVideo ? (
                <video
                  src={url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <Image
                  src={url}
                  alt={attrs?.alternativeText || `Image ${activeIndex + 1}`}
                  fill
                  sizes="100vw"
                  style={{ objectFit: 'contain' }}
                  priority
                  className="rounded-lg shadow-2xl"
                />
              );
            })()}
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 px-4 pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => open(i)}
                className={`w-3 h-3 rounded-full transition ${i === activeIndex ? 'bg-emerald-400 scale-110' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>,
        portalEl
      )}
    </>
  );
}
