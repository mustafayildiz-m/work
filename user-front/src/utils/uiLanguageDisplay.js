/**
 * UI locale codes — must stay in sync with useLanguageContext SUPPORTED_LOCALES.
 */
export const UI_LOCALE_CODES = [
  'tr', 'en', 'ar', 'de', 'fr', 'ja',
  'zh', 'hi', 'es', 'pt', 'ru', 'it', 'ko',
  'uk', 'ku', 'ro', 'bg', 'sr', 'hu', 'cs', 'pl', 'sk', 'sl', 'mk', 'hy',
  'mr', 'te', 'gu', 'ml', 'kn', 'or',
];

/** UI locale code → Turkish DB name (books.languages key suffix) */
export const UI_LOCALE_TURKISH_NAMES = {
  tr: 'Türkçe',
  en: 'İngilizce',
  ar: 'Arapça',
  de: 'Almanca',
  fr: 'Fransızca',
  ja: 'Japonca',
  zh: 'Çince',
  hi: 'Hintçe',
  es: 'İspanyolca',
  pt: 'Portekizce',
  ru: 'Rusça',
  it: 'İtalyanca',
  ko: 'Korece',
  uk: 'Ukraynaca',
  ku: 'Kürtçe',
  ro: 'Rumence',
  bg: 'Bulgarca',
  sr: 'Sırpça',
  hu: 'Macarca',
  cs: 'Çekçe',
  pl: 'Lehçe',
  sk: 'Slovakça',
  sl: 'Slovence',
  mk: 'Makedonca',
  hy: 'Ermenice',
  mr: 'Marathi',
  te: 'Telugu',
  gu: 'Gujarati',
  ml: 'Malayalam',
  kn: 'Kannada',
  or: 'Odia',
};

const TURKISH_DB_LANGUAGE_NAMES = new Set(Object.values(UI_LOCALE_TURKISH_NAMES));

function isTurkishDbLanguageLabel(value, lang) {
  if (!value) return true;
  if (lang?.name && value === lang.name) return true;
  return TURKISH_DB_LANGUAGE_NAMES.has(value);
}

/** Q&A language slug → UI locale code */
export const QA_CODE_TO_UI_LOCALE = {
  tur: 'tr', tr: 'tr',
  eng: 'en', en: 'en',
  ara: 'ar', ar: 'ar',
  deu: 'de', de: 'de',
  fra: 'fr', fr: 'fr',
  jpn: 'ja', ja: 'ja',
  zho: 'zh', cmn: 'zh', zh: 'zh',
  hin: 'hi', hi: 'hi',
  spa: 'es', es: 'es',
  por: 'pt', pt: 'pt',
  rus: 'ru', ru: 'ru',
  ita: 'it', it: 'it',
  kor: 'ko', ko: 'ko',
  ukr: 'uk', uk: 'uk',
  kur: 'ku', ku: 'ku',
  ron: 'ro', ro: 'ro',
  bul: 'bg', bg: 'bg',
  srp: 'sr', sr: 'sr',
  hun: 'hu', hu: 'hu',
  ces: 'cs', cs: 'cs',
  pol: 'pl', pl: 'pl',
  slk: 'sk', sk: 'sk',
  slv: 'sl', sl: 'sl',
  mkd: 'mk', mk: 'mk',
  hye: 'hy', hy: 'hy',
  mar: 'mr', mr: 'mr',
  tel: 'te', te: 'te',
  guj: 'gu', gu: 'gu',
  mal: 'ml', ml: 'ml',
  kan: 'kn', kn: 'kn',
  ori: 'or', or: 'or',
};

export function getTurkishNameForUiLocale(code) {
  return UI_LOCALE_TURKISH_NAMES[code] || null;
}

export function resolveUiLocaleFromQaLanguage(lang) {
  if (!lang) return null;
  const slug = String(lang.iso639_3 || lang.code || '').toLowerCase();
  return QA_CODE_TO_UI_LOCALE[slug] || null;
}

export function isSystemUiLanguage(lang) {
  return Boolean(resolveUiLocaleFromQaLanguage(lang));
}

/** Translate via books.languages.{turkishName}; same keys as LanguageSwitcher */
export function getTranslatedLanguageNameForUiLocale(uiLocaleCode, t) {
  const turkishName = getTurkishNameForUiLocale(uiLocaleCode);
  if (!turkishName) return uiLocaleCode?.toUpperCase() || '';
  const key = `books.languages.${turkishName}`;
  const translated = t(key);
  return translated && translated !== key ? translated : turkishName;
}

function translateTurkishDbName(turkishName, t) {
  if (!turkishName) return null;
  const key = `books.languages.${turkishName}`;
  const translated = t(key);
  return translated && translated !== key ? translated : null;
}

/** Primary label for Q&A language rows — respects current UI locale */
export function getQaLanguageDisplayName(lang, t) {
  if (!lang) return '';

  if (lang.name) {
    const fromDbName = translateTurkishDbName(lang.name, t);
    if (fromDbName) return fromDbName;
  }

  const uiLocale = resolveUiLocaleFromQaLanguage(lang);
  if (uiLocale) {
    return getTranslatedLanguageNameForUiLocale(uiLocale, t);
  }

  return lang.nativeName || lang.englishName || lang.name || lang.iso639_3 || lang.code || '';
}

/** Secondary line: native script or English — never repeat Turkish DB labels */
export function getQaLanguageSecondaryName(lang, primaryDisplay) {
  if (!lang) return '';
  const candidates = [lang.nativeName, lang.englishName].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate === primaryDisplay) continue;
    if (isTurkishDbLanguageLabel(candidate, lang)) continue;
    return candidate;
  }
  return '';
}

export function getQaLanguageLabels(lang, t) {
  const primary = getQaLanguageDisplayName(lang, t);
  const secondary = getQaLanguageSecondaryName(lang, primary);
  return { primary, secondary, showSecondary: Boolean(secondary) };
}
