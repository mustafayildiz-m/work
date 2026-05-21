'use client';

import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useLanguages } from '@/hooks/useLanguages';
import { getFlagImageUrl } from '@/utils/language';
import './LanguageSwitcher.css';

const MenuList = (props) => {
  const { children, innerProps, innerRef } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="language-menu-list-responsive"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.25rem',
        padding: '0.5rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
};

// Mobil için: Modal + basit scroll listesi (react-select yok, %100 çalışır)
const MobileLanguageModal = ({ isOpen, onClose, options, locale, onChange, t, renderFlag, getTranslatedLanguageName }) => {
  const { theme: themeMode } = useLayoutContext();
  const isGreen = themeMode === 'green';
  const isDark = themeMode === 'dark' || isGreen;

  // Tema renkleri
  const theme = {
    light: {
      bg: '#ffffff',
      headerBorder: 'rgba(0,0,0,0.08)',
      text: '#1a1a1a',
      closeBtn: '#64748b',
      itemBg: 'rgba(0,0,0,0.04)',
      itemText: '#334155',
      selectedGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid rgba(118, 75, 162, 0.2)'
    },
    dark: {
      bg: '#1a1d29',
      headerBorder: 'rgba(255,255,255,0.1)',
      text: '#ffffff',
      closeBtn: '#94a3b8',
      itemBg: 'rgba(255,255,255,0.1)',
      itemText: '#e2e8f0',
      selectedGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    green: {
      bg: 'linear-gradient(180deg, #1b3d1b 0%, #1a331a 100%)',
      headerBorder: 'rgba(181, 231, 160, 0.15)',
      text: '#e8f5e9',
      closeBtn: '#81c784',
      itemBg: 'rgba(181, 231, 160, 0.08)',
      itemText: '#c8e6c9',
      selectedGradient: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
      shadow: '0 8px 32px rgba(27, 94, 32, 0.35)',
      border: '1px solid rgba(129, 199, 132, 0.25)'
    }
  };
  const c = theme[isGreen ? 'green' : (isDark ? 'dark' : 'light')];

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (code) => {
    onChange(code);
    onClose();
  };

  const modalContent = (
    <div
      className="language-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100dvh',
        zIndex: 1060,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="language-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          height: 'min(480px, calc(100dvh - 80px))',
          maxHeight: 'calc(100dvh - 80px)',
          background: c.bg,
          borderRadius: '20px',
          boxShadow: c.shadow,
          border: c.border,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${c.headerBorder}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: c.text }}>
            {t('menu.languageSelection') || 'DİL SEÇİMİ'}
          </span>
          <button
            onClick={onClose}
            style={{
              borderRadius: '8px',
              padding: '6px 12px',
              border: 'none',
              background: 'transparent',
              color: c.closeBtn,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {t('common.close') || 'Kapat'}
          </button>
        </div>

        <div
          className="language-modal-list"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === locale;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSelected ? c.selectedGradient : c.itemBg,
                  color: isSelected ? '#fff' : c.itemText,
                  fontSize: '14px',
                  fontWeight: isSelected ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  flexShrink: 0
                }}
              >
                <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>{renderFlag(option.value)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {getTranslatedLanguageName(option.value)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

const LanguageSwitcher = ({ variant = 'dropdown', compact = false }) => {
  const { locale, changeLocale, supportedLocales, t } = useLanguage();
  const { languages: apiLanguages } = useLanguages();
  const [mounted, setMounted] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // API'den gelen dillerin code -> flagUrl haritası
  const flagUrlMap = useMemo(() => {
    const map = {};
    if (apiLanguages?.length) {
      apiLanguages.forEach(lang => {
        if (lang.code && lang.flagUrl) {
          map[lang.code.toLowerCase()] = lang.flagUrl;
        }
      });
    }
    return map;
  }, [apiLanguages]);

  const getFlagEmoji = (code) => {
    const flagMap = {
      'tr': '🇹🇷', 'en': '🇬🇧', 'ar': '🇸🇦', 'de': '🇩🇪', 'fr': '🇫🇷', 'ja': '🇯🇵',
      'zh': '🇨🇳', 'hi': '🇮🇳', 'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺', 'it': '🇮🇹', 'ko': '🇰🇷',
      'uk': '🇺🇦', 'ku': '🇮🇶', 'ro': '🇷🇴', 'bg': '🇧🇬', 'sr': '🇷🇸', 'hu': '🇭🇺',
      'cs': '🇨🇿', 'pl': '🇵🇱', 'sk': '🇸🇰', 'sl': '🇸🇮', 'mk': '🇲🇰', 'hy': '🇦🇲',
      'mr': '🇮🇳', 'te': '🇮🇳', 'gu': '🇮🇳', 'ml': '🇮🇳', 'kn': '🇮🇳', 'or': '🇮🇳'
    };
    return flagMap[code] || '🌍';
  };

  // flagUrl varsa <img>, yoksa emoji fallback
  const renderFlag = (code, size = 20) => {
    const flagUrl = flagUrlMap[(code || '').toLowerCase()];
    if (flagUrl) {
      return (
        <img
          src={getFlagImageUrl(flagUrl)}
          alt={code}
          style={{
            width: size,
            height: Math.round(size * 0.75),
            objectFit: 'cover',
            borderRadius: 2,
            flexShrink: 0,
            display: 'inline-block',
            verticalAlign: 'middle'
          }}
        />
      );
    }
    return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{getFlagEmoji(code)}</span>;
  };

  // Dil kodundan Türkçe ismini döndür (backend'deki isim)
  const getTurkishLanguageName = (code) => {
    const nameMap = {
      'tr': 'Türkçe',
      'en': 'İngilizce',
      'ar': 'Arapça',
      'de': 'Almanca',
      'fr': 'Fransızca',
      'ja': 'Japonca',
      'zh': 'Çince',
      'hi': 'Hintçe',
      'es': 'İspanyolca',
      'pt': 'Portekizce',
      'ru': 'Rusça',
      'it': 'İtalyanca',
      'ko': 'Korece',
      'uk': 'Ukraynaca',
      'ku': 'Kürtçe',
      'ro': 'Rumence',
      'bg': 'Bulgarca',
      'sr': 'Sırpça',
      'hu': 'Macarca',
      'cs': 'Çekçe',
      'pl': 'Lehçe',
      'sk': 'Slovakça',
      'sl': 'Slovence',
      'mk': 'Makedonca',
      'hy': 'Ermenice',
      'mr': 'Marathi',
      'te': 'Telugu',
      'gu': 'Gujarati',
      'ml': 'Malayalam',
      'kn': 'Kannada',
      'or': 'Odia'
    };
    return nameMap[code] || code.toUpperCase();
  };

  // Seçili dile göre çevrilmiş dil ismini döndür
  const getTranslatedLanguageName = (code) => {
    const turkishName = getTurkishLanguageName(code);
    // Translation dosyasından çeviriyi al
    const translated = t(`books.languages.${turkishName}`);
    // Eğer çeviri bulunamazsa, Türkçe ismi döndür
    return translated && translated !== `books.languages.${turkishName}` ? translated : turkishName;
  };

  // Desteklenen tüm dilleri oluştur
  const languageOptions = useMemo(() => {
    return supportedLocales.map(code => ({
      value: code,
      label: getTranslatedLanguageName(code),
      code,
      flag: renderFlag(code),
      name: getTranslatedLanguageName(code)
    }));
  }, [supportedLocales, locale, t, flagUrlMap]);

  const currentOption = languageOptions.find(opt => opt.value === locale) || languageOptions[0];

  // Simple button variant (for auth pages)
  if (variant === 'simple') {
    return (
      <div
        className="d-flex gap-2 justify-content-center align-items-center flex-wrap language-switcher-simple-container"
        style={{
          maxWidth: '100%',
          overflowX: 'auto',
          padding: '0.25rem 0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
        }}
      >
        {languageOptions.map(opt => (
          <button
            key={opt.code}
            onClick={() => changeLocale(opt.code)}
            className={`btn btn-sm ${locale === opt.code ? 'btn-primary' : 'btn-outline-light'}`}
            style={{
              borderRadius: '8px',
              padding: '0.375rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: locale === opt.code ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
              background: locale === opt.code
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              color: locale === opt.code ? '#fff' : 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>{opt.flag}</span> {opt.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Auth pages select2 style (compact and elegant)
  const authStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '50px',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      boxShadow: state.isFocused ? '0 4px 12px rgba(102, 126, 234, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
      padding: '0 4px',
      minHeight: '42px',
      fontSize: '0.9rem',
      fontWeight: '600',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#667eea'
      }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      marginTop: '12px',
      zIndex: 10000,
      minWidth: '220px',
      maxWidth: 'calc(100vw - 2rem)',
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      animation: 'fadeInUp 0.3s ease-out'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 10000
    }),
    menuList: () => ({
      padding: 0
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem',
      fontWeight: state.isSelected ? '600' : '500',
      backgroundColor: state.isSelected
        ? '#667eea'
        : state.isFocused
          ? '#f8f9fa'
          : 'transparent',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected
          ? '#667eea'
          : '#f8f9fa'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1e293b !important',
      margin: 0,
      maxWidth: '100%',
      gridColumn: '1 / 2'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#64748b'
    }),
    input: (base) => ({
      ...base,
      color: '#1e293b'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#1e293b',
      padding: '0 8px'
    })
  };

  // Select2 style dropdown variant (for main app)
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '50px',
      border: '1px solid var(--bs-border-color, #e2e8f0)',
      boxShadow: state.isFocused ? '0 4px 12px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
      padding: '0.25rem 0.5rem',
      minHeight: '38px',
      fontSize: '0.85rem',
      fontWeight: '600',
      backgroundColor: 'var(--bs-body-bg, #fff)',
      '&:hover': {
        borderColor: '#667eea',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      border: '1px solid var(--bs-border-color, #e2e8f0)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      marginTop: '8px',
      zIndex: 9999,
      minWidth: 'min(320px, calc(100vw - 1rem))',
      maxWidth: 'calc(100vw - 1rem)',
      backgroundColor: 'var(--bs-body-bg, #fff)',
      overflow: 'hidden'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.5rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.25rem',
      maxHeight: 'min(400px, calc(100dvh - 120px))',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem',
      fontWeight: state.isSelected ? '600' : '500',
      backgroundColor: state.isSelected
        ? 'var(--bs-primary, #667eea)'
        : state.isFocused
          ? 'var(--bs-secondary-bg, #f8f9fa)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--bs-body-color, #000)',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--bs-primary, #667eea)'
          : 'var(--bs-secondary-bg, #f8f9fa)'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--bs-body-color, #000)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'var(--bs-body-color, #000)',
      padding: '0.25rem'
    })
  };

  // Auth variant - compact select2 for auth pages
  if (variant === 'auth') {
    if (!mounted) {
      return (
        <div className="language-switcher-select2" style={{ minWidth: '180px', maxWidth: '220px', position: 'relative', zIndex: 10000 }}>
          <div style={{
            height: '36px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Dil seç...
          </div>
        </div>
      );
    }

    return (
      <div className="language-switcher-select2" style={{ minWidth: '180px', maxWidth: '240px', position: 'relative', zIndex: 10000, overflow: 'visible' }}>
        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .language-select__menu {
            right: 0 !important;
            left: auto !important;
          }
        `}</style>
        <Select
          value={currentOption}
          onChange={(selectedOption) => {
            if (selectedOption) {
              changeLocale(selectedOption.value);
            }
          }}
          options={languageOptions}
          styles={authStyles}
          components={{ MenuList }}
          isSearchable={true}
          placeholder="Dil seç..."
          formatOptionLabel={({ flag, name }, { context }) => (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: context === 'menu' ? 'inherit' : '#334155',
              overflow: 'hidden'
            }}>
              <span style={{ minWidth: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{flag}</span>
              <span style={{
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {name}
              </span>
            </div>
          )}
          className="language-select"
          classNamePrefix="language-select"
          menuPortalTarget={mounted ? document.body : null}
          menuPosition="fixed"
          menuShouldScrollIntoView={true}
          menuPlacement="bottom"
          maxMenuHeight={800}
        />
      </div>
    );
  }

  // Mobil (compact): Modal ile basit liste - scroll %100 çalışır
  if (compact && mounted) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileModalOpen(true)}
          className="language-switcher-mobile-btn w-100 d-flex align-items-center justify-content-between border rounded-3 p-2"
          style={{
            background: 'rgba(118, 75, 162, 0.05)',
            borderColor: 'rgba(118, 75, 162, 0.1) !important',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span className="d-flex align-items-center gap-2">
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderFlag(locale, 18)}</span>
            <span>{(locale || 'tr').toUpperCase()}</span>
          </span>
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 11L3 6h10l-5 5z" />
          </svg>
        </button>
        <MobileLanguageModal
          isOpen={mobileModalOpen}
          onClose={() => setMobileModalOpen(false)}
          options={languageOptions}
          locale={locale}
          onChange={changeLocale}
          t={t}
          renderFlag={renderFlag}
          getTranslatedLanguageName={getTranslatedLanguageName}
        />
      </>
    );
  }

  // Desktop: react-select dropdown
  if (!mounted) {
    return (
      <div className="language-switcher-select2" style={{ minWidth: '200px', maxWidth: '250px' }}>
        <div style={{
          height: '38px',
          borderRadius: '50px',
          border: '1px solid var(--bs-border-color, #e2e8f0)',
          backgroundColor: 'var(--bs-body-bg, #fff)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="language-switcher-select2" style={{ minWidth: '200px', maxWidth: '250px', position: 'relative', zIndex: 1000 }}>
      <Select
        value={currentOption}
        onChange={(selectedOption) => changeLocale(selectedOption.value)}
        options={languageOptions}
        styles={customStyles}
        components={{ MenuList }}
        isSearchable={true}
        placeholder="Dil"
        formatOptionLabel={({ flag, name }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '1.5rem' }}>{flag}</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          </div>
        )}
        className="language-select"
        classNamePrefix="language-select"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuShouldScrollIntoView={true}
        menuPlacement="auto"
        maxMenuHeight={800}
      />
    </div>
  );
};

export default LanguageSwitcher;
