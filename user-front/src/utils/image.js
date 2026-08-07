/**
 * Converts relative image URLs to absolute URLs
 * @param {string} imageUrl - The image URL from the API
 * @param {string} baseUrl - The base URL for the backend server
 * @returns {string|null} - The absolute image URL
 */
const normalizeAssetBaseUrl = (baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') => {
  return String(baseUrl).replace(/\/$/, '').replace(/\/api\/?$/, '');
};

export const getImageUrl = (imageUrl, baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') => {
  if (!imageUrl) return null;

  // Handle Next.js static imports (objects)
  if (typeof imageUrl === 'object' && imageUrl.src) {
    return imageUrl.src;
  }

  // Ensure it's a string from here on
  if (typeof imageUrl !== 'string') return null;
  if (imageUrl === 'null' || imageUrl === 'undefined') return null;

  const assetBase = normalizeAssetBaseUrl(baseUrl);

  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // If it's a relative URL, prepend the base URL
  if (imageUrl.startsWith('/')) {
    return `${assetBase}${imageUrl}`;
  }

  // If it already starts with uploads/, just prepend the base URL
  if (imageUrl.startsWith('uploads/')) {
    return `${assetBase}/${imageUrl}`;
  }

  // If it's just a filename, prepend the base URL and uploads path
  return `${assetBase}/uploads/${imageUrl}`;
};

/**
 * Gets a fallback image URL if the main image fails to load
 * @param {string} fallbackPath - The fallback image path
 * @returns {string} - The fallback image URL
 */
export const getFallbackImageUrl = (fallbackPath = '/logo/logo.png') => {
  return fallbackPath;
};

/**
 * Kitap kapak resmi URL'i. Thumbnail desteği:
 * - uploads/books/X.png → uploads/books/thumbnails/X.jpg (manuel kapaklar)
 * - uploads/xxx.jpg → uploads/thumbnails/xxx.jpg (API ile yüklenenler)
 * @param {object} book - Kitap objesi (coverImage veya coverUrl)
 * @param {string} size - 'full' | 'thumb' - thumb = küçük versiyon (liste/grid)
 * @param {string} baseUrl - API base URL
 * @returns {string} - Tam resim URL'i
 */
export const getBookCoverUrl = (book, size = 'full', baseUrl = process.env.NEXT_PUBLIC_API_URL || '') => {
  const img = book?.coverImage || book?.coverUrl;
  if (!img || typeof img !== 'string' || img === 'null' || img === 'undefined') return '/images/book-placeholder.jpg';
  if (img.startsWith('http')) return img;

  const normalized = img.startsWith('/') ? img : `/${img}`;
  const fullUrl = `${normalizeAssetBaseUrl(baseUrl)}${normalized}`;

  if (size !== 'thumb') return fullUrl;

  // uploads/books/ manuel kapaklar: .../books/X.png → .../books/thumbnails/X.jpg
  if (normalized.startsWith('/uploads/books/') && !normalized.includes('/thumbnails/')) {
    const thumbPath = normalized.replace(/\/uploads\/books\//, '/uploads/books/thumbnails/').replace(/\.[^.]+$/, '.jpg');
    return `${normalizeAssetBaseUrl(baseUrl)}${thumbPath}`;
  }
  // API yüklemeleri: /uploads/X.jpg → /uploads/thumbnails/X.jpg
  if (normalized.startsWith('/uploads/') && !normalized.includes('/thumbnails/') && !normalized.includes('/books/')) {
    const thumbPath = normalized.replace(/\/uploads\//, '/uploads/thumbnails/');
    return `${normalizeAssetBaseUrl(baseUrl)}${thumbPath}`;
  }
  return fullUrl;
};
