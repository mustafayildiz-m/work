/**
 * Fired during logout so the panel returns to Kyrgyz (I18N_DEFAULT_LANGUAGE)
 * and clears the previous session UI language when the next session starts.
 */
export const ADMIN_I18N_RESET_TO_DEFAULT_EVENT =
  'iw-admin-i18n-reset-to-default';

export function resetAdminUiLanguageToDefault() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_I18N_RESET_TO_DEFAULT_EVENT));
  }
}
