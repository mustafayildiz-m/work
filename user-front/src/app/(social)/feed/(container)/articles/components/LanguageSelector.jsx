'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { BsGlobe, BsCheckLg, BsArrowRight, BsFileText } from 'react-icons/bs';
import { useLanguages } from '@/hooks/useLanguages';
import { useLanguage } from '@/context/useLanguageContext';
import { useRouter } from 'next/navigation';
import { useLayoutContext } from '@/context/useLayoutContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const LanguageSelector = () => {
  const { languages, loading, error } = useLanguages();
  const { t, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const isDark = theme === 'dark';
  const continueButtonRef = useRef(null);
  const [articleCounts, setArticleCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  // Makale sayılarını çek
  useEffect(() => {
    const fetchArticleCounts = async () => {
      try {
        setCountsLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/languages/article-counts`, {
          headers: headers
        });


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Array'i object'e çevir (languageId -> articleCount mapping)
        const countsMap = {};
        data.forEach(item => {
          countsMap[item.languageId] = item.articleCount;
        });

        setArticleCounts(countsMap);
      } catch (err) {
        console.error('Error fetching article counts:', err);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchArticleCounts();
  }, []);

  // Dil seçildiğinde state'e kaydet ve butona scroll et
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);

    // Dil seçildikten sonra "Görüntüle" butonuna scroll yap
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

  // Devam et butonuna tıklandığında yeni sayfaya git
  const handleContinue = () => {
    if (!selectedLanguage) return;

    const params = new URLSearchParams({
      languageId: selectedLanguage.id.toString(),
      languageName: selectedLanguage.name,
      languageCode: selectedLanguage.code
    });

    router.push(`/feed/articles/list?${params.toString()}`);
  };

  // Dil adını mevcut i18n sistemi ile çeviren fonksiyon
  const getLocalizedLanguageName = (language) => {
    return t(`books.languages.${language.name}`) || language.name;
  };

  // Dil kodlarına göre bayrak emoji'leri
  const getFlagEmoji = (code) => {
    const flagMap = {
      // Yaygın Diller
      'tr': '🇹🇷', // Türkçe
      'en': '🇬🇧', // İngilizce
      'ar': '🇸🇦', // Arapça
      'fa': '🇮🇷', // Farsça
      'ur': '🇵🇰', // Urduca
      'de': '🇩🇪', // Almanca
      'fr': '🇫🇷', // Fransızca
      'es': '🇪🇸', // İspanyolca
      'it': '🇮🇹', // İtalyanca
      'ru': '🇷🇺', // Rusça
      'zh': '🇨🇳', // Çince
      'ja': '🇯🇵', // Japonca
      'ko': '🇰🇷', // Korece
      'nl': '🇳🇱', // Hollandaca
      'pt': '🇵🇹', // Portekizce
      'sv': '🇸🇪', // İsveççe
      'no': '🇳🇴', // Norveççe
      'da': '🇩🇰', // Danca
      'fi': '🇫🇮', // Fince
      'el': '🇬🇷', // Yunanca
      'he': '🇮🇱', // İbranice
      'hi': '🇮🇳', // Hintçe
      'bn': '🇧🇩', // Bengalce
      'ta': '🇱🇰', // Tamilce
      'th': '🇹🇭', // Tayca
      'vi': '🇻🇳', // Vietnamca
      'id': '🇮🇩', // Endonezyaca
      'ms': '🇲🇾', // Malayca
      'tl': '🇵🇭', // Tagalog
      'sw': '🇹🇿', // Swahili

      // Türk Dilleri
      'kk': '🇰🇿', // Kazakça
      'uz': '🇺🇿', // Özbekçe
      'ky': '🇰🇬', // Kırgızca
      'tk': '🇹🇲', // Türkmence
      'az': '🇦🇿', // Azerbaycan Türkçesi
      'tt': '🇷🇺', // Tatarca
      'ba': '🇷🇺', // Başkurtça
      'cv': '🇷🇺', // Çuvaşça
      'sah': '🇷🇺', // Yakutça
      'bua': '🇷🇺', // Buryatça
      'xal': '🇷🇺', // Kalmıkça
      'tyv': '🇷🇺', // Tuva Türkçesi
      'kjh': '🇷🇺', // Hakasça
      'alt': '🇷🇺', // Altayca
      'cjs': '🇷🇺', // Şorca
      'dlg': '🇷🇺', // Dolganca
      'kim': '🇷🇺', // Tofalarca
      'gag': '🇲🇩', // Gagavuzca
      'kdr': '🇺🇦', // Karaimce
      'crh': '🇺🇦', // Kırım Tatar Türkçesi
      'krc': '🇷🇺', // Karaçay-Balkarca
      'kum': '🇷🇺', // Kumukça
      'nog': '🇷🇺', // Nogayca
      'kaa': '🇺🇿', // Karakalpakça
      'chg': '🏳️', // Çağatay Türkçesi (tarihi)
      'ota': '🇹🇷', // Osmanlı Türkçesi
      'otk': '🏳️', // Eski Türkçe (tarihi)
      'ug': '🇨🇳', // Uygur Türkçesi
      'slr': '🇷🇺', // Salarca

      // Diğer Diller
      'ps': '🇦🇫', // Peştuca
      'ha': '🇳🇬', // Hausa
      'ig': '🇳🇬', // Igbo
      'yo': '🇳🇬', // Yoruba
      'lg': '🇺🇬', // Luganda
      'rhg': '🇧🇩', // Rohingya
      'ca': '🇪🇸', // Katalanca
    };
    return flagMap[code] || '🏳️';
  };

  const getFlagImageUrl = (flagUrl) => {
    if (!flagUrl) return '';
    if (flagUrl.startsWith('http://') || flagUrl.startsWith('https://')) return flagUrl;
    return `${API_BASE_URL}${flagUrl.startsWith('/') ? flagUrl : `/${flagUrl}`}`;
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('articles.languageSelector.loadingLanguages')}</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
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
    <Card className="mb-4 border-0 shadow-lg">
      <CardHeader className="bg-gradient text-white border-0" style={{
        background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)'
      }}>
        <CardTitle className="mb-0 d-flex align-items-center">
          <BsFileText className="me-2" size={24} />
          {t('articles.languageSelector.title')}
        </CardTitle>
        <p className="mb-0 mt-2 opacity-90">
          {t('articles.languageSelector.subtitle')}
        </p>
      </CardHeader>
      <CardBody className="p-4">
        <Row className="g-3">
          {languages.map((language) => {
            const count = articleCounts[language.id] || 0;
            return (
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
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 8px 25px rgba(0, 0, 0, 0.5)'
                        : '0 8px 25px rgba(33, 147, 176, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLanguage?.id !== language.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
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
                    className="fw-bold text-center mb-1 mt-2 px-2 lang-text"
                    style={{
                      fontSize: '0.85rem',
                    }}
                  >
                    {getLocalizedLanguageName(language)}
                  </div>
                  {!countsLoading && (
                    <Badge
                      bg={selectedLanguage?.id === language.id ? "light" : "primary"}
                      text={selectedLanguage?.id === language.id ? "dark" : "white"}
                      className="mt-1"
                      style={{
                        fontSize: '0.7rem',
                        padding: '4px 8px'
                      }}
                    >
                      {count} {t('articles.languageSelector.articleCount')}
                    </Badge>
                  )}
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
            );
          })}
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
              {getLocalizedLanguageName(selectedLanguage)} {t('articles.languageSelector.continue')}
              <BsArrowRight className="ms-2" />
            </Button>
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
          background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%) !important;
          border-color: #2193b0 !important;
          box-shadow: 0 8px 25px rgba(33, 147, 176, 0.3) !important;
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
    </Card>
  );
};

export default LanguageSelector;

