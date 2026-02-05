'use client';

import { createContext, use, useMemo, useState, useCallback, useEffect } from 'react';
import { toggleDocumentAttribute } from '@/utils/layout';
const LayoutContext = createContext(undefined);
function useLayoutContext() {
  const context = use(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within an LayoutProvider');
  }
  return context;
}
const storageThemeKey = 'SOCIAL_NEXTJS_THEME_KEY';
const themeAttributeKey = 'data-bs-theme';
const LayoutProvider = ({
  children
}) => {
  const getSavedTheme = () => {
    const foundTheme = localStorage.getItem(storageThemeKey);
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (foundTheme) {
      if (foundTheme === 'auto') {
        toggleDocumentAttribute(themeAttributeKey, preferredTheme);
        return preferredTheme;
      }
      toggleDocumentAttribute(themeAttributeKey, foundTheme);
      return foundTheme;
    }
    if (!foundTheme) localStorage.setItem(storageThemeKey, preferredTheme);
    return preferredTheme;
  };
  const INIT_STATE = {
    theme: getSavedTheme()
  };
  const [settings, setSettings] = useState(INIT_STATE);
  const [offcanvasStates, setOffcanvasStates] = useState({
    showMobileMenu: false,
    showMessagingOffcanvas: false,
    showStartOffcanvas: false,
    showConversationPanel: false
  });
  const updateSettings = useCallback(_newSettings => {
    setSettings(prev => ({
      ...prev,
      ..._newSettings
    }));
  }, []);

  const updateTheme = useCallback(newTheme => {
    const currentTheme = document.documentElement.getAttribute(themeAttributeKey);
    if (currentTheme !== newTheme) {
      toggleDocumentAttribute(themeAttributeKey, newTheme);
      localStorage.setItem(storageThemeKey, newTheme);
      setSettings(prev => ({
        ...prev,
        theme: newTheme
      }));
    }
  }, []);

  const resetTheme = useCallback(() => {
    const defaultTheme = 'light';
    toggleDocumentAttribute(themeAttributeKey, defaultTheme);
    localStorage.setItem(storageThemeKey, defaultTheme);
    setSettings(prev => ({
      ...prev,
      theme: defaultTheme
    }));
  }, []);
  const toggleMessagingOffcanvas = useCallback(() => {
    setOffcanvasStates(prev => ({
      ...prev,
      showMessagingOffcanvas: !prev.showMessagingOffcanvas
    }));
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setOffcanvasStates(prev => ({
      ...prev,
      showMobileMenu: !prev.showMobileMenu
    }));
  }, []);

  const toggleStartOffcanvas = useCallback(() => {
    setOffcanvasStates(prev => ({
      ...prev,
      showStartOffcanvas: !prev.showStartOffcanvas
    }));
  }, []);

  const toggleConversationPanel = useCallback(() => {
    setOffcanvasStates(prev => ({
      ...prev,
      showConversationPanel: !prev.showConversationPanel
    }));
  }, []);
  const messagingOffcanvas = useMemo(() => ({
    open: offcanvasStates.showMessagingOffcanvas,
    toggle: toggleMessagingOffcanvas
  }), [offcanvasStates.showMessagingOffcanvas, toggleMessagingOffcanvas]);

  const mobileMenu = useMemo(() => ({
    open: offcanvasStates.showMobileMenu,
    toggle: toggleMobileMenu
  }), [offcanvasStates.showMobileMenu, toggleMobileMenu]);

  const startOffcanvas = useMemo(() => ({
    open: offcanvasStates.showStartOffcanvas,
    toggle: toggleStartOffcanvas
  }), [offcanvasStates.showStartOffcanvas, toggleStartOffcanvas]);

  const conversationPanel = useMemo(() => ({
    open: offcanvasStates.showConversationPanel,
    toggle: toggleConversationPanel
  }), [offcanvasStates.showConversationPanel, toggleConversationPanel]);

  const contextValue = useMemo(() => ({
    ...settings,
    updateTheme,
    resetTheme,
    messagingOffcanvas,
    mobileMenu,
    startOffcanvas,
    conversationPanel
  }), [
    settings,
    offcanvasStates.showMessagingOffcanvas,
    offcanvasStates.showMobileMenu,
    offcanvasStates.showStartOffcanvas,
    offcanvasStates.showConversationPanel,
    messagingOffcanvas,
    mobileMenu,
    startOffcanvas,
    conversationPanel,
    updateTheme
  ]);

  return <LayoutContext.Provider value={contextValue}>
    {children}
  </LayoutContext.Provider>;
};
export { LayoutProvider, useLayoutContext };