/**
 * Maps language codes from the backend to i18n message IDs.
 * Falls back to the backend-provided name if no mapping exists.
 */
const LANGUAGE_CODE_I18N_MAP = {
  am: 'UI.LANG_AM',
  ar: 'UI.LANG_AR',
  az: 'UI.LANG_AZ',
  be: 'UI.LANG_BE',
  bg: 'UI.LANG_BG',
  bn: 'UI.LANG_BN',
  bs: 'UI.LANG_BS',
  ca: 'UI.LANG_CA',
  cs: 'UI.LANG_CS',
  da: 'UI.LANG_DA',
  de: 'UI.LANG_DE',
  dv: 'UI.LANG_DV',
  dz: 'UI.LANG_DZ',
  el: 'UI.LANG_EL',
  en: 'UI.LANG_EN',
  es: 'UI.LANG_ES',
  et: 'UI.LANG_ET',
  fa: 'UI.LANG_FA',
  fi: 'UI.LANG_FI',
  fo: 'UI.LANG_FO',
  fr: 'UI.LANG_FR',
  he: 'UI.LANG_HE',
  hi: 'UI.LANG_HI',
  hr: 'UI.LANG_HR',
  hu: 'UI.LANG_HU',
  hy: 'UI.LANG_HY',
  id: 'UI.LANG_ID',
  is: 'UI.LANG_IS',
  it: 'UI.LANG_IT',
  ja: 'UI.LANG_JA',
  ka: 'UI.LANG_KA',
  kk: 'UI.LANG_KK',
  kl: 'UI.LANG_KL',
  km: 'UI.LANG_KM',
  ko: 'UI.LANG_KO',
  ky: 'UI.LANG_KY',
  lo: 'UI.LANG_LO',
  lt: 'UI.LANG_LT',
  lv: 'UI.LANG_LV',
  mg: 'UI.LANG_MG',
  mk: 'UI.LANG_MK',
  mn: 'UI.LANG_MN',
  ms: 'UI.LANG_MS',
  mt: 'UI.LANG_MT',
  my: 'UI.LANG_MY',
  ne: 'UI.LANG_NE',
  nl: 'UI.LANG_NL',
  no: 'UI.LANG_NO',
  pl: 'UI.LANG_PL',
  pt: 'UI.LANG_PT',
  rn: 'UI.LANG_RN',
  ro: 'UI.LANG_RO',
  ru: 'UI.LANG_RU',
  rw: 'UI.LANG_RW',
  si: 'UI.LANG_SI',
  sk: 'UI.LANG_SK',
  sl: 'UI.LANG_SL',
  so: 'UI.LANG_SO',
  sq: 'UI.LANG_SQ',
  sr: 'UI.LANG_SR',
  sv: 'UI.LANG_SV',
  sw: 'UI.LANG_SW',
  tg: 'UI.LANG_TG',
  th: 'UI.LANG_TH',
  ti: 'UI.LANG_TI',
  tk: 'UI.LANG_TK',
  tl: 'UI.LANG_TL',
  tr: 'UI.LANG_TR',
  uk: 'UI.LANG_UK',
  ur: 'UI.LANG_UR',
  uz: 'UI.LANG_UZ',
  vi: 'UI.LANG_VI',
  zh: 'UI.LANG_ZH',
  ota: 'UI.LANG_OTA',
  ba: 'UI.LANG_BA',
  cv: 'UI.LANG_CV',
  ha: 'UI.LANG_HA',
  ig: 'UI.LANG_IG',
  lg: 'UI.LANG_LG',
  ps: 'UI.LANG_PS',
  ta: 'UI.LANG_TA',
  tt: 'UI.LANG_TT',
  ug: 'UI.LANG_UG',
  yo: 'UI.LANG_YO',
};

/**
 * ISO 639-1 (2 harfli) → ISO 639-3 (3 harfli) eşlemesi.
 * `languages` tablosunda aynı dil hem legacy (2 harfli kod, Türkçe ad) hem de
 * QA/Ethnologue seed'inden gelen (3 harfli kod, İngilizce ad) satır olarak
 * bulunabiliyor. Bu tablo iki nesli tek anahtarda buluşturur: hem doğru
 * çeviriyi bulmak hem de listede aynı dili iki kez göstermemek için.
 */
const ISO6391_TO_6393 = {
  am: 'amh',
  ar: 'ara',
  az: 'aze',
  ba: 'bak',
  be: 'bel',
  bg: 'bul',
  bn: 'ben',
  bs: 'bos',
  ca: 'cat',
  cs: 'ces',
  cv: 'chv',
  da: 'dan',
  de: 'deu',
  dv: 'div',
  dz: 'dzo',
  el: 'ell',
  en: 'eng',
  es: 'spa',
  et: 'est',
  fa: 'fas',
  fi: 'fin',
  fo: 'fao',
  fr: 'fra',
  ha: 'hau',
  he: 'heb',
  hi: 'hin',
  hr: 'hrv',
  hu: 'hun',
  hy: 'hye',
  id: 'ind',
  ig: 'ibo',
  is: 'isl',
  it: 'ita',
  ja: 'jpn',
  ka: 'kat',
  kk: 'kaz',
  kl: 'kal',
  km: 'khm',
  ko: 'kor',
  ky: 'kir',
  lg: 'lug',
  lo: 'lao',
  lt: 'lit',
  lv: 'lav',
  mg: 'mlg',
  mk: 'mkd',
  mn: 'mon',
  ms: 'msa',
  mt: 'mlt',
  my: 'mya',
  ne: 'npi',
  nl: 'nld',
  no: 'nor',
  pl: 'pol',
  ps: 'pus',
  pt: 'por',
  rn: 'run',
  ro: 'ron',
  ru: 'rus',
  rw: 'kin',
  si: 'sin',
  sk: 'slk',
  sl: 'slv',
  so: 'som',
  sq: 'sqi',
  sr: 'srp',
  sv: 'swe',
  sw: 'swh',
  ta: 'tam',
  tg: 'tgk',
  th: 'tha',
  ti: 'tir',
  tk: 'tuk',
  tl: 'fil',
  tr: 'tur',
  tt: 'tat',
  ug: 'uig',
  uk: 'ukr',
  ur: 'urd',
  uz: 'uzb',
  vi: 'vie',
  yo: 'yor',
  zh: 'zho',
};

