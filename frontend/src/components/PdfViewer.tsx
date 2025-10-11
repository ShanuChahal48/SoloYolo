/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { pdfjs } from 'react-pdf';

// Configure pdf.js worker to a CDN absolute URL so the browser doesn't try to resolve 'pdf.worker.mjs' relative to route
pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

// Import from react-pdf directly (dynamically) for client-side rendering
const Document = dynamic(async () => (await import('react-pdf')).Document, { ssr: false });
const Page = dynamic(async () => (await import('react-pdf')).Page, { ssr: false });

export type PdfViewerProps = {
  url: string;
  className?: string;
  height?: number | string;
  onErrorLink?: string; // optional Download link if render fails
};

export default function PdfViewer({ url, className, height = 600, onErrorLink }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);

  // Prepare candidate URLs: try the original first, then a raw/upload variant (Cloudinary) if applicable
  const candidates: string[] = React.useMemo(() => {
    const arr = [url];
    try {
      const u = new URL(url);
      if (u.hostname.includes('res.cloudinary.com') && u.pathname.toLowerCase().endsWith('.pdf') && u.pathname.includes('/image/upload/')) {
        const rawUrl = url.replace('/image/upload/', '/raw/upload/');
        if (rawUrl !== url) arr.push(rawUrl);
      }
    } catch {
      // ignore invalid URL
    }
    return arr;
  }, [url]);

  const makeProxy = (u: string) => `/api/pdf-proxy?url=${encodeURIComponent(u)}`;
  const firstCandidate = candidates[0];
  const firstProxied = makeProxy(firstCandidate);

  // Fetch PDF bytes client-side to avoid CORS/headers issues inside pdf.js
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setDataSource(null);
      // Try each candidate: proxy first, then direct
      for (const candidate of candidates) {
        try {
          const res = await fetch(makeProxy(candidate), { headers: { Accept: 'application/pdf' } });
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (!cancelled) {
              setDataSource(new Uint8Array(buf));
              setLoading(false);
              return;
            }
          }
        } catch {
          // fall through to direct
        }
        try {
          const res2 = await fetch(candidate, { mode: 'cors', headers: { Accept: 'application/pdf' } });
          if (res2.ok) {
            const buf2 = await res2.arrayBuffer();
            if (!cancelled) {
              setDataSource(new Uint8Array(buf2));
              setLoading(false);
              return;
            }
          }
        } catch {
          // try next candidate
        }
      }
      // If all candidates failed
      if (!cancelled) {
        setError('Failed to load PDF');
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  // Keep PDF page width in sync with available container width to avoid horizontal clipping
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    let frame = 0;
    let last = -1;
    const updateWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = el.clientWidth;
        // Avoid tight loops from tiny resize diffs while canvas lays out
        if (Math.abs(w - last) >= 2) {
          setPageWidth(w);
          last = w;
        }
      });
    };
    updateWidth();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateWidth);
      ro.observe(el);
    } else {
      window.addEventListener('resize', updateWidth);
    }
    return () => {
      cancelAnimationFrame(frame);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateWidth);
    };
  }, []);

  function onDocumentLoadSuccess(doc: any) {
    setNumPages(doc.numPages);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message || 'Failed to load PDF');
  }

  // Memoize the file prop so <Document /> doesn't see a new object each render
  const fileSource = React.useMemo(() => (dataSource ? { data: dataSource } : undefined), [dataSource]);

  return (
  <div className={className} style={{ height }}>
      {error ? (
        <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-slate-200">
          {/* Fallback embed via same-origin proxy, then Google Docs as absolute last resort */}
          <object data={firstProxied} type="application/pdf" className="w-full h-full">
            <iframe
              title="Trip Brochure"
              src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`}
              className="w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 border-t text-slate-700 flex items-center justify-between">
              <span>We could not render the PDF with the built-in viewer.</span>
              {onErrorLink ? (
                <a className="text-cyan-700 underline" href={onErrorLink} target="_blank" rel="noopener noreferrer">Open the brochure</a>
              ) : null}
            </div>
          </object>
        </div>
      ) : loading ? (
        <div className="w-full h-full flex items-center justify-center text-slate-600">Loading brochure…</div>
      ) : dataSource ? (
        <div ref={scrollContainerRef} className="w-full h-full overflow-auto overflow-x-hidden bg-white rounded-lg">
          <Document
            file={fileSource!}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="w-full h-full flex items-center justify-center text-slate-600">Loading brochure…</div>}
            error={<div className="w-full h-full flex items-center justify-center text-slate-600">Failed to load brochure.</div>}
          >
            {Array.from(new Array(numPages || 1), (_el, index) => (
              <div key={`page_${index + 1}`} className="flex justify-center py-4">
                  <Page
                    pageNumber={index + 1}
                    width={(pageWidth ? Math.max(0, pageWidth - 12) : 800)}
                    className="max-w-full h-auto"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        </div>
      ) : null}
    </div>
  );
}
