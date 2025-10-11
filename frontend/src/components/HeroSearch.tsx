"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [guests, setGuests] = useState(1);

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

  return (
    <form onSubmit={onSubmit} className="w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 shadow-xl">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
        <input
          type="text"
          value={destination}
          onChange={(e)=>setDestination(e.target.value)}
          placeholder="Where to?"
          className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="min-w-[180px]">
        <label className="block text-xs font-semibold text-slate-700 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e)=>setFrom(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="min-w-[180px]">
        <label className="block text-xs font-semibold text-slate-700 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e)=>setTo(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Guests</label>
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(e)=>setGuests(parseInt(e.target.value||'1',10))}
          className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="ml-auto">
        <button type="submit" className="h-12 w-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/40">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </button>
      </div>
    </form>
  );
}
