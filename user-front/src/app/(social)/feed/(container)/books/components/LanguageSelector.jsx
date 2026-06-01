'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardBody, Spinner, Alert } from 'react-bootstrap';
import { BsGlobe, BsCheckLg, BsArrowRight, BsSearch, BsXCircleFill } from 'react-icons/bs';
import { useCountries } from '@/hooks/useCountries';
import { useLanguage } from '@/context/useLanguageContext';
import { useBookCounts } from '@/hooks/useBookCounts';
import { useRouter } from 'next/navigation';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import { getCountryDisplayName, getLocalizedLanguageName as langDisplayName } from '@/utils/countryLanguageDisplay';
import './LanguageSelector.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getHiResFlag = (url) => {
  if (!url) return '';
  const resolved = getFlagImageUrl(url, API_BASE_URL);
  return resolved.replace('/w80/', '/w320/');
};

const LanguageSelector = () => {
  const { countries, loading, error } = useCountries();
  const { t, locale } = useLanguage();
  const { getBookCount } = useBookCounts();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const continueButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  const countryLabel = (c) => getCountryDisplayName(c, locale);
  const langLabel = (lng) => langDisplayName(lng, t);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const q = searchQuery.toLowerCase().trim();
    return countries.filter((c) => {
      const locName = getCountryDisplayName(c, locale)?.toLowerCase() || '';
      const origName = (c.name || '').toLowerCase();
      const langName = c.primaryLanguage ? (langDisplayName(c.primaryLanguage, t) || '').toLowerCase() : '';
      const alpha2 = (c.alpha2 || '').toLowerCase();
      return locName.includes(q) || origName.includes(q) || langName.includes(q) || alpha2.includes(q);
    });
  }, [countries, searchQuery, locale, t]);

  const handleCountrySelect = (country) => {
    if (!country?.primaryLanguage) return;
    setSelectedCountry(country);
    setTimeout(() => {
      continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleContinue = () => {
    const lang = selectedCountry?.primaryLanguage;
    if (!selectedCountry || !lang) return;
    const params = new URLSearchParams({
      languageId: String(lang.id),
      languageName: lang.name || '',
      languageCode: lang.code || '',
      countryAlpha2: selectedCountry.alpha2 || '',
    });
    router.push(`/feed/books/list?${params.toString()}`);
  };

  if (loading) {
    return (
      <Card className="cs-card cs-card--full-height">
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{t('books.languageSelector.loading')}</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="cs-card cs-card--full-height">
        <CardBody>
          <Alert variant="danger">
            <Alert.Heading>{t('books.languageSelector.errorTitle')}</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="cs-card cs-card--full-height cs-card--books">
      {/* Header */}
      <div className="cs-header">
        <div className="cs-header__content">
          <div className="cs-header__title-row">
            <div className="cs-header__icon"><BsGlobe size={20} /></div>
            <h5 className="cs-header__title">{t('books.languageSelector.title')}</h5>
          </div>
          <p className="cs-header__subtitle">{t('books.languageSelector.subtitle')}</p>
        </div>
        <div className="cs-header__badge">{t('common.countrySelector.totalCountries', { count: countries.length })}</div>
      </div>

      {/* Search */}
      <div className="cs-search">
        <div className="cs-search__wrapper">
          <BsSearch className="cs-search__icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="cs-search__input"
            placeholder={t('common.countrySelector.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="cs-search__clear"
              onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
              aria-label={t('common.countrySelector.clearSearch')}
            >
              <BsXCircleFill size={16} />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="cs-search__count">
            {t('common.countrySelector.showingFiltered', {
              filtered: filteredCountries.length,
              total: countries.length,
            })}
          </span>
        )}
      </div>

      {/* Grid */}
      <CardBody className="cs-body">
        {filteredCountries.length === 0 ? (
          <div className="cs-empty">
            <BsSearch size={48} className="cs-empty__icon" />
            <h6 className="cs-empty__title">{t('common.countrySelector.noResults')}</h6>
            <p className="cs-empty__desc">{t('common.countrySelector.noResultsDesc')}</p>
          </div>
        ) : (
          <div className="cs-grid-scroll">
            <div className="cs-grid">
            {filteredCountries.map((country) => {
              const lang = country.primaryLanguage;
              const hasLang = !!lang;
              const isSelected = selectedCountry?.id === country.id;
              return (
                <button
                  key={country.id}
                  type="button"
                  className={`cs-country ${isSelected ? 'cs-country--selected' : ''} ${!hasLang ? 'cs-country--disabled' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                  disabled={!hasLang}
                  title={hasLang ? countryLabel(country) : t('common.countrySelector.tooltipNoLanguage', { country: countryLabel(country) })}
                >
                  <div className="cs-country__flag">
                    {country.flagUrl ? (
                      <img
                        src={getHiResFlag(country.flagUrl)}
                        alt={t('common.countrySelector.flagAlt', { country: countryLabel(country) })}
                        loading="lazy"
                      />
                    ) : (
                      <span className="cs-country__flag-emoji">
                        {getFlagEmojiFallback(country.alpha2?.toLowerCase())}
                      </span>
                    )}
                  </div>
                  <div className="cs-country__info">
                    <span className="cs-country__name">{countryLabel(country)}</span>
                    <span className="cs-country__lang">
                      {hasLang ? langLabel(lang) : t('common.countrySelector.noLanguageShort')}
                    </span>
                  </div>
                  <div className="cs-country__count">
                    {hasLang ? getBookCount(lang.code) : 0} {t('books.page.bookCount')}
                  </div>
                  {isSelected && (
                    <div className="cs-country__check">
                      <BsCheckLg size={10} />
                    </div>
                  )}
                </button>
              );
            })}
            </div>
          </div>
        )}

        {/* Continue */}
        {selectedCountry?.primaryLanguage && (
          <div ref={continueButtonRef} className="cs-action">
            <button type="button" className="cs-action__btn" onClick={handleContinue}>
              <BsCheckLg className="cs-action__btn-icon" />
              <span>
                {t('books.languageSelector.viewBooks', {
                  language: langLabel(selectedCountry.primaryLanguage),
                })}
              </span>
              <BsArrowRight className="cs-action__btn-arrow" />
            </button>
            <p className="cs-action__meta">
              {t('books.languageSelector.booksAvailable', {
                count: getBookCount(selectedCountry.primaryLanguage.code),
              })}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default LanguageSelector;
