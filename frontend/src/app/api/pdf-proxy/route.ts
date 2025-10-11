import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'res.cloudinary.com',
  'localhost',
  '127.0.0.1',
  'soloyolo.onrender.com',
]);

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  const range = req.headers.get('range') || undefined;
  const referer = req.headers.get('referer') || undefined;
  const upstream = await fetch(parsed.toString(), {
    method: 'GET',
    headers: {
      ...(range ? { Range: range } : {}),
      'Accept': 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'identity',
      // Present a browser-like UA; some CDNs behave differently
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      ...(referer ? { Referer: referer } : {}),
    },
    // Let Next cache for a short duration; PDFs rarely change
    next: { revalidate: 300 },
  });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Upstream fetch failed', status: upstream.status }, { status: upstream.status || 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'application/pdf';
  const cache = upstream.headers.get('cache-control') || 'public, max-age=300, immutable';
  const contentLength = upstream.headers.get('content-length') || undefined;
  const contentRange = upstream.headers.get('content-range') || undefined;
  const acceptRanges = upstream.headers.get('accept-ranges') || undefined;

  return new NextResponse(upstream.body, {
    status: upstream.status, // Preserve 206 Partial Content when ranged
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cache,
      ...(contentLength ? { 'Content-Length': contentLength } : {}),
      ...(contentRange ? { 'Content-Range': contentRange } : {}),
      ...(acceptRanges ? { 'Accept-Ranges': acceptRanges } : {}),
    }
  });
}
