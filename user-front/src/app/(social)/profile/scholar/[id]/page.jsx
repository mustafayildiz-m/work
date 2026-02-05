'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Col, Container, Row, Button, Modal, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import dynamic from 'next/dynamic';
import { BsTranslate, BsVolumeUp, BsX, BsPause, BsPlay, BsSkipBackward, BsSkipForward } from 'react-icons/bs';
import { useLanguages } from '@/hooks/useLanguages';
import { useNotificationContext } from '@/context/useNotificationContext';
import { getBestVoice, getLanguageCode, waitForVoices } from '@/utils/textToSpeech';
import { useLanguage } from '@/context/useLanguageContext';

// MapComponent'i dynamic import ile yükle (SSR hatası önlemek için)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
      <p className="mt-2 text-muted">Yükleniyor...</p>
    </div>
  )
});

const ScholarProfilePage = () => {
  const { t } = useLanguage();
  const params = useParams();
  const { showNotification } = useNotificationContext();
  const { languages: availableLanguages, loading: languagesLoading } = useLanguages();
  const [scholar, setScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const biographyRef = useRef(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showBioToggle, setShowBioToggle] = useState(false);

  // Dil seçimi ve sesli okuma state'leri
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    const fetchScholarData = async () => {
      try {
        const scholarId = params.id;
        if (scholarId) {
          // JWT token'ı localStorage'dan al
          const token = localStorage.getItem('token');

          // API'den alim verilerini çek
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setScholar(data);
            setError(null);
          } else if (response.status === 404) {
            setError('notfound');
          } else {
            setError('server');
            console.error('Scholar not found - Response:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Scholar error response body:', errorText);
          }
        }
      } catch (error) {
        console.error('Error fetching scholar data:', error);
        setError('network');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarData();
  }, [params.id]);

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Ensure the path starts with a slash
      const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return photoUrl;
  };

  // Measure biography to determine if toggle is needed
  useEffect(() => {
    if (!scholar) return;
    const element = biographyRef.current;
    if (!element) return;

    // Temporarily ensure collapsed styles are applied for accurate measurement
    const MAX_HEIGHT = 240; // px ~ 12-14 lines depending on font
    const needsToggle = element.scrollHeight > MAX_HEIGHT + 10; // buffer
    setShowBioToggle(needsToggle);
  }, [scholar]);

  // HTML'den text çıkar
  const stripHtmlTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Çeviri fonksiyonu
  const translateText = async (text, targetLangCode, sourceLangCode = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translation/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          targetLangCode,
          sourceLangCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Çeviri başarısız oldu');
      }

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  // Dil seçim modalını aç
  const openLanguageModal = () => {
    if (!scholar?.biography) {
      showNotification({
        title: 'Uyarı',
        message: 'Biyografi bilgisi bulunamadı',
        variant: 'warning'
      });
      return;
    }
    setShowLanguageModal(true);
  };

  // Çeviri yap ve sesli oku
  const handleTranslateAndRead = async (targetLanguage) => {
    if (!scholar?.biography) {
      return;
    }

    if (!('speechSynthesis' in window)) {
      showNotification({
        title: 'Uyarı',
        message: 'Tarayıcınız sesli okuma özelliğini desteklemiyor',
        variant: 'warning'
      });
      return;
    }

    setTranslating(true);
    setShowLanguageModal(false);

    try {
      // HTML'den text'e çevir
      const textToRead = stripHtmlTags(scholar.biography);

      if (!textToRead || textToRead.trim().length === 0) {
        showNotification({
          title: 'Uyarı',
          message: 'Okunacak içerik bulunamadı',
          variant: 'warning'
        });
        setTranslating(false);
        return;
      }

      showNotification({
        title: 'Bilgi',
        message: `Biyografi ${targetLanguage.name} diline çevriliyor...`,
        variant: 'info'
      });

      // Metni çevir
      const translatedText = await translateText(textToRead, targetLanguage.code);

      if (!translatedText || translatedText.trim().length === 0) {
        showNotification({
          title: 'Hata',
          message: 'Çeviri başarısız oldu',
          variant: 'danger'
        });
        setTranslating(false);
        return;
      }

      // State'i kaydet
      setCurrentText(translatedText);
      setCurrentCharIndex(0);
      setElapsedTime(0);

      // Seslerin yüklenmesini bekle
      await waitForVoices();

      // Dil kodunu al
      const langCode = getLanguageCode(targetLanguage.code);

      // Çevrilen metni sesli oku
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = langCode;
      utterance.rate = playbackRate;
      utterance.pitch = 1.0; // Doğal ton
      utterance.volume = 1.0;

      // En iyi sesi seç
      const bestVoice = getBestVoice(langCode);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // İlerleme takibi için boundary event
      utterance.onboundary = (event) => {
        if (event.charIndex !== undefined) {
          setCurrentCharIndex(event.charIndex);
        }
      };

      utterance.onstart = () => {
        setIsReading(true);
        setTranslating(false);
        setIsPaused(false);
        showNotification({
          title: 'Başarılı',
          message: `Biyografi ${targetLanguage.name} dilinde okunuyor`,
          variant: 'success'
        });
      };

      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
        setSpeechSynthesis(null);
        setCurrentUtterance(null);
        setCurrentText('');
        setCurrentCharIndex(0);
        setElapsedTime(0);
        showNotification({
          title: 'Tamamlandı',
          message: 'Biyografi okuma tamamlandı',
          variant: 'success'
        });
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsReading(false);
        setIsPaused(false);
        setTranslating(false);
        setSpeechSynthesis(null);
        setCurrentUtterance(null);
        showNotification({
          title: 'Hata',
          message: 'Sesli okuma sırasında bir hata oluştu',
          variant: 'danger'
        });
      };

      setCurrentUtterance(utterance);
      setSpeechSynthesis(window.speechSynthesis);
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Error in handleTranslateAndRead:', error);
      setTranslating(false);
      setIsReading(false);
      showNotification({
        title: 'Hata',
        message: error.message || 'Çeviri veya sesli okuma sırasında bir hata oluştu',
        variant: 'danger'
      });
    }
  };

  // Sesli okumayı durdur
  const stopTextToSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Sesli Okuma Durduruldu',
        message: 'Biyografi okunması durduruldu',
        variant: 'info'
      });
    }
  };

  // Sesli okumayı duraklat/devam ettir
  const togglePauseResume = () => {
    if (speechSynthesis) {
      if (isPaused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  // Hızı değiştir
  const changePlaybackRate = (newRate) => {
    setPlaybackRate(newRate);

    if (isReading && currentText && speechSynthesis) {
      // Mevcut pozisyonu kaydet
      const savedCharIndex = currentCharIndex;
      const savedElapsedTime = elapsedTime;

      // Okumayı durdur
      speechSynthesis.cancel();

      // Yeni hızla devam et
      const remainingText = currentText.substring(savedCharIndex);
      const newUtterance = new SpeechSynthesisUtterance(remainingText);
      newUtterance.rate = newRate;
      newUtterance.pitch = 1.0;
      newUtterance.volume = 1.0;

      // Dil kodunu ve sesi koru (önceki utterance'dan)
      if (currentUtterance) {
        newUtterance.lang = currentUtterance.lang;
        // En iyi sesi tekrar seç (consistency için)
        const bestVoice = getBestVoice(currentUtterance.lang);
        if (bestVoice) {
          newUtterance.voice = bestVoice;
        } else {
          newUtterance.voice = currentUtterance.voice; // Fallback
        }
      }

      newUtterance.onboundary = (event) => {
        if (event.charIndex !== undefined) {
          setCurrentCharIndex(savedCharIndex + event.charIndex);
        }
      };

      newUtterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
        setSpeechSynthesis(null);
        setCurrentUtterance(null);
        setCurrentText('');
        setCurrentCharIndex(0);
        setElapsedTime(0);
        showNotification({
          title: 'Tamamlandı',
          message: 'Biyografi okuma tamamlandı',
          variant: 'success'
        });
      };

      newUtterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsReading(false);
        setIsPaused(false);
        setSpeechSynthesis(null);
        setCurrentUtterance(null);
      };

      setCurrentUtterance(newUtterance);
      setElapsedTime(savedElapsedTime);
      speechSynthesis.speak(newUtterance);
      setIsPaused(false);
    }
  };

  // İleri/geri atla (10 saniye)
  const skipTime = (seconds) => {
    if (isReading && currentText) {
      // Yaklaşık olarak karakter pozisyonunu hesapla
      const avgCharsPerSecond = currentText.length / (elapsedTime || 1);
      const charOffset = Math.floor(avgCharsPerSecond * seconds);
      const newCharIndex = Math.max(0, Math.min(currentText.length, currentCharIndex + charOffset));

      // Okumayı durdur ve yeni pozisyondan başlat
      if (speechSynthesis) {
        speechSynthesis.cancel();

        const remainingText = currentText.substring(newCharIndex);
        const newUtterance = new SpeechSynthesisUtterance(remainingText);
        newUtterance.rate = playbackRate;
        newUtterance.pitch = 1.0;
        newUtterance.volume = 1.0;

        if (currentUtterance) {
          newUtterance.lang = currentUtterance.lang;
          // En iyi sesi tekrar seç (consistency için)
          const bestVoice = getBestVoice(currentUtterance.lang);
          if (bestVoice) {
            newUtterance.voice = bestVoice;
          } else {
            newUtterance.voice = currentUtterance.voice; // Fallback
          }
        }

        newUtterance.onboundary = (event) => {
          if (event.charIndex !== undefined) {
            setCurrentCharIndex(newCharIndex + event.charIndex);
          }
        };

        newUtterance.onend = () => {
          setIsReading(false);
          setIsPaused(false);
          setSpeechSynthesis(null);
          setCurrentUtterance(null);
          setCurrentText('');
          setCurrentCharIndex(0);
          setElapsedTime(0);
        };

        setCurrentUtterance(newUtterance);
        setCurrentCharIndex(newCharIndex);
        setElapsedTime(Math.max(0, elapsedTime + seconds));
        speechSynthesis.speak(newUtterance);
        setIsPaused(false);
      }
    }
  };

  // Component unmount olduğunda sesli okumayı durdur
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Zamanlayıcı - sesli okuma sırasında geçen süreyi takip et
  useEffect(() => {
    let interval;
    if (isReading && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading, isPaused]);

  // Zamanı formatla (saniye -> mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // İlerleme yüzdesi hesapla
  const getProgress = () => {
    if (!currentText || currentText.length === 0) return 0;
    return Math.min(100, (currentCharIndex / currentText.length) * 100);
  };



  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">{t('scholarProfile.loadingScholarData')}</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !scholar) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col lg={8}>
            <Card className="shadow-lg border-0">
              <CardBody className="text-center py-5">
                <div className="mb-4">
                  {error === 'notfound' ? (
                    <div style={{ fontSize: '5rem' }} className="mb-3">🔍</div>
                  ) : error === 'network' ? (
                    <div style={{ fontSize: '5rem' }} className="mb-3">📡</div>
                  ) : (
                    <div style={{ fontSize: '5rem' }} className="mb-3">⚠️</div>
                  )}
                </div>
                <h3 className="mb-3 fw-bold">
                  {error === 'notfound' ? t('scholarProfile.scholarNotFound') : error === 'network' ? t('scholarProfile.connectionError') : t('scholarProfile.anErrorOccurred')}
                </h3>
                <p className="text-muted mb-4">
                  {error === 'notfound'
                    ? t('scholarProfile.scholarNotFoundDesc')
                    : error === 'network'
                      ? t('scholarProfile.connectionErrorDesc')
                      : t('scholarProfile.anErrorOccurredDesc')}
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-primary px-4"
                    onClick={() => window.history.back()}
                  >
                    ← {t('scholarProfile.goBack')}
                  </button>
                  <button
                    className="btn btn-outline-primary px-4"
                    onClick={() => window.location.reload()}
                  >
                    🔄 {t('scholarProfile.tryAgain')}
                  </button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="g-4">
        <Col lg={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '24px', overflow: 'hidden' }}>
            <CardBody style={{ padding: '2rem' }}>
              {/* Biography Section */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                  <h5 className="mb-0 fw-bold" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{t('scholarProfile.biography')}</h5>
                  <div className="d-flex gap-2">
                    {!isReading ? (
                      <Button
                        size="sm"
                        onClick={openLanguageModal}
                        className="d-flex align-items-center px-3"
                        disabled={translating || !scholar?.biography}
                        style={{
                          background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                          border: 'none',
                          borderRadius: '50px',
                          fontWeight: '500',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)'
                        }}
                      >
                        <BsTranslate className="me-2" />
                        {translating ? t('scholarProfile.translating') : t('scholarProfile.selectLanguageAndRead')}
                      </Button>
                    ) : (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={stopTextToSpeech}
                        className="d-flex align-items-center px-3"
                        style={{
                          borderRadius: '50px',
                          fontWeight: '500'
                        }}
                      >
                        <BsX className="me-2" size={20} />
                        {t('scholarProfile.stop')}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sesli Okuma Kontrolleri */}
                {isReading && (
                  <Card className="mb-4 border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
                    <Card.Body className="p-4">
                      {/* İlerleme çubuğu */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <BsVolumeUp className="me-1" />
                            {t('scholarProfile.reading')}
                          </small>
                          <small className="text-muted">
                            {formatTime(elapsedTime)}
                          </small>
                        </div>
                        <ProgressBar
                          now={getProgress()}
                          variant="primary"
                          style={{ height: '8px' }}
                          animated={!isPaused}
                        />
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {Math.round(getProgress())}% {t('scholarProfile.completed')}
                          </small>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {currentCharIndex} / {currentText.length} {t('scholarProfile.characters')}
                          </small>
                        </div>
                      </div>

                      {/* Oynatma Kontrolleri */}
                      <Row className="g-2 align-items-center">
                        {/* İleri/Geri Atla */}
                        <Col xs="auto">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => skipTime(-10)}
                            title="10 saniye geri"
                          >
                            <BsSkipBackward />
                          </Button>
                        </Col>

                        {/* Oynat/Duraklat */}
                        <Col xs="auto">
                          <Button
                            variant={isPaused ? 'primary' : 'warning'}
                            size="sm"
                            onClick={togglePauseResume}
                          >
                            {isPaused ? <BsPlay /> : <BsPause />}
                          </Button>
                        </Col>

                        {/* İleri Atla */}
                        <Col xs="auto">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => skipTime(10)}
                            title="10 saniye ileri"
                          >
                            <BsSkipForward />
                          </Button>
                        </Col>

                        {/* Hız Kontrolü */}
                        <Col>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-muted text-nowrap" style={{ fontSize: '0.85rem' }}>
                              Hız: {playbackRate}x
                            </small>
                            <input
                              type="range"
                              className="form-range"
                              min="0.5"
                              max="2.0"
                              step="0.1"
                              value={playbackRate}
                              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                              style={{ maxWidth: '150px' }}
                            />
                          </div>
                        </Col>

                        {/* Hız Preset Butonları */}
                        <Col xs={12} className="d-flex gap-1 flex-wrap">
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(rate => (
                            <Button
                              key={rate}
                              variant={playbackRate === rate ? 'primary' : 'outline-primary'}
                              size="sm"
                              onClick={() => changePlaybackRate(rate)}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              {rate}x
                            </Button>
                          ))}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}
                <div
                  className="mx-auto"
                  style={{ maxWidth: 820 }}
                >
                  <div
                    ref={biographyRef}
                    className="lead position-relative"
                    style={{
                      maxHeight: isBioExpanded ? 'none' : 240,
                      overflow: 'hidden',
                      transition: 'max-height 300ms ease',
                    }}
                    dangerouslySetInnerHTML={{ __html: scholar.biography || t('sidebar.noScholarBiography') }}
                  />

                  {!isBioExpanded && showBioToggle && (
                    <div
                      aria-hidden
                      style={{
                        position: 'relative',
                        marginTop: -60,
                        height: 60,
                        pointerEvents: 'none',
                        background:
                          'linear-gradient(to bottom, rgba(255,255,255,0) 0%, var(--bs-body-bg, #fff) 60%)',
                      }}
                    />
                  )}

                  {showBioToggle && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mt-3 px-4"
                      onClick={() => setIsBioExpanded((v) => !v)}
                      style={{
                        borderRadius: '50px',
                        fontWeight: '500',
                        borderWidth: '2px'
                      }}
                    >
                      {isBioExpanded ? t('scholarProfile.showLess') : t('scholarProfile.showMore')}
                    </button>
                  )}
                </div>
              </div>

              {/* Statistics Section */}
              <div className="row text-center mb-5 py-4" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                <div className="col-4">
                  <h4 className="mb-1 fw-bold" style={{ fontSize: '2rem', color: '#66BB6A' }}>{scholar.ownBooks?.length || 0}</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{t('scholarProfile.ownBooks')}</p>
                </div>
                <div className="col-4">
                  <h4 className="mb-1 fw-bold" style={{ fontSize: '2rem', color: '#66BB6A' }}>{scholar.relatedBooks?.length || 0}</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{t('scholarProfile.relatedBooks')}</p>
                </div>
                <div className="col-4">
                  <h4 className="mb-1 fw-bold" style={{ fontSize: '2rem', color: '#66BB6A' }}>{scholar.sources?.length || 0}</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{t('scholarProfile.sources')}</p>
                </div>
              </div>

              {/* Biographical Information Section */}
              <div className="pt-3">
                <h5 className="mb-4 fw-bold" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>{t('scholarProfile.biographicalInfo')}</h5>
                <Row>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <strong>{t('scholarProfile.birthDate')}:</strong> {scholar.birthDate || t('scholarProfile.notSpecified')}
                      </li>
                      <li className="mb-2">
                        <strong>{t('scholarProfile.deathDate')}:</strong> {scholar.deathDate || t('scholarProfile.notSpecified')}
                      </li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <strong>{t('scholarProfile.location')}:</strong> {scholar.locationName || t('scholarProfile.notSpecified')}
                      </li>
                      {scholar.latitude && scholar.longitude && (
                        <li className="mb-2">
                          <strong>{t('scholarProfile.coordinates')}:</strong> {`${scholar.latitude}, ${scholar.longitude}`}
                        </li>
                      )}
                    </ul>
                  </Col>
                </Row>

                {/* Map Component */}
                {scholar.latitude && scholar.longitude && (
                  <div className="mt-4">
                    <h6 className="mb-3">
                      <i className="fas fa-map-marker-alt text-primary me-2"></i>
                      {t('scholarProfile.mapTitle')}
                    </h6>
                    <MapComponent
                      latitude={scholar.latitude}
                      longitude={scholar.longitude}
                      locationName={scholar.locationName}
                      title={scholar.fullName}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Dil Seçim Modal */}
      <Modal
        show={showLanguageModal}
        onHide={() => {
          if (!translating) {
            setShowLanguageModal(false);
          }
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton={!translating}>
          <Modal.Title>
            <BsTranslate className="me-2" />
            {t('scholarProfile.selectLanguageTitle')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3 text-muted">
            {t('scholarProfile.selectLanguageDesc')}
          </p>
          {languagesLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">{t('scholarProfile.languagesLoading')}</p>
            </div>
          ) : availableLanguages && availableLanguages.length > 0 ? (
            <div className="row g-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableLanguages
                .filter(lang => lang.isActive !== false)
                .map((lang) => (
                  <Col key={lang.id} xs={6} md={4} lg={3}>
                    <Button
                      variant="outline-primary"
                      className="w-100 mb-2"
                      onClick={() => handleTranslateAndRead(lang)}
                      disabled={translating}
                      style={{
                        minHeight: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {lang.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {lang.code}
                      </div>
                    </Button>
                  </Col>
                ))}
            </div>
          ) : (
            <Alert variant="warning">
              {t('scholarProfile.languagesError')}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              if (!translating) {
                setShowLanguageModal(false);
              }
            }}
            disabled={translating}
          >
            {t('scholarProfile.cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ScholarProfilePage;
