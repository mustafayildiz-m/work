export declare function createSlug(text: string): string;
export declare function createUniqueSlug(baseText: string, existingSlugs?: string[]): string;
export declare function isValidSlug(slug: string): boolean;
export declare function extractSlugFromUrl(url: string): string;
export declare function slugToUrl(slug: string, basePath?: string): string;
