
/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * A utility function to make API requests to Strapi.
 */
export async function fetchApi(
    endpoint: string,
    query?: Record<string, unknown>,
    options?: RequestInit & { next?: { revalidate?: number | false }; cacheStrategy?: 'no-store' | 'short' | 'standard' | 'long'; suppressErrorLog?: boolean }
) {
    // Strategy mapping: tweak these durations as desired
    const strategy = options?.cacheStrategy || 'standard';
    const strategyMap: Record<string, { cache?: RequestCache; next?: { revalidate: number } }> = {
        'no-store': { cache: 'no-store' },         // always fresh
        'short':    { next: { revalidate: 30 } },  // 30s
        'standard': { next: { revalidate: 120 } }, // 2 min
        'long':     { next: { revalidate: 600 } }, // 10 min
    };
    const chosen = strategyMap[strategy] || strategyMap['standard'];
    const base: RequestInit & { next?: { revalidate?: number | false } } = {
        headers: { 'Content-Type': 'application/json' },
        ...(chosen.cache ? { cache: chosen.cache } : {}),
        ...(chosen.next ? { next: chosen.next } : {})
    };
    const mergedOptions: RequestInit & { next?: { revalidate?: number | false } } = {
        ...base,
        ...options,
        next: options?.next || base.next,
        headers: { ...(base.headers || {}), ...(options?.headers || {}) }
    };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const requestUrl = `${STRAPI_URL}/api${endpoint}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(requestUrl, mergedOptions);
        if (!response.ok) {
            // Gracefully silence 403 for optional single types (e.g., footer) while still surfacing other issues.
            if (response.status !== 403 && !options?.suppressErrorLog) {
                console.error(`Error fetching ${requestUrl}: ${response.status} ${response.statusText}`);
            }
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in fetchApi:', error);
        return null;
    }
}

// Normalize Strapi trip items to a flat shape used by the UI (for listings/search)
function normalizeTrips(items: any[]): any[] {
    if (!Array.isArray(items)) return items as any[];
    return items.map((item) => {
        if (item && typeof item === 'object' && 'attributes' in item && (item as any).attributes) {
            const a = (item as any).attributes || {};
            return {
                id: (item as any).id,
                documentId: (item as any).documentId,
                title: a.title,
                slug: a.slug,
                excerpt: a.excerpt,
                price: a.price,
                duration: a.duration,
                category: a.category,
                destination: a.destination,
                start_date: a.start_date,
                capacity: a.capacity,
                is_featured: a.is_featured,
                featured_image: a.featured_image,
                itinerary: a.itinerary,
                gallery: a.gallery,
            };
        }
        return item;
    });
}

/**
 * Fetches all trips for the main listing page.
 */
export async function getTrips() {
    const query = {
        populate: ['featured_image', 'brochure_pdf'],
        sort: ['publishedAt:desc'],
    } as const;
    const res = await fetchApi('/trips', query, { cacheStrategy: 'long' });
    if (!res?.data) {
        return [];
    }
    // If Strapi rejects unknown populate keys, retry without brochure_pdf
    if (!res?.data) {
        const safe = await fetchApi('/trips', { populate: ['featured_image'], sort: ['publishedAt:desc'] }, { cacheStrategy: 'long', suppressErrorLog: true });
        return safe?.data ? normalizeTrips(safe.data) : [];
    }
    return normalizeTrips(res.data);
}


/**
 * Fetches a single trip by its slug.
 */
export async function getTripBySlug(slug: string) {
    // Try multiple populate strategies to avoid 400s from unknown fields
    const populates: Array<Record<string, unknown> | string[] | string> = [
        // Use only known fields to avoid 400s from unknown keys
        { featured_image: true, gallery: true, brochure_pdf: true },
        ['featured_image', 'gallery', 'brochure_pdf'],
        '*',
    ];

    const tryFetch = async (filters: Record<string, unknown>) => {
        for (const p of populates) {
            const res = await fetchApi('/trips', { filters, populate: p as any }, { cacheStrategy: 'standard', suppressErrorLog: true });
            if (res?.data && res.data.length > 0) return res.data[0];
        }
        return null;
    };

    // 1) by slug
    const bySlug = await tryFetch({ slug: { $eq: slug } });
    if (bySlug) return bySlug;
    // 2) by documentId
    const byDoc = await tryFetch({ documentId: { $eq: slug } });
    if (byDoc) return byDoc;
    // 3) by numeric id
    const maybeId = Number(slug);
    if (!Number.isNaN(maybeId)) {
        const byId = await tryFetch({ id: { $eq: maybeId } });
        if (byId) return byId;
    }
    return null;
}
// --- Page Content Functions ---

/**
 * Fetches the content for the About Us page.
 * @returns The about page data object.
 */
export async function getAboutPage() {
    const query = {
        populate: {
            cover_image: true,
            team_members: {
                populate: ['photo'],
            },
        },
    } as const;
    const res = await fetchApi('/about-page', query, { cacheStrategy: 'long' });
    return res?.data || null;
}

/**
 * Fetches the content for the Contact page.
 * @returns The contact page data object.
 */
export async function getContactPage() {
    const query = {
        populate: '*',
    } as const;
    const res = await fetchApi('/contact-page', query, { cacheStrategy: 'long' });
    return res?.data || null;
}


// --- Blog & Community Functions ---

/**
 * Fetches all blog posts with their cover image and author.
 * @returns A list of blog post data objects.
 */
export async function getBlogPosts() {
    const query = {
        populate: {
            cover_image: true,
            author: { populate: ['picture'] },
        },
        sort: ['publishedAt:desc'],
    } as const;
    const res = await fetchApi('/blog-posts', query, { cacheStrategy: 'long' });
    const items = res?.data || [];
    // Normalize flattened shape (production) to Strapi default attributes shape expected by UI
    interface RawMedia { id?: number; formats?: unknown; url?: string; [k: string]: unknown }
    interface RawAuthor { name?: string; title?: string; picture?: RawMedia; [k: string]: unknown }
    interface RawFlatBlogItem {
        id?: number;
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        publishedAt?: string;
        createdAt?: string;
        cover_image?: RawMedia;
        author?: RawAuthor;
        attributes?: unknown; // presence means already normalized
        [k: string]: unknown;
    }
    const normalized = items.map((item: unknown) => {
        const flat = item as RawFlatBlogItem;
        if (flat && (flat as { attributes?: unknown }).attributes) return flat as unknown; // already standard
        if (!flat || typeof flat !== 'object') return flat;
        const {
            id,
            title = '',
            slug = '',
            excerpt = '',
            content = '',
            publishedAt,
            createdAt,
            cover_image,
            author,
        } = flat;
        const wrappedCover = cover_image ? { data: cover_image } : { data: undefined };
        const wrappedAuthor = author ? {
            data: {
                attributes: {
                    name: author.name,
                    title: author.title,
                    picture: author.picture ? { data: author.picture } : undefined,
                }
            }
        } : undefined;
        return {
            id,
            attributes: {
                title,
                slug,
                excerpt,
                content,
                publishedAt: publishedAt || createdAt || new Date().toISOString(),
                cover_image: wrappedCover,
                author: wrappedAuthor,
            }
        };
    });
    return normalized;
}

/**
 * Fetches a single blog post by its slug.
 * @param slug The unique slug of the blog post.
 * @returns A single blog post data object or null if not found.
 */
export async function getPostBySlug(slug: string) {
    const query = {
        filters: { slug: { $eq: slug } },
        populate: {
            cover_image: true,
            author: { populate: ['picture'] },
        },
    } as const;
    const res = await fetchApi('/blog-posts', query);
    const raw = res?.data?.[0];
    if (!raw) return null;
    if (raw.attributes) return raw;
    interface RawMedia { id?: number; formats?: unknown; url?: string; [k: string]: unknown }
    interface RawAuthor { name?: string; title?: string; picture?: RawMedia; [k: string]: unknown }
    interface RawFlatBlogItemSingle {
        id?: number;
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        publishedAt?: string;
        createdAt?: string;
        cover_image?: RawMedia;
        author?: RawAuthor;
        attributes?: unknown;
        [k: string]: unknown;
    }
    const {
        id,
        title = '',
        slug: s = '',
        excerpt = '',
        content = '',
        publishedAt,
        createdAt,
        cover_image,
        author,
    } = raw as RawFlatBlogItemSingle;
    return {
        id,
        attributes: {
            title,
            slug: s,
            excerpt,
            content,
            publishedAt: publishedAt || createdAt || new Date().toISOString(),
            cover_image: cover_image ? { data: cover_image } : { data: undefined },
            author: author ? {
                data: {
                    attributes: {
                        name: author.name,
                        title: author.title,
                        picture: author.picture ? { data: author.picture } : undefined,
                    }
                }
            } : undefined,
        }
    };
}

/**
 * Fetches all published testimonials.
 * @returns A list of testimonial data objects.
 */
export async function getTestimonials() {
    const query = {
        sort: ['traveler_name:asc'],
        populate: {
            picture: {
                populate: '*'
            }
        },
    } as const;
    const res = await fetchApi('/testimonials', query, { cacheStrategy: 'short' });
    return res?.data || [];
}

export async function getFeaturedTrips() {
    const query = {
        filters: { is_featured: { $eq: true } },
        populate: ['cover_image']
    } as const;
    const res = await fetchApi('/trips', query);
    return res?.data || [];
}
// Deprecated: media URL helper moved to '@/lib/media'

// Server-side filtered trips search for listing page
type StrapiFilter = Record<string, unknown>;
type StrapiQuery = {
    populate?: (string | Record<string, unknown>)[] | Record<string, unknown>;
    sort?: string[];
    filters?: Record<string, unknown>;
};

export async function searchTrips(params: { destination?: string; from?: string; to?: string; guests?: number }) {
    const { destination, from, to, guests } = params || {};

    // Build a primary query using optimistic field names that may exist in Strapi.
    // If Strapi returns 400 due to unknown fields, we'll fall back to a minimal, safe query.
    const andConditions: StrapiFilter[] = [];
    const destinationOr: StrapiFilter[] = [];

    if (destination) {
        // Destination OR title contains — wrapped later inside $and so that
        // date range (if provided) is mandatory.
        destinationOr.push({ destination: { $containsi: destination } });
        destinationOr.push({ title: { $containsi: destination } });
    }

    if (from || to) {
        // Date range is mandatory when provided.
        const dateCond: Record<string, string> = {};
        if (from) dateCond.$gte = from;
        if (to) dateCond.$lte = to;
        andConditions.push({ start_date: dateCond });
    }

    if (typeof guests === 'number' && !Number.isNaN(guests)) {
        // Capacity is also treated as an AND condition if provided.
        andConditions.push({ capacity: { $gte: guests } });
    }

    const baseQuery: StrapiQuery = { populate: ['featured_image'], sort: ['createdAt:desc'] };

    const primaryQuery: StrapiQuery = { ...baseQuery };
    // Compose filters: if date/guests exist, they go into $and; if destination exists,
    // add its $or group into the $and as well. If only destination exists (no date/guests),
    // then use $or by itself.
    if (andConditions.length > 0 || destinationOr.length > 0) {
        // If both date/guests AND destination are present, enforce $and between them.
        if (andConditions.length > 0 && destinationOr.length > 0) {
            primaryQuery.filters = { $and: [...andConditions, { $or: destinationOr }] };
        } else if (andConditions.length > 0) {
            primaryQuery.filters = { $and: [...andConditions] };
        } else if (destinationOr.length > 0) {
            primaryQuery.filters = { $or: destinationOr };
        }
    }

    // Attempt the primary (richer) query first.
    let res = await fetchApi('/trips', primaryQuery, { suppressErrorLog: true });
    if (res?.data) return normalizeTrips(res.data);

    // Fallback: only filter by title contains to avoid 400s from unknown fields
    // Still enforce date range if available; use title contains for keyword.
    const fallbackAnd: StrapiFilter[] = [];
    if (from || to) {
        const dateCond: Record<string, string> = {};
        if (from) dateCond.$gte = from;
        if (to) dateCond.$lte = to;
        fallbackAnd.push({ start_date: dateCond });
    }
    if (destination) {
        // Enforce AND when date exists; otherwise just keyword.
        fallbackAnd.push({ $or: [{ title: { $containsi: destination } }] });
    }
    const fallbackQuery: StrapiQuery = { ...baseQuery };
    if (fallbackAnd.length > 0) {
        if ((from || to) && destination) {
            fallbackQuery.filters = { $and: fallbackAnd };
        } else if (from || to) {
            fallbackQuery.filters = { $and: fallbackAnd };
        } else if (destination) {
            fallbackQuery.filters = { $or: [{ title: { $containsi: destination } }] };
        }
    }

    res = await fetchApi('/trips', fallbackQuery);
    return res?.data ? normalizeTrips(res.data) : [];
}

// --- New: Single types for dynamic site chrome ---
export async function getHomePage() {
    const query = { populate: { hero_media: true, trip_badges: true, events_background: true } } as const;
    const res = await fetchApi('/home-page', query, { cacheStrategy: 'standard' });
    return res?.data || null;
}

export async function getFooterSettings() {
    const query = { populate: { background_image: true } } as const;
    // Use ISR (5 minutes) instead of no-store to allow static rendering
    const res = await fetchApi('/footer', query, { cacheStrategy: 'long' });
    const data = res?.data || null;
    if (!data) {
        return {
            attributes: {
                company_name: 'Solo Yolo',
                tagline: 'Crafting unforgettable journeys beyond the beaten path.',
                email: 'soloyoloindia@gmail.com',
                phone: '+1 (555) 123-4567',
                background_image: null,
            }
        };
    }
    return data;
}

// Placeholder: community page single type if/when added
export async function getCommunityPage() {
    const query = { populate: '*' } as const;
    const res = await fetchApi('/community-page', query, { cacheStrategy: 'standard' });
    return res?.data || null;
}
