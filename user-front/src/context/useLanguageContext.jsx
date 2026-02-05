'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(undefined);
// En çok konuşulan diller ve önemli diller
const SUPPORTED_LOCALES = [
  'tr', 'en', 'ar', 'de', 'fr', 'ja',  // Mevcut diller
  'zh', 'hi', 'es', 'pt', 'ru', 'it', 'ko',  // En çok konuşulan diller
  'uk', 'ku', 'ro', 'bg', 'sr', 'hu', 'cs', 'pl', 'sk', 'sl', 'mk', 'hy',  // Avrupa dilleri
  'mr', 'te', 'gu', 'ml', 'kn', 'or'  // Hindistan dilleri
];
const DEFAULT_LOCALE = 'en';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe defaults instead of throwing error
    return {
      locale: DEFAULT_LOCALE,
      changeLocale: () => {},
      t: (key) => key,
      loading: true,
      supportedLocales: SUPPORTED_LOCALES,
      isRTL: false
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [messages, setMessages] = useState({});
  const [fallbackMessages, setFallbackMessages] = useState({});
  const [loading, setLoading] = useState(true);

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
      // Fallback to default locale
      if (newLocale !== DEFAULT_LOCALE) {
        const fallback = await import(`../i18n/messages/${DEFAULT_LOCALE}.json`);
        setMessages(fallback.default || fallback);
        setFallbackMessages(fallback.default || fallback);
      }
      setLoading(false);
    }
  }, []);

  // Initialize locale from localStorage or default to English
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale');
      
      let initialLocale = DEFAULT_LOCALE; // Default to English
      
      // Only use saved locale if it exists and is supported
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
        initialLocale = savedLocale;
      }
      
      setLocaleState(initialLocale);
      loadMessages(initialLocale);
    }
  }, [loadMessages]);

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
    const rtlLanguages = ['ar', 'he', 'ur', 'fa', 'yi'];
    if (typeof window !== 'undefined') {
      document.documentElement.dir = rtlLanguages.includes(newLocale) ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
    }
  }, [loadMessages]);

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
    isRTL: ['ar', 'he', 'ur', 'fa', 'yi'].includes(locale)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
