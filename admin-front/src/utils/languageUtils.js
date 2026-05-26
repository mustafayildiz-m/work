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
};

/**
 * Returns the localized display name for a language object.
 * @param {{ code: string, name: string }} lang - Language object from the backend
 * @param {import('react-intl').IntlShape} intl - react-intl intl instance
 * @returns {string}
 */
export function getLocalizedLanguageName(lang, intl) {
  if (!lang) return '';
  const code = (lang.code || '').toLowerCase();
  const i18nKey = LANGUAGE_CODE_I18N_MAP[code];
  if (i18nKey) {
    return intl.formatMessage({ id: i18nKey });
  }
  return lang.name || code;
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
