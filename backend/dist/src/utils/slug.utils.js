"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlug = createSlug;
exports.createUniqueSlug = createUniqueSlug;
exports.isValidSlug = isValidSlug;
exports.extractSlugFromUrl = extractSlugFromUrl;
exports.slugToUrl = slugToUrl;
function createSlug(text) {
    if (!text)
        return '';
    return (text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, ''));
}
function createUniqueSlug(baseText, existingSlugs = []) {
    let slug = createSlug(baseText);
    let counter = 1;
    const originalSlug = slug;
    while (existingSlugs.includes(slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }
    return slug;
}
function isValidSlug(slug) {
    if (!slug)
        return false;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}
function extractSlugFromUrl(url) {
    if (!url)
        return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
}
function slugToUrl(slug, basePath = '') {
    if (!slug)
        return '';
    const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
    return basePath ? `${basePath}/${cleanSlug}` : `/${cleanSlug}`;
}
//# sourceMappingURL=slug.utils.js.map