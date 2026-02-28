
// Production URL
const BASE_URL = "https://backend.vimaljewellers.com";

export const transformImageUrl = (url) => {
    if (!url) return url;
    if (typeof url !== 'string') return url;

    // If it's already a full URL (starts with http), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a relative path starting with /images/, prepend the base URL
    if (url.startsWith("/images/")) {
        return `${BASE_URL}${url}`;
    }

    // If it's just "images/...", prepend / and base URL
    if (url.startsWith("images/")) {
        return `${BASE_URL}/${url}`;
    }

    // If it's just a filename (no path), assume it's in /images/
    if (!url.includes('/')) {
        return `${BASE_URL}/images/${url}`;
    }

    return url;
};
