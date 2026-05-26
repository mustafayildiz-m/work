'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardBody, Col, Spinner, Alert } from 'react-bootstrap';
import { BsMicFill, BsCheckLg, BsArrowRight, BsSearch, BsXCircleFill } from 'react-icons/bs';
import { useCountries } from '@/hooks/useCountries';
import { useLanguage } from '@/context/useLanguageContext';
import { useRouter } from 'next/navigation';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import { getCountryDisplayName, getLocalizedLanguageName as langDisplayName } from '@/utils/countryLanguageDisplay';
import '../books/components/LanguageSelector.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getHiResFlag = (url) => {
  if (!url) return '';
  const resolved = getFlagImageUrl(url, API_URL);
  return resolved.replace('/w80/', '/w320/');
};

const PodcastLanguageSelector = () => {
  const { countries, loading, error } = useCountries();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [podcastCounts, setPodcastCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const continueButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchPodcastCounts = async () => {
      setLoadingCounts(true);
      const counts = {};
      try {
        const response = await fetch(`${API_URL}/podcasts?isActive=true&limit=1000`);
        if (!response.ok) throw new Error('podcasts_http_error');
        const data = await response.json();
        const allPodcasts = data.podcasts || [];
        allPodcasts.forEach((podcast) => {
          if (podcast.language) {
            counts[podcast.language] = (counts[podcast.language] || 0) + 1;
          }
        });
      } catch (err) {
        console.error('Error fetching podcast counts:', err);
      }
      setPodcastCounts(counts);
      setLoadingCounts(false);
    };
    fetchPodcastCounts();
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
    router.push(`/feed/podcasts/list?${params.toString()}`);
  };

  if (loading || loadingCounts) {
    return (
      <Col lg={9}>
        <Card className="cs-card">
          <CardBody className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">{t('podcasts.languageSelector.loadingLanguages')}</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={9}>
        <Card className="cs-card">
          <CardBody>
            <Alert variant="danger">
              <Alert.Heading>{t('podcasts.languageSelector.error')}</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={9}>
      <Card className="cs-card">
        {/* Header */}
        <div className="cs-header">
          <div className="cs-header__content">
            <div className="cs-header__title-row">
              <div className="cs-header__icon"><BsMicFill size={20} /></div>
              <h5 className="cs-header__title">{t('podcasts.languageSelector.title')}</h5>
            </div>
            <p className="cs-header__subtitle">{t('podcasts.languageSelector.subtitle')}</p>
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
            <div className="cs-grid">
              {filteredCountries.map((country) => {
                const lang = country.primaryLanguage;
                const hasLang = !!lang;
                const isSelected = selectedCountry?.id === country.id;
                const count = hasLang ? (podcastCounts[lang.code] || 0) : 0;
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
                      {t('podcasts.countrySelector.itemsCountPhrase', { count: String(count) })}
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
          )}

          {/* Continue */}
          {selectedCountry?.primaryLanguage && (
            <div ref={continueButtonRef} className="cs-action">
              <button type="button" className="cs-action__btn" onClick={handleContinue}>
                <BsCheckLg className="cs-action__btn-icon" />
                <span>
                  {t('podcasts.countrySelector.buttonLabel', {
                    language: langLabel(selectedCountry.primaryLanguage),
                  })}
                </span>
                <BsArrowRight className="cs-action__btn-arrow" />
              </button>
              <p className="cs-action__meta">
                {t('podcasts.countrySelector.availableLine', {
                  count: String(podcastCounts[selectedCountry.primaryLanguage.code] || 0),
                })}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default PodcastLanguageSelector;
