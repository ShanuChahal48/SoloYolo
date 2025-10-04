"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global intersection observer that activates scroll reveal animations
 * for any element with a data-reveal attribute.
 */
export default function ScrollRevealProvider() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const reducedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reducedRef.current === null) {
      reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    if (reducedRef.current) {
      // Ensure all future elements are visible immediately
      document.querySelectorAll('[data-reveal]').forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add('reveal-active');
            observerRef.current?.unobserve(el);
          }
        });
      }, { root: null, rootMargin: '0px 0px -5% 0px', threshold: 0.15 });
    }

    // Scan only unrevealed elements on route change
    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.reveal-active)');
      nodes.forEach(n => observerRef.current?.observe(n));
    };
    scan();

    // Also crude MutationObserver for late-loaded chunks (e.g. suspense boundaries)
    const mo = new MutationObserver((muts) => {
      let needs = false;
      muts.forEach(m => {
        if (m.addedNodes.length) needs = true;
      });
      if (needs) scan();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
