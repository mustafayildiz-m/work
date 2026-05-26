/**
 * Ülke adı: Türkçe arayüzde DB'deki nameTr, diğer dillerde İngilizce canonical name.
 */
export function getCountryDisplayName(country, locale) {
  if (!country) return '';
  const loc = String(locale || 'en').toLowerCase().split('-')[0].split('_')[0];
  if (loc === 'tr' && country.nameTr) return country.nameTr;
  return country.name || '';
}

/** books.languages.{dbName} → çeviri; yoksa orijinal isim */
export function getLocalizedLanguageName(language, t) {
  if (!language) return '';
  const key = `books.languages.${language.name}`;
  const translated = t(key);
  return translated !== key ? translated : (language.name || '');
}
