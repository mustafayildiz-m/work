'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { BsMicFill, BsCheckLg, BsArrowRight } from 'react-icons/bs';
import { useLanguages } from '@/hooks/useLanguages';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PodcastLanguageSelector = () => {
  const { languages, loading, error } = useLanguages();
  const { t } = useLanguage();
  const { theme } = useLayoutContext();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const isDark = theme === 'dark';
  const [podcastCounts, setPodcastCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const continueButtonRef = useRef(null);

  // Tüm podcastleri çek ve dillere göre say
  useEffect(() => {
    const fetchPodcastCounts = async () => {
      setLoadingCounts(true);
      const counts = {};

      try {
        // Tüm aktif podcastleri bir kerede çek
        const response = await fetch(`${API_URL}/podcasts?isActive=true&limit=1000`);
        if (!response.ok) throw new Error('Podcastler yüklenemedi');

        const data = await response.json();
        const allPodcasts = data.podcasts || [];

        // Her dil için sıfırdan başlat
        languages.forEach(language => {
          counts[language.code] = 0;
        });

        // Podcastleri dillere göre say
        allPodcasts.forEach(podcast => {
          if (podcast.language && counts.hasOwnProperty(podcast.language)) {
            counts[podcast.language]++;
          }
        });

      } catch (err) {
        console.error('Error fetching podcast counts:', err);
        languages.forEach(language => {
          counts[language.code] = 0;
        });
      }

      setPodcastCounts(counts);
      setLoadingCounts(false);
    };

    if (languages.length > 0) {
      fetchPodcastCounts();
    }
  }, [languages]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);

    setTimeout(() => {
      if (continueButtonRef.current) {
        continueButtonRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleContinue = () => {
    if (!selectedLanguage) return;

    const params = new URLSearchParams({
      languageId: selectedLanguage.id.toString(),
      languageName: selectedLanguage.name,
      languageCode: selectedLanguage.code
    });

    router.push(`/feed/podcasts/list?${params.toString()}`);
  };

  const getLocalizedLanguageName = (language) => {
    return t(`books.languages.${language.name}`) || language.name;
  };

  const getFlagEmoji = (code) => {
    const flagMap = {
      'tr': '🇹🇷', 'en': '🇬🇧', 'ar': '🇸🇦', 'fa': '🇮🇷', 'ur': '🇵🇰',
      'de': '🇩🇪', 'fr': '🇫🇷', 'es': '🇪🇸', 'it': '🇮🇹', 'ru': '🇷🇺',
      'zh': '🇨🇳', 'ja': '🇯🇵', 'ko': '🇰🇷', 'nl': '🇳🇱', 'pt': '🇵🇹',
      'sv': '🇸🇪', 'no': '🇳🇴', 'da': '🇩🇰', 'fi': '🇫🇮', 'el': '🇬🇷',
      'he': '🇮🇱', 'hi': '🇮🇳', 'bn': '🇧🇩', 'ta': '🇱🇰', 'th': '🇹🇭',
      'vi': '🇻🇳', 'id': '🇮🇩', 'ms': '🇲🇾', 'tl': '🇵🇭', 'sw': '🇹🇿',
      'kk': '🇰🇿', 'uz': '🇺🇿', 'ky': '🇰🇬', 'tk': '🇹🇲', 'az': '🇦🇿',
      'ps': '🇦🇫', 'ha': '🇳🇬', 'ota': '🇹🇷',
    };
    return flagMap[code] || '🏳️';
  };

  const getFlagImageUrl = (flagUrl) => {
    if (!flagUrl) return '';
    if (flagUrl.startsWith('http://') || flagUrl.startsWith('https://')) return flagUrl;
    return `${API_URL}${flagUrl.startsWith('/') ? flagUrl : `/${flagUrl}`}`;
  };

  if (loading || loadingCounts) {
    return (
      <Col lg={9}>
        <Card className="mb-4">
          <CardBody className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">{t('podcasts.languageSelector.loadingLanguages')}</p>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={9}>
        <Card className="mb-4">
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
      <Card className="mb-4 border-0 shadow-lg">
        <CardHeader className="bg-gradient text-white border-0" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <CardTitle className="mb-0 d-flex align-items-center">
            <BsMicFill className="me-2" size={24} />
            {t('podcasts.languageSelector.title')}
          </CardTitle>
          <p className="mb-0 mt-2 opacity-90">
            {t('podcasts.languageSelector.subtitle')}
          </p>
        </CardHeader>
        <CardBody className="p-4">
          <Row className="g-3">
            {languages.map((language) => (
              <Col key={language.id} xs={6} sm={4} md={3} lg={2}>
                <Button
                  variant={selectedLanguage?.id === language.id ? "primary" : "outline-primary"}
                  className={`w-100 p-0 h-100 d-flex flex-column align-items-stretch justify-content-start position-relative lang-box ${selectedLanguage?.id === language.id ? 'active shadow' : ''
                    }`}
                  style={{
                    minHeight: '120px',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => handleLanguageSelect(language)}
                  onMouseEnter={(e) => {
                    if (selectedLanguage?.id !== language.id) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = isDark
                        ? '0 8px 25px rgba(0, 0, 0, 0.5)'
                        : '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLanguage?.id !== language.id) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div
                    className="w-100"
                    style={{
                      height: '56px',
                      overflow: 'hidden',
                      borderTopLeftRadius: '13px',
                      borderTopRightRadius: '13px',
                      filter: selectedLanguage?.id === language.id ? 'none' : 'grayscale(0.3)'
                    }}
                  >
                    {language.flagUrl ? (
                      <img
                        src={getFlagImageUrl(language.flagUrl)}
                        alt={`${language.name} flag`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ fontSize: '2rem', lineHeight: '56px', textAlign: 'center' }}>
                        {getFlagEmoji(language.code)}
                      </div>
                    )}
                  </div>
                  <div
                    className="fw-bold text-center lang-text mt-2 px-2"
                    style={{
                      fontSize: '0.85rem',
                    }}
                  >
                    {getLocalizedLanguageName(language)}
                  </div>
                  {/* Podcast sayısı badge'i */}
                  <div
                    className="mt-1 mb-2 px-2 py-1 rounded-pill lang-badge align-self-center"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                    }}
                  >
                    {podcastCounts[language.code] || 0} {t('podcasts.languageSelector.podcastCount')}
                  </div>
                  {selectedLanguage?.id === language.id && (
                    <div
                      className="position-absolute top-0 end-0 m-2"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <BsCheckLg size={12} color="white" />
                    </div>
                  )}
                </Button>
              </Col>
            ))}
          </Row>

          {selectedLanguage && (
            <div ref={continueButtonRef} className="text-center mt-4 animate-fade-in">
              <Button
                variant="success"
                size="lg"
                className="px-5 py-3 rounded-pill shadow-lg"
                onClick={handleContinue}
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <BsCheckLg className="me-2" />
                {getLocalizedLanguageName(selectedLanguage)} {t('podcasts.languageSelector.continue')}
                <BsArrowRight className="ms-2" />
              </Button>
              <div className="mt-2 text-muted small">
                {podcastCounts[selectedLanguage.code] || 0} {t('podcasts.languageSelector.podcastCount')} {t('books.languageSelector.available')}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

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
        .lang-box.active .lang-text {
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
        [data-bs-theme="dark"] .lang-badge {
          background-color: #3d4246 !important;
          color: #adb5bd !important;
          border-color: #495057 !important;
        }
        
        /* Dark Mode Active State stays the same (gradient) */
        [data-bs-theme="dark"] .lang-box.active .lang-text,
        [data-bs-theme="dark"] .lang-box.active .lang-badge {
          color: #ffffff !important;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Col>
  );
};

export default PodcastLanguageSelector;

