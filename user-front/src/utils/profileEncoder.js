/**
 * Profile ID Encoder/Decoder
 * URL'de ID'yi gizlemek için kullanılır
 */

// Salt değeri - güvenlik için
const SALT = 'iw_profile_2025';

/**
 * Profile ID'yi encode eder
 * @param {string} type - 'user' veya 'scholar'
 * @param {number|string} id - Profile ID
 * @returns {string} Encoded hash
 */
export const encodeProfileId = (type, id) => {
  try {
    // Format: type-id-timestamp
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const data = `${type}-${id}-${timestamp}`;
    
    // Base64 encode
    const base64 = btoa(data);
    
    // URL-safe yapma (+ ve / karakterlerini değiştir)
    const urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Padding karakterini kaldır
    
    return urlSafe;
  } catch (error) {
    console.error('Encode error:', error);
    return null;
  }
};

/**
 * Encoded hash'i decode eder
 * @param {string} hash - Encoded hash
 * @returns {object} {type: string, id: number} veya null
 */
export const decodeProfileId = (hash) => {
  try {
    // URL-safe karakterleri geri çevir
    let base64 = hash
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Base64 padding ekle
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Base64 decode
    const decoded = atob(base64);
    
    // Parse et: type-id-timestamp
    const parts = decoded.split('-');
    
    if (parts.length < 2) {
      throw new Error('Invalid hash format');
    }
    
    const type = parts[0];
    const id = parseInt(parts[1], 10);
    
    // Validate
    if (!['user', 'scholar'].includes(type) || isNaN(id)) {
      throw new Error('Invalid type or id');
    }
    
    return { type, id };
  } catch (error) {
    console.error('Decode error:', error);
    return null;
  }
};

/**
 * Profile URL oluşturur
 * @param {string} type - 'user' veya 'scholar'
 * @param {number|string} id - Profile ID
 * @param {string} baseUrl - Base URL (optional)
 * @param {string} lang - Language code (optional: 'tr', 'en', 'ar')
 * @returns {string} Full profile URL
 */
export const generateProfileUrl = (type, id, baseUrl = null, lang = 'tr') => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const hash = encodeProfileId(type, id);
  
  if (!hash) {
    return null;
  }
  
  return `${base}/public/profile/${hash}?lang=${lang}`;
};

/**
 * Hash'ten profile bilgisini çıkarır
 * @param {string} hash - Encoded hash
 * @returns {object} Profile info veya null
 */
export const parseProfileHash = (hash) => {
  return decodeProfileId(hash);
};

