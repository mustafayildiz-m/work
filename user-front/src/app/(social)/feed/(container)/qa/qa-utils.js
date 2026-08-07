/**
 * Resolve backend language id from UI locale code.
 */
export function resolveLanguageId(languages, locale) {
  if (!Array.isArray(languages) || !locale) return null;
  const code = locale.toLowerCase().split('-')[0];
  const match =
    languages.find((l) => l.code?.toLowerCase() === code) ||
    languages.find((l) => l.code?.toLowerCase()?.startsWith(code));
  return match?.id ?? null;
}

/**
 * Pick the best translation for the active language, with optional English fallback.
 */
export function pickTranslation(translations, languageId, fallbackLanguageId = null) {
  const list = Array.isArray(translations) ? translations : [];
  if (!list.length) return null;

  if (languageId) {
    const exact = list.find((t) => t.languageId === languageId);
    if (exact) return exact;
  }

  if (fallbackLanguageId) {
    const fallback = list.find((t) => t.languageId === fallbackLanguageId);
    if (fallback) return fallback;
  }

  return list[0];
}

export function pickTranslationName(translations, languageId, fallbackLanguageId = null) {
  return pickTranslation(translations, languageId, fallbackLanguageId)?.name || null;
}
