/**
 * Book ID Encoder/Decoder
 * URL'de kitap ID'sini gizlemek için kullanılır
 */

// Salt değeri - güvenlik için
const SALT = 'iw_book_2025';

/**
 * Kitap ID'yi encode eder
 * @param {number|string} bookId - Kitap ID
 * @param {string} lang - Language code (optional: 'tr', 'en', 'ar', 'de', 'fr', 'ja')
 * @returns {string} Encoded hash
 */
export const encodeBookId = (bookId, lang = 'tr') => {
  try {
    // Format: book-id-timestamp-lang
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const data = `book-${bookId}-${timestamp}-${lang}`;
    
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
 * @returns {object} {bookId: number, lang: string} veya null
 */
export const decodeBookId = (hash) => {
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
    
    // Parse et: book-id-timestamp-lang
    const parts = decoded.split('-');
    
    if (parts.length < 3) {
      throw new Error('Invalid hash format');
    }
    
    const type = parts[0];
    const bookId = parseInt(parts[1], 10);
    const lang = parts[3] || 'tr'; // Son kısım dil kodu
    
    // Validate
    if (type !== 'book' || isNaN(bookId)) {
      throw new Error('Invalid book type or id');
    }
    
    return { bookId, lang };
  } catch (error) {
    console.error('Decode error:', error);
    return null;
  }
};

/**
 * Kitap URL oluşturur
 * @param {number|string} bookId - Kitap ID
 * @param {string} baseUrl - Base URL (optional)
 * @param {string} lang - Language code (optional: 'tr', 'en', 'ar', 'de', 'fr', 'ja')
 * @returns {string} Full book URL
 */
export const generateBookUrl = (bookId, baseUrl = null, lang = 'tr') => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const hash = encodeBookId(bookId, lang);
  
  if (!hash) {
    return null;
  }
  
  return `${base}/public/book/${hash}?lang=${lang}`;
};

/**
 * Hash'ten kitap bilgisini çıkarır
 * @param {string} hash - Encoded hash
 * @returns {object} Book info veya null
 */
export const parseBookHash = (hash) => {
  return decodeBookId(hash);
};

