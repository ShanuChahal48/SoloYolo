"use client";
import { useEffect } from 'react';

/**
 * Global intersection observer that activates scroll reveal animations
 * for any element with a data-reveal attribute.
 */
export default function ScrollRevealProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // let them all be visible by CSS override

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!elements.length) return;

    const options: IntersectionObserverInit = { root: null, rootMargin: '0px 0px -5% 0px', threshold: 0.15 };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          // Optional: per-element custom delay via data-reveal-delay="120"
          const delay = el.dataset.revealDelay;
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }
          el.classList.add('reveal-active');
          io.unobserve(el);
        }
      });
    }, options);

    elements.forEach(el => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
