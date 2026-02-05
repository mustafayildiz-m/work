/**
 * Converts relative image URLs to absolute URLs
 * @param {string} imageUrl - The image URL from the API
 * @param {string} baseUrl - The base URL for the backend server
 * @returns {string} - The absolute image URL
 */
export const getImageUrl = (imageUrl, baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') => {
  if (!imageUrl) return null;
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the base URL
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }
  
  // If it's just a filename, prepend the base URL and uploads path
  return `${baseUrl}/uploads/${imageUrl}`;
};

/**
 * Gets a fallback image URL if the main image fails to load
 * @param {string} fallbackPath - The fallback image path
 * @returns {string} - The fallback image URL
 */
export const getFallbackImageUrl = (fallbackPath = '/logo/logo.png') => {
  return fallbackPath;
};
