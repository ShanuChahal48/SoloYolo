
import qs from 'qs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

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
            console.error(`Error fetching ${requestUrl}: ${response.statusText}`);
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
    return res?.data || [];
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
    return res?.data?.[0] || null;
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