const ISO6393_TO_6391 = Object.entries(ISO6391_TO_6393).reduce(
  (acc, [two, three]) => {
    acc[three] = two;
    return acc;
  },
  {},
);

/**
 * Bir dilin nesilden bağımsız kimliği (mümkünse ISO 639-3 kodu).
 * Endonezyaca(id) ve Indonesian(ind) aynı anahtarı üretir.
 * @param {{ code?: string, iso639_3?: string }} lang
 * @returns {string}
 */
export function getLanguageCanonicalKey(lang) {
  if (!lang) return '';
  const code = (lang.code || '').toLowerCase();
  const iso3 = (lang.iso639_3 || '').toLowerCase();
  if (iso3.length === 3) return iso3;
  if (ISO6391_TO_6393[code]) return ISO6391_TO_6393[code];
  return code || iso3;
}

/**
 * Aynı dilin mükerrer kayıtlarını tek satıra indirger.
 * İçerik (kitap/QA çevirileri) legacy satırlara bağlı olduğu için 2 harfli
 * kodlu satır tercih edilir; böylece seçilen dil gerçekten kitap döndürür.
 * @param {Array} list
 * @returns {Array}
 */
export function dedupeLanguages(list) {
  if (!Array.isArray(list)) return [];
  const byKey = new Map();

  list.forEach((lang) => {
    const key = getLanguageCanonicalKey(lang) || `id:${lang?.id}`;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, lang);
      return;
    }
    const currentIsLegacy = (current.code || '').length === 2;
    const candidateIsLegacy = (lang.code || '').length === 2;
    if (!currentIsLegacy && candidateIsLegacy) {
      byKey.set(key, lang);
    }
  });

  return Array.from(byKey.values());
}

/**
 * Returns the localized display name for a language object.
 * @param {{ code: string, name: string }} lang - Language object from the backend
 * @param {import('react-intl').IntlShape} intl - react-intl intl instance
 * @returns {string}
 */
export function getLocalizedLanguageName(lang, intl) {
  if (!lang) return '';
  const code = (lang.code || '').toLowerCase();
  const iso3 = (lang.iso639_3 || '').toLowerCase();

  // Önce 2 harfli kod, sonra 639-3 kodunun 639-1 karşılığı denenir.
  // Böylece "Indonesian (ind)" satırı da Türkçe panelde "Endonezce" görünür.
  const twoLetter =
    LANGUAGE_CODE_I18N_MAP[code]
      ? code
      : ISO6393_TO_6391[code] || ISO6393_TO_6391[iso3] || '';

  // 639-1 karşılığı olmayan diller için doğrudan 639-3 anahtarı denenir
  // (UI.LANG_CMN, UI.LANG_HAZ ...). Anahtar o dilin sözlüğünde yoksa
  // react-intl anahtarın kendisini basacağı için önce varlığı kontrol edilir.
  const canonical3 = iso3.length === 3 ? iso3 : (code.length === 3 ? code : '');
  const candidates = [
    LANGUAGE_CODE_I18N_MAP[twoLetter],
    canonical3 ? `UI.LANG_${canonical3.toUpperCase()}` : null,
  ].filter(Boolean);

  const i18nKey = candidates.find((key) => Boolean(intl.messages?.[key]));
  if (i18nKey) {
    return intl.formatMessage({ id: i18nKey });
  }

  // Haritada karşılığı olmayan diller (çoğunlukla 3 harfli ISO 639-3 kodları):
  // panel dili Türkçe ise DB'deki Türkçe ad, değilse İngilizce ad kullanılır.
  const locale = (intl.locale || 'en').toLowerCase().split('-')[0].split('_')[0];
  if (locale === 'tr') {
    return lang.name || lang.englishName || code;
  }
  return lang.englishName || lang.name || code;
}

/**
 * Returns the localized country display name.
 * Uses nameTr for Turkish admin UI; falls back to English name.
 * @param {{ name: string, nameTr?: string }} country
 * @param {import('react-intl').IntlShape} intl
 * @returns {string}
 */
export function getLocalizedCountryName(country, intl) {
  if (!country) return '';
  const locale = (intl.locale || 'en').toLowerCase().split('-')[0].split('_')[0];
  if (locale === 'tr' && country.nameTr) return country.nameTr;
  return country.name || '';
}

/**
 * Builds a "Country — Language" label for country select options.
 * @param {{ name: string, nameTr?: string, primaryLanguage?: { code: string, name: string } }} country
 * @param {import('react-intl').IntlShape} intl
 * @returns {string}
 */
export function getCountryOptionLabel(country, intl) {
  if (!country) return '';
  const cName = getLocalizedCountryName(country, intl);
  const lName = country.primaryLanguage
    ? getLocalizedLanguageName(country.primaryLanguage, intl)
    : '';
  return lName ? `${cName} — ${lName}` : cName;
}
