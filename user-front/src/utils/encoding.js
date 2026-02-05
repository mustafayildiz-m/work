// Utility functions for encoding/decoding post IDs

/**
 * Encode a post ID to a base64 string for URL use
 * @param {string|number} id - The post ID to encode
 * @returns {string} - Base64 encoded string
 */
export const encodePostId = (id) => {
  try {
    // Convert to string and add a prefix to make it less obvious
    const stringId = `post_${id}`;
    // Use Buffer for Node.js compatibility, fallback to btoa for browser
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(stringId).toString('base64');
    } else {
      return btoa(stringId);
    }
  } catch (error) {
    console.error('Error encoding post ID:', error);
    return id.toString();
  }
};

/**
 * Decode a base64 string back to post ID
 * @param {string} encodedId - The base64 encoded string
 * @returns {string} - The original post ID
 */
export const decodePostId = (encodedId) => {
  try {
    let decoded;
    // Use Buffer for Node.js compatibility, fallback to atob for browser
    if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(encodedId, 'base64').toString();
    } else {
      decoded = atob(encodedId);
    }
    // Remove the prefix and return the original ID
    return decoded.replace('post_', '');
  } catch (error) {
    console.error('Error decoding post ID:', error);
    // If decoding fails, return the original string (fallback)
    return encodedId;
  }
};

/**
 * Check if a string is a valid encoded post ID
 * @param {string} str - The string to check
 * @returns {boolean} - True if it's a valid encoded ID
 */
export const isValidEncodedId = (str) => {
  try {
    const decoded = atob(str);
    return decoded.startsWith('post_');
  } catch (error) {
    return false;
  }
};
