"use client";
import React from 'react';

type MaybeString = string | null | undefined;
type RteTextChild = { text?: string } | string;
type RteBlock = { type?: string; level?: number; children?: RteTextChild[] };

export type TripDetailsSectionsProps = {
  overview?: MaybeString | RteBlock[]; // allow rich-text blocks
  highlights?: { label: string }[] | string[];
  itinerary?: MaybeString;
  itineraryDays?: Array<{ label: string; lines: string[]; summary?: string }>;
  inclusions?: MaybeString | string[] | RteBlock[];
  exclusions?: MaybeString | string[] | RteBlock[];
  otherInfo?: MaybeString | string[] | RteBlock[]; // allow rich-text blocks
};

function asLines(v?: MaybeString | string[] | RteBlock[]) {
  if (!v) return [] as string[];

  const splitPush = (acc: string[], s: string) => {
    s.split(/\r?\n|•|\u2022|\t|\*/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => acc.push(t));
  };

  const nodeText = (node: RteBlock | RteTextChild | RteBlock[] | undefined): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return (node as (RteBlock | RteTextChild)[]).map(nodeText).join(' ');
    if (typeof node === 'object') {
      const kids = Array.isArray((node as RteBlock).children) ? (node as RteBlock).children! : [];
      if (!kids.length) return (typeof (node as { text?: string }).text === 'string' ? (node as { text?: string }).text as string : '');
      return kids.map(nodeText).join(' ');
    }
    return '';
  };

  const extract = (node: unknown, acc: string[]) => {
    if (!node) return;
    if (typeof node === 'string') { splitPush(acc, node); return; }
    if (Array.isArray(node)) { node.forEach((n) => extract(n, acc)); return; }
    if (typeof node === 'object') {
      const type = (node as { type?: string }).type;
      const children = Array.isArray((node as RteBlock).children) ? (node as RteBlock).children! : [];
      if (type === 'list' && children.length) {
        // Each list item becomes its own line
        children.forEach((li) => {
          const txt = nodeText(li as RteBlock | RteTextChild).trim();
          if (txt) splitPush(acc, txt);
        });
        return;
      }
      // Headings/paragraphs: push as a single line
      const txt = nodeText(node as RteBlock).trim();
      if (txt) splitPush(acc, txt);
      return;
    }
  };

  const out: string[] = [];
  extract(v as unknown, out);
  return out;
}

