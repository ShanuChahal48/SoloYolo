// SEO helper utilities
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith('http')) return path;
  return SITE_URL.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
}

export function excerpt(raw: string | null | undefined, max = 160): string {
  if (!raw) return '';
  const text = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ') // strip HTML tags
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // markdown links => text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // entities
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export function buildOgImageFallback(): string {
  // In a real system you might generate a dynamic OG image. Placeholder for now.
  return absoluteUrl('/home.jpg');
}

export function siteDefaults() {
  const name = 'Solo Yolo';
  const description = 'Offbeat, curated journeys for modern explorers. Discover trips, stories and a vibrant travel community.';
  return { name, description };
}

export function orgJsonLd() {
  const { name, description } = siteDefaults();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: SITE_URL,
    description,
    logo: absoluteUrl('/vercel.svg'),
  };
}

export function websiteJsonLd() {
  const { name, description } = siteDefaults();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={query}`,
      'query-input': 'required name=query'
    },
    description,
  };
}
