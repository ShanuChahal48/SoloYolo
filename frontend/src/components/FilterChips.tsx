"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface Props {
  initial?: Record<string, string | undefined>;
  resultsCount?: number;
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-slate-100 border border-white/20">
      {label}
      <button type="button" onClick={onClear} aria-label={`Clear ${label}`} className="rounded-full bg-white/20 hover:bg-white/30 w-5 h-5 flex items-center justify-center">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </span>
  );
}

export default function FilterChips({ initial, resultsCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = new URLSearchParams(sp?.toString());

  // Merge initial for SSR fallback
  if (initial) {
    for (const [k, v] of Object.entries(initial)) {
      if (v && !query.get(k)) query.set(k, v);
    }
  }

  const destination = query.get('destination') || '';
  const from = query.get('from') || '';
  const to = query.get('to') || '';
  const guests = query.get('guests') || '';

  const chips: Array<{ key: string; label: string }> = [];
  if (destination) chips.push({ key: 'destination', label: `Destination: ${destination}` });
  if (from) chips.push({ key: 'from', label: `From: ${from}` });
  if (to) chips.push({ key: 'to', label: `To: ${to}` });
  if (guests) chips.push({ key: 'guests', label: `Guests: ${guests}` });

  const clearKey = (key: string) => {
    const next = new URLSearchParams(query.toString());
    next.delete(key);
    const search = next.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  };
  const clearAll = () => router.push(pathname);

  if (chips.length === 0) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur rounded-xl border border-white/10 px-3 sm:px-4 py-3">
        {chips.map((c) => (
          <Chip key={c.key} label={c.label} onClear={() => clearKey(c.key)} />
        ))}
        <div className="ml-auto flex items-center gap-3">
          {typeof resultsCount === 'number' && (
            <span className="text-sm text-slate-200/80">{resultsCount} result{resultsCount === 1 ? '' : 's'}</span>
          )}
          <button type="button" onClick={clearAll} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-slate-100 border border-white/20 hover:bg-white/20">
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
