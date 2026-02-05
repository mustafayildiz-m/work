/**
 * Slug oluşturma yardımcı fonksiyonları
 */

/**
 * Metni slug formatına çevirir
 * @param text - Çevrilecek metin
 * @returns Slug formatında metin
 */
export function createSlug(text: string): string {
  if (!text) return '';

  return (
    text
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
      .replace(/-+$/, '')
  );
}

/**
 * Benzersiz slug oluşturur (eğer aynı slug varsa numara ekler)
 * @param baseText - Temel metin
 * @param existingSlugs - Mevcut slug'lar listesi
 * @returns Benzersiz slug
 */
export function createUniqueSlug(
  baseText: string,
  existingSlugs: string[] = [],
): string {
  let slug = createSlug(baseText);
  let counter = 1;
  const originalSlug = slug;

  while (existingSlugs.includes(slug)) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Slug'ın geçerli olup olmadığını kontrol eder
 * @param slug - Kontrol edilecek slug
 * @returns Geçerli mi?
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;

  // Sadece küçük harf, rakam ve tire içermeli
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * URL'den slug çıkarır
 * @param url - URL
 * @returns Slug
 */
export function extractSlugFromUrl(url: string): string {
  if (!url) return '';

  const parts = url.split('/');
  return parts[parts.length - 1];
}

/**
 * Slug'ı URL formatına çevirir
 * @param slug - Slug
 * @param basePath - Temel path (opsiyonel)
 * @returns URL
 */
export function slugToUrl(slug: string, basePath: string = ''): string {
  if (!slug) return '';

  const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
  return basePath ? `${basePath}/${cleanSlug}` : `/${cleanSlug}`;
}