const Section: React.FC<React.PropsWithChildren<{ id: string; title: string; tone?: 'blue'|'green'|'red'|'slate' }>> = ({ id, title, tone='slate', children }) => {
  const tones: Record<string,string> = {
    blue: 'from-cyan-50',
    green: 'from-emerald-50',
    red: 'from-rose-50',
    slate: 'from-slate-50',
  };
  const revealRef = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          break;
        }
      }
    }, { root: null, threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section id={id} className="scroll-mt-28 mb-6">
      <h3 className="mb-3 text-xl md:text-2xl font-bold text-white">{title}</h3>
      <div ref={revealRef} className={`${visible ? 'opacity-100 animate-fade-in-up' : 'opacity-0 translate-y-4'} transition-all duration-700 will-change-transform will-change-opacity`}>
        <div className={`rounded-2xl border bg-gradient-to-b ${tones[tone]} to-white shadow-sm`}>
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

type SectionId = 'overview'|'itinerary'|'inclusions'|'exclusions'|'other';

export default function TripDetailsSectionsStacked({ overview, highlights, itinerary, itineraryDays, inclusions, exclusions, otherInfo }: TripDetailsSectionsProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [active, setActive] = React.useState<SectionId>('overview');

  const ids = React.useMemo(() => (
    [
      { id: 'overview', label: 'Overview & Highlights' },
      { id: 'itinerary', label: 'Itinerary' },
      { id: 'inclusions', label: 'Inclusions' },
      { id: 'exclusions', label: 'Exclusions' },
      { id: 'other', label: 'Other Info' },
    ] as const
  ), []);

  React.useEffect(() => {
    const sections = ids.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    // Helper to set active based on current scroll even before observer fires
    const setByScroll = () => {
      const headerOffset = 100; // px
      let current: HTMLElement | null = null;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top - headerOffset <= 0) {
          current = el; // last one above the header
        } else {
          break;
        }
      }
      if (!current) current = sections[0];
  setActive((current?.id as SectionId) || 'overview');
    };
    setByScroll();

    const obs = new IntersectionObserver((entries) => {
      // Prefer the section nearest to the top edge within the viewport
      const topMost = entries
        .slice()
        .sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (topMost && topMost.isIntersecting) {
        setActive(topMost.target.id as SectionId);
      } else {
        setByScroll();
      }
    }, { root: null, threshold: [0.3, 0.6], rootMargin: '-15% 0px -70% 0px' });
    sections.forEach(el => obs.observe(el));
    window.addEventListener('scroll', setByScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('scroll', setByScroll); };
  }, [ids]);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = 96; // accounts for site header + sticky tab height
    const rect = el.getBoundingClientRect();
    const y = window.scrollY + rect.top - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const highlightItems = Array.isArray(highlights)
    ? (highlights as (string | { label: string })[]).map((h) => (typeof h === 'string' ? h : h?.label)).filter(Boolean)
    : [];
  // Overview can be string or Strapi blocks
  const looksLikeBlock = (n: unknown): n is RteBlock => !!n && typeof n === 'object' && 'type' in (n as Record<string, unknown>);
  const overviewBlocks = Array.isArray(overview) && overview.length > 0 && looksLikeBlock(overview[0]) ? (overview as RteBlock[]) : undefined;
  const overviewText = typeof overview === 'string' ? overview : '';
  const itineraryLines = asLines(itinerary);
  const inclusionLines = asLines(inclusions);
  const exclusionLines = asLines(exclusions);
  // Detect if otherInfo is Strapi blocks
  const otherBlocks = Array.isArray(otherInfo) && (otherInfo as unknown[]).length > 0 && looksLikeBlock((otherInfo as unknown[])[0]) ? (otherInfo as RteBlock[]) : undefined;
  const otherLines = otherBlocks ? [] : asLines(otherInfo);

  // Minimal rich renderer for Strapi blocks: preserves headings and lists
  const textFrom = (node: RteBlock | RteTextChild | RteBlock[] | undefined): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return (node as (RteBlock | RteTextChild)[]).map(textFrom).join(' ');
    if (typeof node === 'object') {
      const kids = Array.isArray((node as RteBlock).children) ? (node as RteBlock).children! : [];
      if (!kids.length) return typeof (node as { text?: string }).text === 'string' ? ((node as { text?: string }).text as string) : '';
      return kids.map(textFrom).join(' ');
    }
    return '';
  };

  const Heading = ({ level = 3, children }: { level?: number; children: React.ReactNode }) => {
    const cls = 'mt-4 mb-2 font-bold text-slate-800';
    // Slightly larger so H1/H2 in overview feel prominent
    const sizes: Record<number, string> = { 1: 'text-3xl md:text-4xl', 2: 'text-2xl md:text-3xl', 3: 'text-xl md:text-2xl', 4: 'text-lg', 5: 'text-lg', 6: 'text-base' };
    return <h4 className={`${cls} ${sizes[level] || 'text-lg'}`}>{children}</h4>;
  };

  const renderBlockNode = (node: RteBlock, i: number): React.ReactNode => {
    if (!node) return null;
    const type = node.type;
    if (type === 'heading') {
      const level = typeof node.level === 'number' ? node.level : 3;
      return <Heading key={i} level={level}>{textFrom(node)}</Heading>;
    }
    if (type === 'list') {
      const items = Array.isArray(node.children) ? node.children : [];
      return (
        <ul key={i} className="space-y-2">
          {items.map((li, idx: number) => (
            <li key={idx} className="list-disc list-inside text-slate-700 leading-relaxed">{textFrom(li)}</li>
          ))}
        </ul>
      );
    }
    // paragraph or anything else
    const txt = textFrom(node);
    if (txt) return <p key={i} className="text-slate-700 leading-relaxed">{txt}</p>;
    return null;
  };

  return (
    <div className="w-full">
      {/* Sticky scroll-spy header */}
      <div className="sticky top-0 md:top-0 z-50 mb-6">
        <nav className="fancy-header mx-auto w-full rounded-full bg-white/95 px-4 py-2 md:px-5 md:py-3 shadow-[0_6px_22px_rgba(0,0,0,0.12)] ring-1 ring-cyan-100 backdrop-blur">
          <ul className="flex flex-wrap items-center justify-between gap-x-4 md:gap-x-6 gap-y-2 text-sm md:text-base font-bold text-slate-900">
            {ids.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => handleJump(t.id)}
                  className={`relative px-3 py-1 md:px-4 md:py-1.5 rounded-full transition-colors hover:bg-slate-50 ${active === t.id ? 'text-cyan-700 bg-cyan-50 ring-1 ring-cyan-200 shadow-sm' : 'text-slate-700'}`}
                >
                  {t.label}
                  <span className={`absolute left-3 right-3 -bottom-0.5 h-1 md:h-1.5 origin-left rounded bg-cyan-500 transition-all duration-300 ${active === t.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Section id="overview" title="Overview & Highlights" tone="blue">
        {highlightItems.length > 0 && (
          <div className="mb-6">
            <div className="rounded-xl border border-cyan-300/70 bg-white/70 px-4 py-3 font-semibold text-slate-800">
              {highlightItems.join(' • ')}
            </div>
          </div>
        )}
        {overviewBlocks ? (
          <div className="space-y-2">
            {overviewBlocks.map((n, i) => renderBlockNode(n, i))}
          </div>
        ) : overviewText ? (
          <div>
            <p className={`text-slate-700 leading-relaxed ${showAll ? '' : 'line-clamp-6'}`}>{overviewText}</p>
            {overviewText.length > 360 && (
              <button className="mt-3 text-cyan-600 font-semibold hover:text-cyan-700" onClick={() => setShowAll(v => !v)}>
                {showAll ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        ) : null}
      </Section>

      <Section id="itinerary" title="Itinerary" tone="blue">
        {Array.isArray(itineraryDays) && itineraryDays.length > 0 ? (
          <div className="space-y-4">
            {itineraryDays.map((day, idx) => (
              <details key={idx} className="group rounded-xl border bg-white/70 open:bg-cyan-50/60">
                <summary className="cursor-pointer list-none px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-cyan-100 px-4 sm:px-5 py-1.5 text-sm sm:text-base font-semibold text-cyan-800">Day {idx + 1}</span>
                    <span className="text-slate-800 font-semibold">{day.label}</span>
                  </div>
                  <svg className="h-5 w-5 text-cyan-700 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
                </summary>
                <div className="px-5 pb-5">
                  {day.summary && <p className="mb-3 text-slate-700">{day.summary}</p>}
                  {day.lines?.length ? (
                    <ul className="space-y-2">
                      {day.lines.map((l, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">•</span>
                          <span className="text-slate-700 leading-relaxed">{l}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : itineraryLines.length > 0 ? (
          <ul className="space-y-3">
            {itineraryLines.map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">•</span>
                <span className="text-slate-700 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Itinerary details will be shared soon.</p>
        )}
      </Section>

      <Section id="inclusions" title="Inclusions" tone="green">
        {inclusionLines.length > 0 ? (
          <ul className="space-y-3">
            {inclusionLines.map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                <span className="text-slate-700 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Inclusions will be shared soon.</p>
        )}
      </Section>

      <Section id="exclusions" title="Exclusions" tone="red">
        {exclusionLines.length > 0 ? (
          <ul className="space-y-3">
            {exclusionLines.map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">✕</span>
                <span className="text-slate-700 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Exclusions will be shared soon.</p>
        )}
      </Section>

      <Section id="other" title="Other Info" tone="slate">
        {otherBlocks ? (
          <div className="space-y-2">
            {(otherBlocks as RteBlock[]).map((n, i) => renderBlockNode(n, i))}
          </div>
        ) : otherLines.length > 0 ? (
          <ul className="space-y-3">
            {otherLines.map((line, i) => (
              <li key={i} className="list-disc list-inside text-slate-700 leading-relaxed">{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">Additional information will be shared soon.</p>
        )}
      </Section>
      {/* Animated theme for header background */}
      <style jsx>{`
        .fancy-header {
          /* Fallback for older browsers */
          background-image: linear-gradient(90deg, rgba(59,130,246,0.06), rgba(16,185,129,0.06));
          /* Use brand tokens when supported */
          background-image: linear-gradient(
            90deg,
            color-mix(in srgb, var(--color-cyan-500) 6%, transparent),
            color-mix(in srgb, var(--color-emerald-500) 6%, transparent)
          );
          background-size: 200% 100%;
          animation: header-pan 12s linear infinite;
        }
        @keyframes header-pan {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  );
}
