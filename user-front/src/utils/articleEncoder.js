/**
 * Article ID Encoder/Decoder
 * URL'de makale ID'sini gizlemek için kullanılır
 */

// Salt değeri - güvenlik için
const SALT = 'iw_article_2025';

/**
 * Makale ID'yi encode eder
 * @param {number|string} articleId - Makale ID
 * @param {string} lang - Language code (optional: 'tr', 'en', 'ar', 'de', 'fr', 'ja')
 * @returns {string} Encoded hash
 */
export const encodeArticleId = (articleId, lang = 'tr') => {
  try {
    // Format: article-id-timestamp-lang
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const data = `article-${articleId}-${timestamp}-${lang}`;
    
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
 * @returns {object} {articleId: number, lang: string} veya null
 */
export const decodeArticleId = (hash) => {
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
    
    // Parse et: article-id-timestamp-lang
    const parts = decoded.split('-');
    
    if (parts.length < 3) {
      throw new Error('Invalid hash format');
    }
    
    const type = parts[0];
    const articleId = parseInt(parts[1], 10);
    const lang = parts[3] || 'tr'; // Son kısım dil kodu
    
    // Validate
    if (type !== 'article' || isNaN(articleId)) {
      throw new Error('Invalid article type or id');
    }
    
    return { articleId, lang };
  } catch (error) {
    console.error('Decode error:', error);
    return null;
  }
};

/**
 * Makale URL oluşturur
 * @param {number|string} articleId - Makale ID
 * @param {string} baseUrl - Base URL (optional)
 * @param {string} lang - Language code (optional: 'tr', 'en', 'ar', 'de', 'fr', 'ja')
 * @returns {string} Full article URL
 */
export const generateArticleUrl = (articleId, baseUrl = null, lang = 'tr') => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const hash = encodeArticleId(articleId, lang);
  
  if (!hash) {
    return null;
  }
  
  return `${base}/public/article/${hash}?lang=${lang}`;
};

/**
 * Hash'ten makale bilgisini çıkarır
 * @param {string} hash - Encoded hash
 * @returns {object} Article info veya null
 */
export const parseArticleHash = (hash) => {
  return decodeArticleId(hash);
};

