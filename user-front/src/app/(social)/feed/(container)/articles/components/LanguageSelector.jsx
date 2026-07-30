'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardBody, Spinner, Alert } from 'react-bootstrap';
import { BsCheckLg, BsArrowRight, BsFileText, BsSearch, BsXCircleFill, BsArrowLeft } from 'react-icons/bs';
import { useCountries } from '@/hooks/useCountries';
import { useLanguage } from '@/context/useLanguageContext';
import { useRouter } from 'next/navigation';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import { getCountryDisplayName, getLocalizedLanguageName as langDisplayName } from '@/utils/countryLanguageDisplay';
import '../../books/components/LanguageSelector.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getHiResFlag = (url) => {
  if (!url) return '';
  const resolved = getFlagImageUrl(url, API_BASE_URL);
  return resolved.replace('/w80/', '/w320/');
};

function getCountryLanguages(country) {
  const cl = country.countryLanguages;
  if (cl && cl.length > 0) {
    return cl
      .filter((entry) => entry.language)
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.displayOrder - b.displayOrder;
      })
      .map((entry) => entry.language);
  }
  if (country.primaryLanguage) return [country.primaryLanguage];
  return [];
}

const LanguageSelector = () => {
  const { countries, loading, error } = useCountries();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const continueButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  const [articleCounts, setArticleCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchArticleCounts = async () => {
      try {
        setCountsLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/languages/article-counts`, { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const countsMap = {};
        data.forEach((item) => { countsMap[item.languageId] = item.articleCount; });
        setArticleCounts(countsMap);
      } catch (err) {
        console.error('Error fetching article counts:', err);
      } finally {
        setCountsLoading(false);
      }
    };
    fetchArticleCounts();
  }, []);

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

    const langs = getCountryLanguages(country);

    if (langs.length <= 1) {
      setSelectedLanguage(langs[0] || country.primaryLanguage);
      setShowLangPicker(false);
    } else {
      setSelectedLanguage(null);
      setShowLangPicker(true);
    }

    setTimeout(() => {
      continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleLanguagePick = (lang) => {
    setSelectedLanguage(lang);
    setTimeout(() => {
      continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedLanguage(null);
    setShowLangPicker(false);
  };

  const handleContinue = () => {
    if (!selectedCountry || !selectedLanguage) return;
    const params = new URLSearchParams({
      languageId: String(selectedLanguage.id),
      languageName: selectedLanguage.name || '',
      languageCode: selectedLanguage.code || '',
      countryAlpha2: selectedCountry.alpha2 || '',
    });
    router.push(`/feed/articles/list?${params.toString()}`);
  };

  if (loading) {
    return (
      <Card className="cs-card cs-card--full-height">
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{t('articles.languageSelector.loadingLanguages')}</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="cs-card cs-card--full-height">
        <CardBody>
          <Alert variant="danger">
            <Alert.Heading>{t('articles.languageSelector.error')}</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="cs-card cs-card--full-height cs-card--articles">
      {/* Header */}
      <div className="cs-header">
        <div className="cs-header__content">
          <div className="cs-header__title-row">
            <div className="cs-header__icon"><BsFileText size={20} /></div>
            <h5 className="cs-header__title">{t('articles.languageSelector.title')}</h5>
          </div>
          <p className="cs-header__subtitle">{t('articles.languageSelector.subtitle')}</p>
        </div>
        <div className="cs-header__badge">{t('common.countrySelector.totalCountries', { count: countries.length })}</div>
      </div>

      {/* Search — hidden during language sub-picker */}
      {!showLangPicker && (
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
      )}

      {/* Grid */}
      <CardBody className="cs-body">
        {/* Language sub-picker for multilingual countries */}
        {showLangPicker && selectedCountry ? (
          <div>
            <button
              type="button"
              onClick={handleBackToCountries}
              style={{ background: 'transparent', color: 'var(--cs-text)', border: 'none', padding: '8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <BsArrowLeft size={16} />
              <span>{t('books.languageSelector.backToCountries')}</span>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {selectedCountry.flagUrl && (
                <img
                  src={getHiResFlag(selectedCountry.flagUrl)}
                  alt={countryLabel(selectedCountry)}
                  style={{ height: '80px', borderRadius: '8px', margin: '0 auto 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'block' }}
                />
              )}
              <h6 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{countryLabel(selectedCountry)}</h6>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                {t('books.languageSelector.chooseLanguage')}
              </p>
            </div>

            <div className="cs-grid">
              {getCountryLanguages(selectedCountry).map((lang) => {
                const isLangSelected = selectedLanguage?.id === lang.id;
                const count = articleCounts[lang.id] || 0;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    className={`cs-country ${isLangSelected ? 'cs-country--selected' : ''}`}
                    onClick={() => handleLanguagePick(lang)}
                  >
                    {lang.flagUrl && (
                      <div style={{ width: '28px', height: '20px', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={getFlagImageUrl(lang.flagUrl, API_BASE_URL)}
                          alt={langLabel(lang)}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="cs-country__info" style={{ flex: 1 }}>
                      <span className="cs-country__name">{langLabel(lang)}</span>
                      <span className="cs-country__lang">{lang.code}</span>
                    </div>
                    {!countsLoading && (
                      <div className="cs-country__count">
                        {t('articles.countrySelector.itemsCountPhrase', { count: String(count) })}
                      </div>
                    )}
                    {isLangSelected && (
                      <div className="cs-country__check">
                        <BsCheckLg size={10} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
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
                  const count = hasLang ? (articleCounts[lang.id] || 0) : 0;
                  const langs = getCountryLanguages(country);
                  const extraCount = langs.length > 1 ? langs.length : 0;
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
                          {extraCount > 0 && (
                            <span style={{ marginLeft: '4px', opacity: 0.7 }}>+{extraCount - 1}</span>
                          )}
                        </span>
                      </div>
                      {!countsLoading && (
                        <div className="cs-country__count">
                          {t('articles.countrySelector.itemsCountPhrase', { count: String(count) })}
                        </div>
                      )}
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
          </>
        )}

        {/* Continue */}
        {selectedLanguage && (
          <div ref={continueButtonRef} className="cs-action">
            <button type="button" className="cs-action__btn" onClick={handleContinue}>
              <BsCheckLg className="cs-action__btn-icon" />
              <span>
                {t('articles.countrySelector.buttonLabel', {
                  language: langLabel(selectedLanguage),
                })}
              </span>
              <BsArrowRight className="cs-action__btn-arrow" />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default LanguageSelector;
