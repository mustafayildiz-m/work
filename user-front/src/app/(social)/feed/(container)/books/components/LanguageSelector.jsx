'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { BsGlobe, BsCheckLg, BsArrowRight } from 'react-icons/bs';
import { useCountries } from '@/hooks/useCountries';
import { useLanguage } from '@/context/useLanguageContext';
import { useBookCounts } from '@/hooks/useBookCounts';
import { useRouter } from 'next/navigation';
import { useLayoutContext } from '@/context/useLayoutContext';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import { getCountryDisplayName, getLocalizedLanguageName as langDisplayName } from '@/utils/countryLanguageDisplay';
import './LanguageSelector.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const LanguageSelector = () => {
  const { countries, loading, error } = useCountries();
  const { t, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const { getBookCount } = useBookCounts();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const isDark = theme === 'dark' || theme === 'green';
  const continueButtonRef = useRef(null);

  const handleCountrySelect = (country) => {
    if (!country?.primaryLanguage) return;
    setSelectedCountry(country);

    setTimeout(() => {
      if (continueButtonRef.current) {
        continueButtonRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
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

  const countryLabel = (c) => getCountryDisplayName(c, locale);
  const langLabel = (lng) => langDisplayName(lng, t);

  if (loading) {
    return (
      <Card className="mb-4">
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('books.languageSelector.loading')}</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
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
    <Card className="mb-3 mb-md-4 border-0 shadow-lg language-selector-container">
      <CardHeader className="bg-gradient text-white border-0 py-2 py-md-3" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <CardTitle className="mb-0 d-flex align-items-center" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>
          <BsGlobe className="me-2" size={24} />
          {t('books.languageSelector.title')}
        </CardTitle>
        <p className="mb-0 mt-1 mt-md-2 opacity-90 small" style={{ fontSize: '0.8rem' }}>
          {t('books.languageSelector.subtitle')}
        </p>
      </CardHeader>
      <CardBody className="p-2 p-sm-3 p-md-4">
        <Row className="g-2 g-sm-3">
          {countries.map((country) => {
            const lang = country.primaryLanguage;
            const hasLang = !!lang;
            const isSelected = selectedCountry?.id === country.id;
            return (
              <Col key={country.id} xs={4} sm={4} md={3} lg={2}>
                <Button
                  variant={isSelected ? 'primary' : 'outline-primary'}
                  className={`w-100 p-0 h-100 d-flex flex-column align-items-stretch justify-content-start position-relative lang-box ${isSelected ? 'active shadow' : ''}`}
                  style={{
                    minHeight: '140px',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    opacity: hasLang ? 1 : 0.55,
                    cursor: hasLang ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => handleCountrySelect(country)}
                  disabled={!hasLang}
                  onMouseEnter={(e) => {
                    if (!isSelected && hasLang) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 8px 25px rgba(0, 0, 0, 0.5)'
                        : '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  title={
                    hasLang
                      ? countryLabel(country)
                      : t('common.countrySelector.tooltipNoLanguage', {
                          country: countryLabel(country),
                        })
                  }
                >
                  <div
                    className="w-100 lang-flag-area"
                    style={{
                      height: '56px',
                      overflow: 'hidden',
                      borderTopLeftRadius: '13px',
                      borderTopRightRadius: '13px',
                      filter: isSelected ? 'none' : 'grayscale(0.3)'
                    }}
                  >
                    {country.flagUrl ? (
                      <img
                        src={getFlagImageUrl(country.flagUrl, API_BASE_URL)}
                        alt={t('common.countrySelector.flagAlt', {
                          country: countryLabel(country),
                        })}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div className="lang-flag-emoji" style={{ fontSize: '2rem', lineHeight: '56px', textAlign: 'center' }}>
                        {getFlagEmojiFallback(country.alpha2?.toLowerCase())}
                      </div>
                    )}
                  </div>
                  <div
                    className="fw-bold text-center lang-text mt-2 px-2"
                    style={{ fontSize: '0.85rem', lineHeight: '1.1' }}
                  >
                    {countryLabel(country)}
                  </div>
                  <div
                    className="text-center lang-sublabel px-2"
                    style={{
                      fontSize: '0.7rem',
                      opacity: 0.85,
                      marginTop: '0.15rem',
                    }}
                  >
                    {hasLang ? langLabel(lang) : t('common.countrySelector.noLanguageShort')}
                  </div>
                  <div
                    className="mt-1 mb-2 px-2 py-1 rounded-pill lang-badge align-self-center"
                    style={{ fontSize: '0.7rem', fontWeight: '600' }}
                  >
                    {hasLang ? getBookCount(lang.code) : 0} {t('books.page.bookCount')}
                  </div>
                  {isSelected && (
                    <div
                      className="position-absolute top-0 end-0 lang-check-badge"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BsCheckLg size={12} color="white" />
                    </div>
                  )}
                </Button>
              </Col>
            );
          })}
        </Row>

        {selectedCountry && selectedCountry.primaryLanguage && (
          <div ref={continueButtonRef} className="text-center mt-3 mt-md-4 animate-fade-in">
            <Button
              variant="success"
              size="lg"
              className="px-4 px-md-5 py-2 py-md-3 rounded-pill shadow-lg"
              onClick={handleContinue}
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <BsCheckLg className="me-2" />
              {t('books.languageSelector.viewBooks', {
                language: langLabel(selectedCountry.primaryLanguage),
              })}
              <BsArrowRight className="ms-2" />
            </Button>
            <div className="mt-2 text-muted small">
              {t('books.languageSelector.booksAvailable', {
                count: getBookCount(selectedCountry.primaryLanguage.code),
              })}
            </div>
          </div>
        )}
      </CardBody>
      <style jsx global>{`
        .lang-box {
          background-color: #ffffff !important;
          border: 2px solid #e9ecef !important;
          transition: all 0.3s ease !important;
        }
        .lang-box:hover {
          transform: translateY(-2px) !important;
        }
        .lang-box.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-color: #667eea !important;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        }
        .lang-text {
          color: #495057 !important;
        }
        .lang-sublabel {
          color: #6c757d !important;
        }
        .lang-box.active .lang-text,
        .lang-box.active .lang-sublabel {
          color: #ffffff !important;
        }
        .lang-badge {
          background-color: #e9ecef !important;
          color: #6c757d !important;
          border: 1px solid #dee2e6 !important;
        }
        .lang-box.active .lang-badge {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        /* Dark Mode */
        [data-bs-theme="dark"] .lang-box {
          background-color: #2c3034 !important;
          border-color: #454d55 !important;
        }
        [data-bs-theme="dark"] .lang-box:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5) !important;
        }
        [data-bs-theme="dark"] .lang-text {
          color: #dee2e6 !important;
        }
        [data-bs-theme="dark"] .lang-sublabel {
          color: #adb5bd !important;
        }
        [data-bs-theme="dark"] .lang-badge {
          background-color: #3d4246 !important;
          color: #adb5bd !important;
          border-color: #495057 !important;
        }

        [data-bs-theme="dark"] .lang-box.active .lang-text,
        [data-bs-theme="dark"] .lang-box.active .lang-sublabel,
        [data-bs-theme="dark"] .lang-box.active .lang-badge {
          color: #ffffff !important;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 767.98px) {
          .lang-box {
            min-height: 108px !important;
            border-radius: 10px !important;
          }
          .lang-flag-area {
            height: 38px !important;
            border-top-left-radius: 8px !important;
            border-top-right-radius: 8px !important;
          }
          .lang-flag-emoji {
            font-size: 1.4rem !important;
            line-height: 38px !important;
          }
          .lang-text {
            font-size: 0.7rem !important;
            margin-top: 0.25rem !important;
            padding: 0 0.25rem !important;
          }
          .lang-sublabel {
            font-size: 0.6rem !important;
          }
          .lang-badge {
            font-size: 0.6rem !important;
            margin-top: 0.15rem !important;
            margin-bottom: 0.35rem !important;
            padding: 0.15rem 0.35rem !important;
          }
          .lang-check-badge {
            margin: 0.25rem !important;
            width: 18px !important;
            height: 18px !important;
          }
          .lang-check-badge svg {
            width: 10px !important;
            height: 10px !important;
          }
        }
        @media (max-width: 399.98px) {
          .lang-box {
            min-height: 96px !important;
            border-radius: 8px !important;
          }
          .lang-flag-area {
            height: 32px !important;
          }
          .lang-flag-emoji {
            font-size: 1.2rem !important;
            line-height: 32px !important;
          }
          .lang-text {
            font-size: 0.65rem !important;
          }
          .lang-sublabel {
            font-size: 0.55rem !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default LanguageSelector;
