'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfileHash } from '@/hooks/useProfileHash';
import { Card, CardBody, Col, Container, Row, Button, Modal, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import dynamic from 'next/dynamic';
import { BsTranslate, BsVolumeUp, BsX, BsPause, BsPlay, BsSkipBackward, BsSkipForward } from 'react-icons/bs';
import { useLanguages } from '@/hooks/useLanguages';
import { useNotificationContext } from '@/context/useNotificationContext';
import { cleanTextForTTS, fetchTTSAudio, unlockAudioForPlayback, getUnlockedAudioElement } from '@/utils/textToSpeech';
import { useLanguage } from '@/context/useLanguageContext';
import { getLanguageFlag } from '@/utils/language';

// Map loading placeholder - uses hook so must be a component
const MapLoadingPlaceholder = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t('scholarProfile.loading')}</span>
      </div>
      <p className="mt-2 text-muted">{t('scholarProfile.loading')}</p>
    </div>
  );
};

// MapComponent'i dynamic import ile yükle (SSR hatası önlemek için)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder />
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ScholarProfilePage = () => {
  const { t } = useLanguage();
  const params = useParams();
  const { profileId, isValid } = useProfileHash();
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [showReadingAssist, setShowReadingAssist] = useState(true);
  const [currentOriginalChunks, setCurrentOriginalChunks] = useState([]);
  const [currentTranslatedChunks, setCurrentTranslatedChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [isSliderSeeking, setIsSliderSeeking] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPlayer, setIsDraggingPlayer] = useState(false);
  const currentAudioRef = useRef(null);
  const suppressAudioErrorRef = useRef(false);
  const playbackQueueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const readingSessionIdRef = useRef(0);
  const currentLangCodeRef = useRef(null);
  const originalChunksContainerRef = useRef(null);
  const translatedChunksContainerRef = useRef(null);
  const playerDragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    const fetchScholarData = async () => {
      try {
        const scholarId = profileId;
        if (scholarId) {
          // JWT token'ı localStorage'dan al
          const token = localStorage.getItem('token');
          const headers = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // API'den alim verilerini çek
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`, {
            method: 'GET',
            headers: headers
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
  }, [profileId]);

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

  const splitTextIntoChunks = (text) => {
    if (!text || !text.trim()) return [];
    // Safari 15 ve öncesi lookbehind (?<=) desteklemez - alternatif kullan
    const sentences = text.replace(/([.!?])\s+/g, '$1\n').split('\n').map((s) => s.trim()).filter(Boolean);
    if (sentences.length > 0) return sentences.slice(0, 14);
    return text.split(/\s+/).reduce((acc, word) => {
      const last = acc[acc.length - 1] || '';
      if (!last || last.length > 100) acc.push(word);
      else acc[acc.length - 1] = `${last} ${word}`.trim();
      return acc;
    }, []).slice(0, 14);
  };

  const disposeCurrentAudio = (silent = true) => {
    if (currentAudioRef.current) {
      const audio = currentAudioRef.current;
      if (silent) suppressAudioErrorRef.current = true;
      audio.onplay = null;
      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = '';
      currentAudioRef.current = null;
      if (silent) setTimeout(() => { suppressAudioErrorRef.current = false; }, 0);
    }
  };

  const releaseQueueAudioUrls = () => {
    playbackQueueRef.current.forEach((item) => {
      if (item?.audioUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(item.audioUrl);
      }
    });
  };

  const handlePlayerDragStart = (event) => {
    const target = event.target;
    if (target.closest('button, input, select, .dropdown-menu, .dropdown-item')) return;
    playerDragRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: playerPosition.x,
      originY: playerPosition.y,
    };
    setIsDraggingPlayer(true);
  };

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!playerDragRef.current.dragging) return;
      const dx = event.clientX - playerDragRef.current.startX;
      const dy = event.clientY - playerDragRef.current.startY;
      setPlayerPosition({ x: playerDragRef.current.originX + dx, y: playerDragRef.current.originY + dy });
    };
    const onMouseUp = () => {
      if (!playerDragRef.current.dragging) return;
      playerDragRef.current.dragging = false;
      setIsDraggingPlayer(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [playerPosition.x, playerPosition.y]);

  // Çeviri fonksiyonu
  const translateText = async (text, targetLangCode, sourceLangCode = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/translation/translate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          text,
          targetLangCode,
          sourceLangCode
        })
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('scholarProfile.translationFailed'));
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
        title: t('scholarProfile.warning'),
        message: t('scholarProfile.noBiographyFound'),
        variant: 'warning'
      });
      return;
    }
    setShowLanguageModal(true);
  };

  const startQueuePlayback = (queueIndex, offsetSeconds = 0) => {
    const currentSession = readingSessionIdRef.current;
    const queue = playbackQueueRef.current;
    if (!queue.length || queueIndex >= queue.length) {
      setIsReading(false);
      setIsPaused(false);
      setPlayerStatus('ended');
      disposeCurrentAudio(false);
      return;
    }

    queueIndexRef.current = queueIndex;
    const queueItem = queue[queueIndex];
    const audio = getUnlockedAudioElement() || new Audio();
    audio.src = queueItem.audioUrl;
    currentAudioRef.current = audio;
    audio.playbackRate = playbackRate;
    audio.currentTime = Math.max(0, offsetSeconds);

    audio.onplay = () => {
      if (readingSessionIdRef.current !== currentSession) return;
      setPlayerStatus('playing');
      setActiveChunkIndex(queueItem.chunkIndex);
      setIsPaused(false);
    };

    audio.ontimeupdate = () => {
      if (readingSessionIdRef.current !== currentSession || isSliderSeeking) return;
      const previousDuration = queue.slice(0, queueIndex).reduce((sum, item) => sum + (item.duration || 0), 0);
      const totalDuration = queue.reduce((sum, item) => sum + (item.duration || 0), 0) || 1;
      const nowElapsed = previousDuration + (audio.currentTime || 0);
      setElapsedTime(Math.floor(nowElapsed));
      setAudioProgress(Math.min(100, (nowElapsed / totalDuration) * 100));
    };

    audio.onended = () => {
      if (readingSessionIdRef.current !== currentSession) return;
      startQueuePlayback(queueIndex + 1, 0);
    };

    audio.onerror = () => {
      if (suppressAudioErrorRef.current || readingSessionIdRef.current !== currentSession) return;
      setIsReading(false);
      setIsPaused(false);
      setPlayerStatus('error');
      showNotification({
        title: t('scholarProfile.error'),
        message: t('scholarProfile.ttsError'),
        variant: 'danger',
      });
    };

    audio.play().catch(() => {
      if (readingSessionIdRef.current !== currentSession) return;
      setIsReading(false);
      setIsPaused(false);
      setPlayerStatus('error');
    });
  };

  const handleTranslateAndRead = async (targetLanguage) => {
    if (!scholar?.biography) return;

    unlockAudioForPlayback();
    setTranslating(true);
    setShowLanguageModal(false);

    try {
      const textToRead = stripHtmlTags(scholar.biography);
      if (!textToRead || textToRead.trim().length === 0) {
        showNotification({ title: t('scholarProfile.warning'), message: t('scholarProfile.noContentToRead'), variant: 'warning' });
        setTranslating(false);
        return;
      }

      const translatedText = await translateText(textToRead, targetLanguage.code);
      if (!translatedText || translatedText.trim().length === 0) {
        showNotification({ title: t('scholarProfile.error'), message: t('scholarProfile.translationFailed'), variant: 'danger' });
        setTranslating(false);
        return;
      }

      const originalChunks = splitTextIntoChunks(textToRead);
      const translatedChunks = splitTextIntoChunks(translatedText);
      const readableChunks = translatedChunks.length ? translatedChunks : splitTextIntoChunks(cleanTextForTTS(translatedText));
      if (!readableChunks.length) throw new Error('Okunabilir içerik bulunamadı');

      const queue = await Promise.all(
        readableChunks.map(async (chunkText, chunkIndex) => {
          const token = localStorage.getItem('token');
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
          const cleanedChunk = cleanTextForTTS(chunkText);
          if (!cleanedChunk) return null;
          const audioBlob = await fetchTTSAudio(cleanedChunk, targetLanguage.code, apiBaseUrl, token);
          if (!audioBlob) return null;
          const audioUrl = URL.createObjectURL(audioBlob);
          const estimatedDuration = Math.max(2, Math.min(30, chunkText.length / 11));
          return { audioUrl, text: chunkText, duration: estimatedDuration, chunkIndex };
        })
      );

      const filteredQueue = queue.filter(Boolean);
      if (!filteredQueue.length) throw new Error('Ses oluşturulamadı');

      readingSessionIdRef.current += 1;
      releaseQueueAudioUrls();
      playbackQueueRef.current = filteredQueue;
      queueIndexRef.current = 0;
      currentLangCodeRef.current = targetLanguage.code;
      setCurrentOriginalChunks(originalChunks);
      setCurrentTranslatedChunks(readableChunks);
      setActiveChunkIndex(0);
      setElapsedTime(0);
      setAudioProgress(0);
      setPreviewProgress(null);
      setIsPlayerOpen(true);
      setPlayerStatus('playing');
      setIsReading(true);
      setIsPaused(false);
      setTranslating(false);

      startQueuePlayback(0, 0);
    } catch (error) {
      console.error('Error in handleTranslateAndRead:', error);
      setTranslating(false);
      setIsReading(false);
      setPlayerStatus('error');
      showNotification({
        title: t('scholarProfile.error'),
        message: error.message || t('scholarProfile.translateOrTtsError'),
        variant: 'danger',
      });
    }
  };

  const stopTextToSpeech = () => {
    readingSessionIdRef.current += 1;
    disposeCurrentAudio(true);
    releaseQueueAudioUrls();
    playbackQueueRef.current = [];
    queueIndexRef.current = 0;
    setIsReading(false);
    setIsPaused(false);
    setElapsedTime(0);
    setAudioProgress(0);
    setPreviewProgress(null);
    setActiveChunkIndex(0);
    setPlayerStatus('idle');
    showNotification({
      title: t('scholarProfile.ttsStopped'),
      message: t('scholarProfile.biographyReadStopped'),
      variant: 'info',
    });
  };

  const togglePauseResume = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    if (isPaused) {
      audio.play().catch(() => {});
      setIsPaused(false);
      setPlayerStatus('playing');
    } else {
      audio.pause();
      setIsPaused(true);
      setPlayerStatus('paused');
    }
  };

  const changePlaybackRate = (newRate) => {
    setPlaybackRate(newRate);
    if (currentAudioRef.current) currentAudioRef.current.playbackRate = newRate;
  };

  const seekTo = (progressPercent) => {
    const queue = playbackQueueRef.current;
    if (!queue.length) return;
    const totalDuration = queue.reduce((sum, item) => sum + (item.duration || 0), 0) || 1;
    const targetSeconds = Math.max(0, Math.min(totalDuration, (progressPercent / 100) * totalDuration));

    let cumulative = 0;
    let nextIndex = 0;
    let offset = 0;
    for (let i = 0; i < queue.length; i += 1) {
      const duration = queue[i].duration || 0;
      if (targetSeconds <= cumulative + duration) {
        nextIndex = i;
        offset = Math.max(0, targetSeconds - cumulative);
        break;
      }
      cumulative += duration;
    }

    disposeCurrentAudio(true);
    setElapsedTime(Math.floor(targetSeconds));
    setAudioProgress(Math.min(100, (targetSeconds / totalDuration) * 100));
    startQueuePlayback(nextIndex, offset);
  };

  const skipTime = (seconds) => {
    const queue = playbackQueueRef.current;
    if (!queue.length) return;
    const totalDuration = queue.reduce((sum, item) => sum + (item.duration || 0), 0) || 1;
    const targetSeconds = Math.max(0, Math.min(totalDuration, elapsedTime + seconds));
    seekTo((targetSeconds / totalDuration) * 100);
  };

  const commitSliderSeek = () => {
    if (previewProgress === null) return;
    seekTo(previewProgress);
    setIsSliderSeeking(false);
    setPreviewProgress(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.max(0, Math.floor(seconds % 60));
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => (previewProgress !== null ? previewProgress : audioProgress);

  const totalQueueDuration = playbackQueueRef.current.reduce((sum, item) => sum + (item.duration || 0), 0);

  useEffect(() => {
    if (!showReadingAssist) return;
    const originContainer = originalChunksContainerRef.current;
    const translatedContainer = translatedChunksContainerRef.current;
    const activeOriginal = originContainer?.querySelector(`[data-chunk-index="${activeChunkIndex}"]`);
    const activeTranslated = translatedContainer?.querySelector(`[data-chunk-index="${activeChunkIndex}"]`);
    activeOriginal?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    activeTranslated?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeChunkIndex, showReadingAssist]);

  useEffect(() => {
    return () => {
      readingSessionIdRef.current += 1;
      disposeCurrentAudio(true);
      releaseQueueAudioUrls();
    };
  }, []);



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
                      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{getLanguageFlag(lang, API_BASE_URL)}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{lang.name}</div>
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

      {isPlayerOpen && (
        <div
          className="scholar-player"
          style={{ transform: `translate(${playerPosition.x}px, ${playerPosition.y}px)`, cursor: isDraggingPlayer ? 'grabbing' : 'grab' }}
          onMouseDown={handlePlayerDragStart}
          role="presentation"
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <BsVolumeUp />
              <strong>{t('scholarProfile.audioReading')}</strong>
              <span className="player-page-chip">{t(`scholarProfile.status${playerStatus.charAt(0).toUpperCase() + playerStatus.slice(1)}`)}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Dropdown>
                <DropdownToggle className="player-pill-btn">{t('scholarProfile.speed')} {playbackRate.toFixed(2)}x</DropdownToggle>
                <DropdownMenu>
                  {[0.75, 1, 1.25, 1.5, 1.75].map((rate) => (
                    <button key={rate} type="button" className="dropdown-item" onClick={() => changePlaybackRate(rate)}>
                      {rate}x
                    </button>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <button type="button" className="player-close-btn" onClick={() => { stopTextToSpeech(); setIsPlayerOpen(false); }}>
                <BsX />
              </button>
            </div>
          </div>

          <div className="mb-2">
            <input
              type="range"
              className="w-100 player-slider"
              min="0"
              max="100"
              step="0.1"
              value={getProgress()}
              onMouseDown={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }}
              onTouchStart={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }}
              onMouseUp={commitSliderSeek}
              onTouchEnd={commitSliderSeek}
              onChange={(e) => {
                const nextValue = parseFloat(e.target.value);
                if (isSliderSeeking) setPreviewProgress(nextValue);
                else seekTo(nextValue);
              }}
            />
            <div className="d-flex justify-content-between small opacity-75">
              <span>{formatTime(elapsedTime)}</span>
              <span>{formatTime(totalQueueDuration)}</span>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <button type="button" className="player-icon-btn" onClick={() => skipTime(-8)}><BsSkipBackward /></button>
            <button type="button" className="player-main-btn" onClick={togglePauseResume}>{isPaused ? <BsPlay /> : <BsPause />}</button>
            <button type="button" className="player-icon-btn" onClick={() => skipTime(8)}><BsSkipForward /></button>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <strong>{t('scholarProfile.liveTracking')}</strong>
            <button type="button" className="player-pill-btn" onClick={() => setShowReadingAssist((v) => !v)}>
              {showReadingAssist ? t('scholarProfile.hide') : t('scholarProfile.show')}
            </button>
          </div>

          {showReadingAssist && (
            <Row className="g-3">
              <Col md={6}>
                <div className="reading-box" ref={originalChunksContainerRef}>
                  {currentOriginalChunks.map((chunk, idx) => (
                    <p key={`o-${idx}-${chunk.slice(0, 24)}`} data-chunk-index={idx} className={`chunk-line ${idx === activeChunkIndex ? 'active' : ''}`}>{chunk}</p>
                  ))}
                </div>
              </Col>
              <Col md={6}>
                <div className="reading-box" ref={translatedChunksContainerRef}>
                  {currentTranslatedChunks.map((chunk, idx) => (
                    <p key={`t-${idx}-${chunk.slice(0, 24)}`} data-chunk-index={idx} className={`chunk-line ${idx === activeChunkIndex ? 'active' : ''}`}>{chunk}</p>
                  ))}
                </div>
              </Col>
            </Row>
          )}
        </div>
      )}

      <style>{`
        .scholar-player { position: fixed; right: 20px; bottom: 20px; width: min(920px, calc(100vw - 24px)); max-height: 78vh; overflow: auto; z-index: 1080; border-radius: 22px; padding: 16px; background: linear-gradient(150deg, rgba(18,18,32,.95), rgba(8,8,20,.9)); border: 1px solid rgba(255,255,255,.16); color: #fff; box-shadow: 0 24px 70px rgba(0,0,0,.35); backdrop-filter: blur(10px); }
        .player-slider { accent-color: #7c8cff; cursor: pointer; }
        .player-page-chip { font-size: .7rem; border-radius: 999px; padding: 3px 10px; background: rgba(124,140,255,.22); border: 1px solid rgba(124,140,255,.45); text-transform: uppercase; }
        .player-icon-btn, .player-main-btn, .player-pill-btn, .player-close-btn { border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: #fff; border-radius: 999px; }
        .player-icon-btn { width: 40px; height: 40px; }
        .player-main-btn { width: 56px; height: 56px; background: linear-gradient(135deg, #7c8cff, #5e72ff); border: none; box-shadow: 0 10px 24px rgba(92,112,255,.45); }
        .player-pill-btn { padding: 6px 14px; }
        .player-close-btn { width: 36px; height: 36px; }
        .reading-box { max-height: 220px; overflow: auto; border-radius: 14px; padding: 10px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); }
        .chunk-line { margin: 0 0 8px; padding: 6px 8px; border-radius: 8px; opacity: .85; }
        .chunk-line.active { background: rgba(124,140,255,.22); outline: 1px solid rgba(124,140,255,.45); opacity: 1; }
      `}</style>
    </Container>
  );
};

export default ScholarProfilePage;
