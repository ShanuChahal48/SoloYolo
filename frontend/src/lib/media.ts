// Shared Strapi media helpers
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface StrapiImageFormat { url?: string }
export interface StrapiImageAttributes {
  url?: string;
  alternativeText?: string;
  formats?: Record<string, StrapiImageFormat>;
}
export type StrapiMedia =
  | { url?: string; formats?: Record<string, StrapiImageFormat>; alternativeText?: string }
  | { id?: number; attributes?: StrapiImageAttributes }
  | { data?: { id?: number; attributes?: StrapiImageAttributes } };

export function extractMediaAttributes(media: StrapiMedia | undefined): StrapiImageAttributes | undefined {
  if (!media) return undefined;
  if ('data' in media && media.data?.attributes) return media.data.attributes;
  if ('attributes' in media && media.attributes) return media.attributes;
  return media as StrapiImageAttributes;
}

export function getMediaUrl(media: StrapiMedia | undefined): string {
  const attrs = extractMediaAttributes(media);
  if (!attrs?.url) return '';
  return attrs.url.startsWith('http') ? attrs.url : `${STRAPI_URL}${attrs.url}`;
}

export function getMediaAlt(media: StrapiMedia | undefined, fallback: string): string {
  return extractMediaAttributes(media)?.alternativeText || fallback;
}

export function getStrapiMediaUrl(url: string | undefined): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}
