
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * A utility function to make API requests to Strapi.
 */
export async function fetchApi(endpoint: string, query?: Record<string, unknown>, options?: RequestInit) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 60 } // Revalidate every 60 seconds
    } as const;
    const mergedOptions: RequestInit = { ...defaultOptions, ...options };
    
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const requestUrl = `${STRAPI_URL}/api${endpoint}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(requestUrl, mergedOptions);
        if (!response.ok) {
            // Gracefully silence 403 for optional single types (e.g., footer) while still surfacing other issues.
            if (response.status !== 403) {
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

/**
 * Fetches all trips for the main listing page.
 */
export async function getTrips() {
    const query = {
        populate: ['featured_image'],
        sort: ['publishedAt:desc'],
    } as const;
    const res = await fetchApi('/trips', query);
    if (!res?.data) {
        return [];
    }
    return res.data;
}


/**
 * Fetches a single trip by its slug.
 */
export async function getTripBySlug(slug: string) {
    const query = {
        filters: { slug: { $eq: slug } },
        populate: {
            featured_image: true,
            gallery: true
        }, 
    } as const;
    const res = await fetchApi('/trips', query);

    if (!res?.data || res.data.length === 0) {
        return null;
    }

    return res.data[0];
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
    const res = await fetchApi('/about-page', query);
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
    const res = await fetchApi('/contact-page', query);
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
    const res = await fetchApi('/blog-posts', query);
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
    if (raw.attributes) return raw; // already normalized
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
        populate: ['picture'],
    } as const;
    const res = await fetchApi('/testimonials', query);
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

// --- New: Single types for dynamic site chrome ---
export async function getHomePage() {
    const query = { populate: { hero_media: true, trip_badges: true, events_background: true } } as const;
    const res = await fetchApi('/home-page', query);
    return res?.data || null;
}

export async function getFooterSettings() {
    // quick_links removed from schema; only populate background image now.
    // Use no-store so footer reflects updates immediately (avoid 60s ISR delay).
    const query = { populate: { background_image: true } } as const;
    const res = await fetchApi('/footer', query, { cache: 'no-store' });
    return res?.data || null;
}

// Placeholder: community page single type if/when added
export async function getCommunityPage() {
    const query = { populate: '*' } as const;
    const res = await fetchApi('/community-page', query);
    return res?.data || null;
}
