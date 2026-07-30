/**
 * Sistemdeki dillerden bayrak gösterimi - emoji fallback (eski tarayıcı uyumluluğu)
 * API'den gelen dil objesi (id, name, code, flagUrl) ile kullanılır
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// flagUrl yoksa kullanılacak emoji fallback (API'de flagUrl olan diller için gerekmez)
const FALLBACK_EMOJI_MAP = {
  tr: '🇹🇷', en: '🇬🇧', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸',
  it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', ja: '🇯🇵', zh: '🇨🇳', ko: '🇰🇷',
  nl: '🇳🇱', fa: '🇮🇷', ur: '🇵🇰', hi: '🇮🇳', uk: '🇺🇦', kk: '🇰🇿',
  uz: '🇺🇿', az: '🇦🇿', he: '🇮🇱', bn: '🇧🇩', id: '🇮🇩', ms: '🇲🇾',
  th: '🇹🇭', vi: '🇻🇳', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮',
  el: '🇬🇷', ps: '🇦🇫', prs: '🇦🇫', ota: '🇹🇷', pl: '🇵🇱', ku: '🇮🇶', ro: '🇷🇴',
  bg: '🇧🇬', sr: '🇷🇸', hu: '🇭🇺', cs: '🇨🇿', sk: '🇸🇰', sl: '🇸🇮',
  mk: '🇲🇰', hy: '🇦🇲', ta: '🇱🇰', tl: '🇵🇭', sw: '🇹🇿', ky: '🇰🇬',
  tk: '🇹🇲', tt: '🇷🇺', ug: '🇨🇳', ca: '🇪🇸', ha: '🇳🇬', am: '🇪🇹',
  so: '🇸🇴', mn: '🇲🇳', km: '🇰🇭', lo: '🇱🇦', my: '🇲🇲', jv: '🇮🇩',
  gag: '🇲🇩', crh: '🇺🇦', krc: '🇷🇺', chg: '🏳️', otk: '🏳️',
};

/**
 * Dil objesinden bayrak URL'sini oluşturur
 * @param {string} flagUrl - API'den gelen flagUrl (relative veya absolute)
 * @param {string} [baseUrl] - API base URL
 * @returns {string}
 */
export const getFlagImageUrl = (flagUrl, baseUrl = API_BASE_URL) => {
  if (!flagUrl || typeof flagUrl !== 'string') return '';
  if (flagUrl.startsWith('http://') || flagUrl.startsWith('https://')) return flagUrl;
  return `${baseUrl}${flagUrl.startsWith('/') ? flagUrl : '/' + flagUrl}`;
};

/**
 * Dil objesinden bayrak gösterimi - sadece emoji döndürür (eski tarayıcı uyumluluğu için JSX/img yok)
 * flagUrl varsa bile emoji kullan - img eski Safari/Android'de hydration/parse sorunlarına yol açabiliyor
 * @param {Object} lang - { code, name, flagUrl?, ... } API'den gelen dil objesi
 * @returns {string}
 */
export const getLanguageFlag = (lang) => {
  if (!lang) return '🌐';
  const code = (lang.code || '').toLowerCase();
  return FALLBACK_EMOJI_MAP[code] || '🌐';
};

/**
 * Sadece emoji döndürür (flagUrl yoksa fallback - eski API veya code ile çağrı için)
 * @param {string} code - Dil kodu
 * @returns {string}
 */
export const getFlagEmojiFallback = (code) => {
  return FALLBACK_EMOJI_MAP[(code || '').toLowerCase()] || '🌐';
};

/**
 * Dil kartları için bayrak emojisi — flagUrl yoksa dil kodu, yoksa ülke kodu
 */
export const getLanguageFlagEmoji = (lang, countryAlpha2) => {
  const byCode = getFlagEmojiFallback(lang?.code);
  if (byCode !== '🌐') return byCode;
  return getFlagEmojiFallback(countryAlpha2) || '🌐';
};
