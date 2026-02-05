/**
 * Slug oluşturma yardımcı fonksiyonları
 */

/**
 * Metni slug formatına çevirir
 * @param {string} text - Çevrilecek metin
 * @returns {string} - Slug formatında metin
 */
export const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Türkçe karakterleri değiştir
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Özel karakterleri kaldır ve boşlukları tire ile değiştir
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    // Çoklu tireleri tek tire yap
    .replace(/\-\-+/g, '-')
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Benzersiz slug oluşturur (eğer aynı slug varsa numara ekler)
 * @param {string} baseText - Temel metin
 * @param {Array} existingSlugs - Mevcut slug'lar listesi
 * @returns {string} - Benzersiz slug
 */
export const createUniqueSlug = (baseText, existingSlugs = []) => {
  let slug = createSlug(baseText);
  let counter = 1;
  let originalSlug = slug;
  
  while (existingSlugs.includes(slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

/**
 * Slug'ın geçerli olup olmadığını kontrol eder
 * @param {string} slug - Kontrol edilecek slug
 * @returns {boolean} - Geçerli mi?
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  
  // Sadece küçük harf, rakam ve tire içermeli
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * URL'den slug çıkarır
 * @param {string} url - URL
 * @returns {string} - Slug
 */
export const extractSlugFromUrl = (url) => {
  if (!url) return '';
  
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Slug'ı URL formatına çevirir
 * @param {string} slug - Slug
 * @param {string} basePath - Temel path (opsiyonel)
 * @returns {string} - URL
 */
export const slugToUrl = (slug, basePath = '') => {
  if (!slug) return '';
  
  const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
  return basePath ? `${basePath}/${cleanSlug}` : `/${cleanSlug}`;
};
