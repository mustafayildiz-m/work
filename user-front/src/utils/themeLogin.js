/** Oturum açıldıktan sonra varsayılan (yeşil) temayı uygulamak için — LayoutProvider dinler. */
export const THEME_AFTER_LOGIN_EVENT = 'iw-theme-after-login';

/** Google OAuth ile giriş öncesi sessionStorage bayrağı; dönüşte tema sıfırlanır. */
export const THEME_RESET_SESSION_FLAG = 'iw_theme_reset_after_login';

export function dispatchThemeAfterLogin(theme = 'green') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(THEME_AFTER_LOGIN_EVENT, { detail: { theme } }));
}
