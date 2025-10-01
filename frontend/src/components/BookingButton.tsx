"use client";
import React, { useEffect, useState } from 'react';
import { resolveLogoutWorldUrl, externalBookingEnabled } from '@/lib/logoutWorld';

interface BookingButtonProps {
  title: string;
  internalSlug?: string;
  className?: string;
  /** If provided (from Strapi booking_url) we skip guessing & HEAD validation */
  directUrl?: string;
}

type Status = 'idle' | 'checking' | 'ok' | 'fallback' | 'disabled' | 'error';

export const BookingButton: React.FC<BookingButtonProps> = ({ title, internalSlug, className, directUrl }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [targetUrl, setTargetUrl] = useState<string>('');
  // searchUrl no longer separately stored; we only keep the active targetUrl

  useEffect(() => {
    // If a directUrl is supplied we trust it & bypass remote checks.
    if (directUrl) {
      const normalized = directUrl.startsWith('http') ? directUrl : `https://${directUrl.replace(/^\/+/, '')}`;
      setTargetUrl(normalized);
      setStatus('ok');
      return;
    }

    if (!externalBookingEnabled()) {
      setStatus('disabled');
      return;
    }
  const { candidate, searchUrl: sUrl } = resolveLogoutWorldUrl({ title, internalSlug });
    setTargetUrl(candidate);
    setStatus('checking');

    // HEAD request to validate candidate. If 404 -> fallback to searchUrl.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    fetch(candidate, { method: 'HEAD', signal: controller.signal })
      .then(res => {
        if (res.ok) {
          setStatus('ok');
        } else if (res.status === 404) {
          setTargetUrl(sUrl);
          setStatus('fallback');
        } else {
          setStatus('ok'); // assume still usable
        }
      })
      .catch(() => {
        // Network / CORS / abort => fallback silently
        setTargetUrl(sUrl);
        setStatus('fallback');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title, internalSlug, directUrl]);

  const label = (() => {
    switch (status) {
      case 'disabled':
        return 'External Booking Disabled';
      case 'checking':
        return 'Checking Availability…';
      case 'fallback':
        return 'Find & Book';
      default:
        return 'Book Now';
    }
  })();

  const handleClick = () => {
    if (status === 'disabled') return;
    window.dispatchEvent(new CustomEvent('external-booking-click', { detail: { title, internalSlug, url: targetUrl, status } }));
  };

  if (status === 'disabled') {
    return (
      <button
        type="button"
        disabled
        className={`w-full inline-flex items-center justify-center bg-gray-300 text-gray-600 font-semibold py-4 px-6 rounded-xl text-lg cursor-not-allowed ${className || ''}`}
      >
        {label}
      </button>
    );
  }

  return (
    <a
      href={targetUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`w-full inline-flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold py-4 px-6 rounded-xl text-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover-lift focus:outline-none focus:ring-4 focus:ring-teal-500/40 ${status === 'checking' ? 'opacity-80' : ''} ${className || ''}`}
      aria-busy={status === 'checking'}
    >
      {label}
      {status === 'checking' && (
        <span className="ml-3 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
      )}
    </a>
  );
};

export default BookingButton;
