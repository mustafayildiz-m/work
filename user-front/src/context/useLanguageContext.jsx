'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const LanguageContext = createContext(undefined);
// En çok konuşulan diller ve önemli diller
const SUPPORTED_LOCALES = [
  'tr', 'en', 'ar', 'de', 'fr', 'ja',  // Mevcut diller
  'zh', 'hi', 'es', 'pt', 'ru', 'it', 'ko',  // En çok konuşulan diller
  'uk', 'ku', 'ro', 'bg', 'sr', 'hu', 'cs', 'pl', 'sk', 'sl', 'mk', 'hy',  // Avrupa dilleri
  'mr', 'te', 'gu', 'ml', 'kn', 'or'  // Hindistan dilleri
];
const DEFAULT_LOCALE = 'en';
const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'yi'];

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe defaults instead of throwing error
    return {
      locale: DEFAULT_LOCALE,
      changeLocale: () => { },
      t: (key) => key,
      loading: true,
      supportedLocales: SUPPORTED_LOCALES,
      isRTL: false
    };
  }
  return context;
};

const getInitialLocale = () => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const saved = localStorage.getItem('locale');
  if (saved) {
    const n = saved.toLowerCase().split('-')[0].split('_')[0];
    if (SUPPORTED_LOCALES.includes(n)) return n;
  }
  const langs = [...(navigator.languages || []), navigator.language, navigator.userLanguage].filter(Boolean);
  for (const l of langs) {
    const n = (l || '').toLowerCase().split('-')[0].split('_')[0];
    if (n && SUPPORTED_LOCALES.includes(n)) return n;
  }
  return DEFAULT_LOCALE;
};

export const LanguageProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [locale, setLocaleState] = useState(getInitialLocale);
  const [messages, setMessages] = useState({});
  const [fallbackMessages, setFallbackMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const hasSyncedBackendLanguageRef = useRef(false);

  const normalizeLocale = useCallback((value) => {
    if (!value || typeof value !== 'string') return null;
    return value.toLowerCase().split('-')[0].split('_')[0];
  }, []);

  const resolveInitialLocale = useCallback(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    const savedLocale = localStorage.getItem('locale');
    const normalizedSavedLocale = normalizeLocale(savedLocale);
    if (normalizedSavedLocale && SUPPORTED_LOCALES.includes(normalizedSavedLocale)) {
      return normalizedSavedLocale;
    }

    const browserLocales = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
      navigator.userLanguage
    ].filter(Boolean);

    for (const localeCandidate of browserLocales) {
      const normalizedLocale = normalizeLocale(localeCandidate);
      if (normalizedLocale && SUPPORTED_LOCALES.includes(normalizedLocale)) {
        return normalizedLocale;
      }
    }

    return DEFAULT_LOCALE;
  }, [normalizeLocale]);

  // Load translations
  const loadMessages = useCallback(async (newLocale) => {
    try {
      setLoading(true);
      const response = await import(`../i18n/messages/${newLocale}.json`);
      setMessages(response.default || response);

      // Always keep default locale as fallback (English by default)
      if (newLocale !== DEFAULT_LOCALE) {
        const fallback = await import(`../i18n/messages/${DEFAULT_LOCALE}.json`);
        setFallbackMessages(fallback.default || fallback);
      } else {
        setFallbackMessages(response.default || response);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading translation file:', error);

      // PRODUCTION FIX: Handle ChunkLoadError (usually after new deployment)
      if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk') || error?.message?.includes('ChunkLoadError')) {
        console.warn('ChunkLoadError detected during translation loading. Reloading page...');
        if (typeof window !== 'undefined') {
          // Prevent infinite reload loop by adding a flag to sessionStorage
          const reloadFlagKey = `reload_count_${newLocale}`;
          const reloadCount = parseInt(sessionStorage.getItem(reloadFlagKey) || '0');

          if (reloadCount < 1) {
            sessionStorage.setItem(reloadFlagKey, (reloadCount + 1).toString());
            window.location.reload();
            return;
          }
        }
      }

      // Fallback to default locale
      if (newLocale !== DEFAULT_LOCALE) {
        try {
          const fallback = await import(`../i18n/messages/${DEFAULT_LOCALE}.json`);
          setMessages(fallback.default || fallback);
          setFallbackMessages(fallback.default || fallback);
        } catch (fbError) {
          console.error('Even fallback translation loading failed:', fbError);
        }
      }
      setLoading(false);
    }
  }, []);

  // Initialize locale from saved preference or browser/system language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialLocale = resolveInitialLocale();
      setLocaleState(initialLocale);
      loadMessages(initialLocale);
      document.documentElement.dir = RTL_LANGUAGES.includes(initialLocale) ? 'rtl' : 'ltr';
      document.documentElement.lang = initialLocale;
    }
  }, [loadMessages, resolveInitialLocale]);

  // Change locale
  const changeLocale = useCallback((newLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    loadMessages(newLocale);

    // Update document direction for RTL languages (Arabic, Hebrew, Urdu, Farsi, etc.)
    if (typeof window !== 'undefined') {
      document.documentElement.dir = RTL_LANGUAGES.includes(newLocale) ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
    }
  }, [loadMessages]);

  // Sync backend language only once per authenticated session.
  // This prevents manual UI selections from being immediately overwritten.
  useEffect(() => {
    if (status !== 'authenticated') {
      hasSyncedBackendLanguageRef.current = false;
      return;
    }

    if (hasSyncedBackendLanguageRef.current) return;

    const backendLanguage = normalizeLocale(session?.user?.language);
    if (!backendLanguage || !SUPPORTED_LOCALES.includes(backendLanguage)) {
      hasSyncedBackendLanguageRef.current = true;
      return;
    }

    if (typeof window !== 'undefined') {
      const savedLocale = normalizeLocale(localStorage.getItem('locale'));
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
        hasSyncedBackendLanguageRef.current = true;
        return;
      }
    }

    if (backendLanguage !== locale) {
      changeLocale(backendLanguage);
    }

    hasSyncedBackendLanguageRef.current = true;
  }, [status, session?.user?.language, locale, changeLocale, normalizeLocale]);

  // Translation function with nested key support
  const t = useCallback((key, params = {}) => {
    const getNested = (source) => {
      const keys = key.split('.');
      let value = source;

      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return undefined;
        }
      }

      return typeof value === 'string' ? value : undefined;
    };

    const template = getNested(messages) ?? getNested(fallbackMessages);
    if (!template) return key; // Keep legacy behavior (show key)

    // Replace parameters like {name}
    let result = template;
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param]);
    });

    return result;
  }, [messages, fallbackMessages]);

  const value = {
    locale,
    changeLocale,
    t,
    loading,
    supportedLocales: SUPPORTED_LOCALES,
    isRTL: RTL_LANGUAGES.includes(locale)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
