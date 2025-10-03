"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TripEnquiryProps {
  tripTitle: string;
  tripSlug?: string | null;
  buttonClassName?: string;
}

interface EnquiryState {
  name: string;
  email: string;
  phone: string;
  message: string;
  callback: boolean;
}

const initialState: EnquiryState = { name: "", email: "", phone: "", message: "", callback: false };

export default function TripEnquiry({ tripTitle, tripSlug, buttonClassName }: TripEnquiryProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EnquiryState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; message: string; devFallback?: boolean }>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setStatus(null);
      setForm(initialState);
      setSubmitting(false);
    }, 300);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus(null);
    try {
      if (!form.name || !form.email) {
        setStatus({ ok: false, message: "Name & email required" });
        setSubmitting(false);
        return;
      }
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle,
          tripSlug,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          callback: form.callback,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, message: data.error || 'Failed to send' });
      } else {
        setStatus({ ok: true, message: 'Enquiry sent successfully!', devFallback: data.devFallback });
        // keep form but disable? Up to UX. We'll clear after success.
        setForm(initialState);
      }
    } catch (err) {
      setStatus({ ok: false, message: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Validation:
  // - Name, email, phone always required
  // - Message required unless callback requested (user might just want a call back)
  const emailOk = /.+@.+\..+/.test(form.email.trim());
  const baseFieldsOk = form.name.trim() && form.email.trim() && form.phone.trim();
  const messageOk = form.callback ? true : Boolean(form.message.trim());
  const formValid = Boolean(baseFieldsOk && messageOk && emailOk);

  // Scroll lock while modal open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const modal = open ? (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center isolate">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity" onClick={close} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.35)] p-6 md:p-7 animate-fade-in-up border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-snug break-words">Enquire about <span className="font-bold text-gray-950">{tripTitle}</span></h3>
              <button aria-label="Close" onClick={close} className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded p-1 transition" disabled={submitting}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Name *</label>
                  <input name="name" value={form.name ?? ''} onChange={onChange} required disabled={submitting} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Email *</label>
                  <input type="email" name="email" value={form.email ?? ''} onChange={onChange} required disabled={submitting} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-1">Phone *</label>
                <input name="phone" value={form.phone ?? ''} onChange={onChange} required disabled={submitting} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input id="callback" name="callback" type="checkbox" checked={form.callback} onChange={onChange} disabled={submitting} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <label htmlFor="callback" className="text-sm font-medium text-gray-800 select-none">Expecting a callback?</label>
                </div>
                <label className="block text-sm font-medium text-gray-800 mb-1 mt-2">Message {form.callback ? '(optional)' : '*'} </label>
                <textarea name="message" value={form.message ?? ''} onChange={onChange} rows={4} disabled={submitting} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-gray-900 placeholder-gray-400" placeholder={form.callback ? 'Add any details you want us to know (optional)' : 'Tell us more about your interest'} />
              </div>
              {status && (
                <div className={`text-sm rounded-md px-3 py-2 ${status.ok ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}> 
                  {status.message}
                  {status.devFallback && status.ok && <span className="block text-xs mt-1 opacity-70">(Dev fallback: email not actually sent)</span>}
                </div>
              )}
              {!status && !formValid && (
                <p className="text-xs text-gray-500">Fill required fields (message optional if requesting a callback) with a valid email.</p>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={close} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-teal-500/50" disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting || !formValid} className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold shadow hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                  {submitting && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonClassName || 'w-full bg-gray-100 text-gray-800 font-bold py-4 px-6 rounded-xl text-lg hover:bg-gray-200 transition-all duration-300 hover-lift'}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Enquire
      </button>
      {typeof window !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  );
}
