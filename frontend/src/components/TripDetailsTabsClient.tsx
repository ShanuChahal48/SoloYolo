"use client";
import React from 'react';

type MaybeString = string | null | undefined;
type RteTextChild = { text?: string } | string;
type RteBlock = { type?: string; level?: number; children?: RteTextChild[] };

export type TripDetailsTabsProps = {
  overview?: MaybeString;
  highlights?: { label: string }[] | string[];
  itinerary?: MaybeString;
  itineraryDays?: Array<{ label: string; lines: string[]; summary?: string }>;
  inclusions?: MaybeString | string[];
  exclusions?: MaybeString | string[];
  otherInfo?: MaybeString | string[];
};

// Accepts: string | string[] | rich-text-like blocks and returns flat string lines
function asLines(v?: MaybeString | string[] | RteBlock[] | RteTextChild[]) {
  if (!v) return [] as string[];

  const pushIfText = (acc: string[], t?: unknown) => {
    if (!t) return;
    if (typeof t === 'string') {
      const parts = t.split(/\r?\n|•|\u2022|\t|\*/g).map((s) => s.trim()).filter(Boolean);
      if (parts.length) acc.push(...parts);
      return;
    }
  };

  const extract = (node: unknown, acc: string[]) => {
    if (!node) return;
    if (typeof node === 'string') {
      pushIfText(acc, node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((n) => extract(n, acc));
      return;
    }
    if (typeof node === 'object') {
      // Strapi RTE blocks: { type, children, level?, format? }
      const anyNode = node as Partial<RteBlock> & { text?: string };
      const type = anyNode?.type;
      const children = anyNode?.children;
      if (type === 'list' && Array.isArray(children)) {
        children.forEach((child: unknown) => extract(child, acc));
        return;
      }
      if (Array.isArray(children)) {
        // Gather all text from children into a single line
        const text = children
          .map((c: RteTextChild) => (typeof c === 'string' ? c : c?.text || ''))
          .join(' ')
          .trim();
        pushIfText(acc, text);
        return;
      }
      // Fallback: if node has a text property
      if (typeof anyNode.text === 'string') {
        pushIfText(acc, anyNode.text);
        return;
      }
    }
  };

  const out: string[] = [];
  extract(v as unknown, out);
  return out;
}

export default function TripDetailsTabsClient({ overview, highlights, itinerary, itineraryDays, inclusions, exclusions, otherInfo }: TripDetailsTabsProps) {
  const [tab, setTab] = React.useState<'overview' | 'itinerary' | 'inclusions' | 'exclusions' | 'other'>('overview');
  const [expanded, setExpanded] = React.useState(false);

  const highlightItems = Array.isArray(highlights)
    ? (highlights as (string | { label: string })[]).map((h) => (typeof h === 'string' ? h : h?.label)).filter(Boolean)
    : [];

  const overviewText = overview || '';
  const itineraryLines = asLines(itinerary);
  const inclusionLines = asLines(inclusions);
  const exclusionLines = asLines(exclusions);
  const otherLines = asLines(otherInfo);

  const TabButton = ({ id, label }: { id: typeof tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-5 py-3 rounded-md text-sm sm:text-base font-semibold transition-all ${
        tab === id ? 'bg-cyan-100 text-cyan-900 shadow' : 'bg-white/70 text-slate-700 hover:bg-white'
      }`}
    >
      {label}
    </button>
  );

  const Card: React.FC<React.PropsWithChildren<{ tone?: 'blue' | 'green' | 'red' | 'slate' }>> = ({ tone = 'slate', children }) => {
    const tones: Record<string, string> = {
      blue: 'from-cyan-50',
      green: 'from-emerald-50',
      red: 'from-rose-50',
      slate: 'from-slate-50',
    };
    return (
      <div className={`rounded-2xl border bg-gradient-to-b ${tones[tone]} to-white shadow-sm`}>{children}</div>
    );
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-white/70 backdrop-blur-md rounded-xl p-2 flex flex-wrap gap-2 mb-6">
        <TabButton id="overview" label="Overview & Highlights" />
        <TabButton id="itinerary" label="Itinerary" />
        <TabButton id="inclusions" label="Inclusions" />
        <TabButton id="exclusions" label="Exclusions" />
        <TabButton id="other" label="Other Info" />
      </div>

      {/* Panels */}
      {tab === 'overview' && (
        <Card tone="blue">
          <div className="p-6 sm:p-8">
            {highlightItems.length > 0 && (
              <div className="mb-6">
                <div className="rounded-xl border border-cyan-300/70 bg-white/70 px-4 py-3 font-semibold text-slate-800">
                  {highlightItems.join(' • ')}
                </div>
              </div>
            )}
            {overviewText && (
              <div>
                <p className={`text-slate-700 leading-relaxed ${expanded ? '' : 'line-clamp-6'}`}>{overviewText}</p>
                {overviewText.length > 360 && (
                  <button
                    className="mt-3 text-cyan-600 font-semibold hover:text-cyan-700"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'itinerary' && (
        <Card tone="blue">
          <div className="p-6 sm:p-8">
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
          </div>
        </Card>
      )}

      {tab === 'inclusions' && (
        <Card tone="green">
          <div className="p-6 sm:p-8">
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
          </div>
        </Card>
      )}

      {tab === 'exclusions' && (
        <Card tone="red">
          <div className="p-6 sm:p-8">
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
          </div>
        </Card>
      )}

      {tab === 'other' && (
        <Card tone="slate">
          <div className="p-6 sm:p-8">
            {otherLines.length > 0 ? (
              <ul className="space-y-3">
                {otherLines.map((line, i) => (
                  <li key={i} className="list-disc list-inside text-slate-700 leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">Additional information will be shared soon.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
