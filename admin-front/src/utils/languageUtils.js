/**
 * Maps language codes from the backend to i18n message IDs.
 * Falls back to the backend-provided name if no mapping exists.
 */
const LANGUAGE_CODE_I18N_MAP = {
  tr: 'UI.TURKCE',
  en: 'UI.INGILIZCE',
  ar: 'UI.ARAPCA',
  fr: 'UI.FRANSIZCA',
  de: 'UI.ALMANCA',
  ur: 'UI.URDUCA',
  fa: 'UI.FARSCA',
  id: 'UI.ENDONEZCE',
  ms: 'UI.MALAYCA',
  ru: 'UI.RUSCA',
  es: 'UI.ISPANYOLCA',
  it: 'UI.ITALYANCA',
  nl: 'UI.HOLLANDACA',
  bn: 'UI.BENGALCE',
  ota: 'UI.TURKCE_OSMANLICA',
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
