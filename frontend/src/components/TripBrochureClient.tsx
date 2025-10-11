"use client";

import React from 'react';
import PdfViewer from '@/components/PdfViewer';

export default function TripBrochureClient({ embedUrl, downloadUrl }: { embedUrl: string; downloadUrl: string }) {
  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 h-[70vh] md:h-[72vh] lg:h-[70vh]">
      <PdfViewer url={embedUrl} className="w-full h-full" height="100%" onErrorLink={downloadUrl} />
    </div>
  );
}
