export const extractIdFromSlug = (slug: string): string => {
    // Attempt to find a UUID at the end of the slug
    // UUID regex: 8-4-4-4-12 hex chars
    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    const match = slug.match(uuidRegex);

    if (match) {
        return match[1];
    }

    // Fallback: assume the slug is the ID if no UUID pattern found at the end
    // Or maybe it's just the last part after a hyphen if it looks like an ID?
    // For now, if no UUID found, return the input string as is, 
    // assuming the slug effectively IS the ID (e.g. /event/123)
    return slug;
};

export const createSlug = (name: string, id: string): string => {
    const slugifiedName = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slugifiedName}-${id}`;
};
