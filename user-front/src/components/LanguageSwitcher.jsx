'use client';

import { useMemo, useState, useEffect } from 'react';
import Select from 'react-select';
import { useLanguage } from '@/context/useLanguageContext';
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
        maxHeight: 'min(400px, 70vh)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {children}
    </div>
  );
};

const LanguageSwitcher = ({ variant = 'dropdown' }) => {
  const { locale, changeLocale, supportedLocales, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dil kodlarına göre bayrak emoji'leri
  const getFlagEmoji = (code) => {
    const flagMap = {
      'tr': '🇹🇷', 'en': '🇬🇧', 'ar': '🇸🇦', 'de': '🇩🇪', 'fr': '🇫🇷', 'ja': '🇯🇵',
      'zh': '🇨🇳', 'hi': '🇮🇳', 'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺', 'it': '🇮🇹', 'ko': '🇰🇷',
      'uk': '🇺🇦', 'ku': '🏳️', 'ro': '🇷🇴', 'bg': '🇧🇬', 'sr': '🇷🇸', 'hu': '🇭🇺',
      'cs': '🇨🇿', 'pl': '🇵🇱', 'sk': '🇸🇰', 'sl': '🇸🇮', 'mk': '🇲🇰', 'hy': '🇦🇲',
      'mr': '🇮🇳', 'te': '🇮🇳', 'gu': '🇮🇳', 'ml': '🇮🇳', 'kn': '🇮🇳', 'or': '🇮🇳'
    };
    return flagMap[code] || '🌍';
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
      label: `${getFlagEmoji(code)} ${getTranslatedLanguageName(code)}`,
      code,
      flag: getFlagEmoji(code),
      name: getTranslatedLanguageName(code)
    }));
  }, [supportedLocales, locale, t]);

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
            {opt.flag} {opt.code.toUpperCase()}
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
      minWidth: '320px',
      maxWidth: '400px',
      backgroundColor: 'var(--bs-body-bg, #fff)'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
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
              <span style={{ fontSize: '1.2rem', minWidth: '1.5rem' }}>{flag}</span>
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
        />
      </div>
    );
  }

  // Default dropdown variant (for main app)
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
        placeholder="Select language..."
        formatOptionLabel={({ flag, name }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{flag}</span>
            <span>{name}</span>
          </div>
        )}
        className="language-select"
        classNamePrefix="language-select"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuShouldScrollIntoView={false}
        menuPlacement="auto"
      />
    </div>
  );
};

export default LanguageSwitcher;
