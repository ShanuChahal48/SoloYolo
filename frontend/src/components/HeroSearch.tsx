"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isValid, parseISO, startOfToday } from 'date-fns';
import { createPortal } from 'react-dom';

export default function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [guests, setGuests] = useState(1);
  const [openRange, setOpenRange] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverRect, setPopoverRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const guestsFieldRef = useRef<HTMLDivElement | null>(null);
  const guestsPopoverRef = useRef<HTMLDivElement | null>(null);
  const [guestsPopoverRect, setGuestsPopoverRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const startDate = useMemo(()=> (from ? (isValid(parseISO(from)) ? parseISO(from) : undefined) : undefined), [from]);
  const endDate = useMemo(()=> (to ? (isValid(parseISO(to)) ? parseISO(to) : undefined) : undefined), [to]);
  const label = useMemo(()=>{
    if (startDate && endDate) return `${format(startDate, 'EEE, MMM d')} - ${format(endDate, 'EEE, MMM d')}`;
    if (startDate) return `${format(startDate, 'EEE, MMM d')} – Pick end`;
    return 'Select dates';
  }, [startDate, endDate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
  // Only include guests if user changed it from default (1)
  if (guests > 1) params.set('guests', String(guests));
    router.push(`/trips?${params.toString()}`);
  };

  // Keep the popover positioned relative to the date field, even when scrolling/resizing
  useEffect(() => {
    if (!openRange) return;

    const updatePosition = () => {
      const el = dateFieldRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const desiredMin = 720; // target width for two months side-by-side
      const viewW = window.innerWidth;
      const gutter = 16;
      const width = Math.min(Math.max(rect.width, desiredMin), viewW - gutter * 2);
      // Center under the date field
      let left = rect.left + rect.width / 2 - width / 2;
      if (left + width + gutter > viewW) {
        left = viewW - width - gutter;
      }
      if (left < gutter) left = gutter;
      setPopoverRect({ left, top: rect.bottom + 8, width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [openRange]);

  // Close on outside click or Escape (both popovers)
  useEffect(() => {
    if (!openRange && !openGuests) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (openRange) {
        if (
          target &&
          !popoverRef.current?.contains(target) &&
          !dateFieldRef.current?.contains(target)
        ) {
          setOpenRange(false);
        }
      }
      if (openGuests) {
        if (
          target &&
          !guestsPopoverRef.current?.contains(target) &&
          !guestsFieldRef.current?.contains(target)
        ) {
          setOpenGuests(false);
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenRange(false);
        setOpenGuests(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openRange, openGuests]);

  // Keep the guests popover positioned under its field
  useEffect(() => {
    if (!openGuests) return;
    const updatePosition = () => {
      const el = guestsFieldRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewW = window.innerWidth;
      const gutter = 16;
      const width = Math.min(Math.max(rect.width, 320), viewW - gutter * 2);
      let left = rect.left + rect.width / 2 - width / 2;
      if (left + width + gutter > viewW) left = viewW - width - gutter;
      if (left < gutter) left = gutter;
      setGuestsPopoverRect({ left, top: rect.bottom + 8, width });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [openGuests]);

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-6xl mx-auto bg-white md:bg-white/85 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-2xl ring-1 ring-slate-200"
      aria-label="Search trips"
    >
  <div className="flex flex-col md:flex-row items-stretch gap-3 relative">
        <div className="flex-1 relative">
          <label htmlFor="search-destination" className="sr-only">Destination</label>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <input
              type="text"
              id="search-destination"
              value={destination}
              onChange={(e)=>setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              className="w-full h-12 rounded-full border border-slate-300 pl-11 pr-4 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
        </div>
        {/* Unified: Date range field with full calendar popover (all devices) */}
  <div className="flex-1 relative" ref={dateFieldRef}>
          <button
            type="button"
            onClick={()=>setOpenRange((v)=>!v)}
            className="w-full h-12 rounded-full border border-slate-300 px-4 bg-white text-slate-900 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-expanded={openRange}
            aria-controls="date-range-popover"
            aria-label="Dates"
          >
            <span className="inline-flex items-center gap-2 text-left truncate">
              <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span className="truncate">{label}</span>
            </span>
            <svg className={`w-5 h-5 text-slate-500 transition-transform ${openRange ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          {openRange && popoverRect && typeof window !== 'undefined' && createPortal(
            <div
              className="w-full h-12 rounded-full border border-slate-300 px-4 bg-white text-slate-900 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500"
              ref={popoverRef}
              style={{ position: 'fixed', left: popoverRect.left, top: popoverRect.top, width: popoverRect.width, zIndex: 1000 }}
            >
              <div className="rounded-xl border border-slate-200 bg-white shadow-2xl p-4 text-slate-900 relative">
                <DayPicker
                  mode="range"
                  selected={startDate && endDate ? { from: startDate, to: endDate } : startDate ? { from: startDate } : undefined}
                  onSelect={(range)=>{
                    const f = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
                    const t = range?.to ? format(range.to, 'yyyy-MM-dd') : '';
                    setFrom(f); setTo(t);
                  }}
                  numberOfMonths={2}
                  defaultMonth={startDate || new Date()}
                  ISOWeek
                  disabled={{ before: startOfToday() }}
                  className="rdp rdp-book text-slate-900"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button type="button" onClick={()=>{ setFrom(''); setTo(''); }} className="h-10 px-3 rounded-lg border border-slate-300 text-slate-700">Clear</button>
                  <button type="button" onClick={()=>setOpenRange(false)} className="h-10 px-4 rounded-lg bg-cyan-600 text-white">Apply</button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
          {/* Guests pill */}
          <div className="flex-1 relative" ref={guestsFieldRef}>
            <button
              type="button"
              onClick={()=>{ setOpenGuests((v)=>!v); setOpenRange(false); }}
              className="w-full h-12 rounded-full border border-slate-300 pl-11 pr-8 bg-white/95 backdrop-blur text-slate-900 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-expanded={openGuests}
              aria-controls="guests-popover"
              aria-label="Guests"
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 21a4.5 4.5 0 0 1 9 0"/><circle cx="10" cy="8" r="4"/><path d="M16 21v-2a4 4 0 0 1 4-4"/><path d="M17 3a4 4 0 0 1 0 8"/></svg>
              </span>
              <span className="truncate text-left">{guests} {guests === 1 ? 'Adult' : 'Adults'}</span>
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-transform ${openGuests ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>
            {openGuests && guestsPopoverRect && typeof window !== 'undefined' && createPortal(
              <div
                id="guests-popover"
                ref={guestsPopoverRef}
                style={{ position: 'fixed', left: guestsPopoverRect.left, top: guestsPopoverRect.top, width: guestsPopoverRect.width, zIndex: 1000 }}
              >
                <div className="rounded-xl border border-slate-200 bg-white shadow-2xl p-4 text-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-700 font-medium">Adults</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={()=>setGuests((g)=>Math.max(1, g-1))} className="w-9 h-9 rounded-full border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-50" aria-label="Decrease adults">–</button>
                      <span className="w-8 text-center tabular-nums">{guests}</span>
                      <button type="button" onClick={()=>setGuests((g)=>g+1)} className="w-9 h-9 rounded-full border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-50" aria-label="Increase adults">+</button>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={()=>setOpenGuests(false)} className="h-10 px-4 rounded-lg bg-cyan-600 text-white">Apply</button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Search icon-only button */}
          <div className="flex-none flex justify-center md:justify-start w-full md:w-auto">
            <button type="submit" className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/40">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            </button>
          </div>
      </div>
    </form>
  );
}
