// Utilities for constructing Logout World external booking links.

export interface LogoutWorldOptions {
  title: string;
  internalSlug?: string;
}

// Explicit overrides for titles / internal slugs that don't map cleanly.
// Keyed by either internal slug or exact lowercase title.
export const LOGOUT_WORLD_OVERRIDES: Record<string, string> = {
  // Example mappings (uncomment & adjust once verified):
  // 'ladakh-with-hanle-umling-la-ex-leh-8n9d': 'https://logout.world/tours/ladakh-with-hanle-umling-la-ex-leh-8n9d/',
  // 'ladakh with hanle & umling la | ex-leh | 8n/9d': 'https://logout.world/tours/ladakh-with-hanle-umling-la-ex-leh-8n9d/'
};

export const LOGOUT_WORLD_HOST_LISTING = 'https://logout.world/tours/hosts/solo-yolo/';

export function buildLogoutWorldEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\|/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export function getLogoutWorldCandidateDetailUrl(title: string): string {
  return `https://logout.world/tours/${buildLogoutWorldEventSlug(title)}/`;
}

export function resolveLogoutWorldUrl({ title, internalSlug }: LogoutWorldOptions): { candidate: string; final: string; overridden: boolean; searchUrl: string } {
  const keyCandidates = [internalSlug?.toLowerCase(), title.toLowerCase()].filter(Boolean) as string[];
  for (const key of keyCandidates) {
    if (LOGOUT_WORLD_OVERRIDES[key]) {
      const overriddenUrl = LOGOUT_WORLD_OVERRIDES[key];
      return {
        candidate: overriddenUrl,
        final: overriddenUrl,
        overridden: true,
        searchUrl: `${LOGOUT_WORLD_HOST_LISTING}?q=${encodeURIComponent(title)}`
      };
    }
  }
  const candidate = getLogoutWorldCandidateDetailUrl(title);
  return {
    candidate,
    final: candidate,
    overridden: false,
    searchUrl: `${LOGOUT_WORLD_HOST_LISTING}?q=${encodeURIComponent(title)}`
  };
}

export function externalBookingEnabled(): boolean {
  // Allow disabling via env flag (default ON)
  if (typeof process !== 'undefined') {
    const flag = process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_BOOKING;
    if (flag && ['0', 'false', 'off', 'disabled', 'no'].includes(flag.toLowerCase())) return false;
  }
  return true;
}

// Server-side (Node) HEAD validation with graceful timeout.
export async function validateExternalUrlHead(url: string, timeoutMs = 5000): Promise<{ ok: boolean; status?: number }> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
    clearTimeout(t);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}

export interface ServerResolvedBookingLink {
  primary: string; // candidate or override
  fallback: string; // host search
  usingFallback: boolean;
  validated: boolean; // true if HEAD succeeded
  status?: number;
}

export async function resolveServerSideBookingLink(opts: LogoutWorldOptions): Promise<ServerResolvedBookingLink> {
  const { candidate, /* overridden */ searchUrl } = resolveLogoutWorldUrl(opts);
  if (!externalBookingEnabled()) {
    return { primary: '#', fallback: searchUrl, usingFallback: true, validated: false };
  }
  // If overridden we trust the mapping but still attempt validation.
  let head: { ok: boolean; status?: number };
  try {
    head = await validateExternalUrlHead(candidate);
  } catch {
    head = { ok: false };
  }
  if (head.ok) {
    return { primary: candidate, fallback: searchUrl, usingFallback: false, validated: true, status: head.status };
  }
  return { primary: searchUrl, fallback: searchUrl, usingFallback: true, validated: false, status: head.status };
}
