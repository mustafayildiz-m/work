'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProfileHash } from '@/hooks/useProfileHash';
import { Card, CardBody, Col, Container, Row, Button, Modal, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu } from 'react-bootstrap';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import dynamic from 'next/dynamic';
import { BsTranslate, BsVolumeUp, BsX, BsPause, BsPlay, BsSkipBackward, BsSkipForward, BsArrowsMove } from 'react-icons/bs';
import { useLanguages } from '@/hooks/useLanguages';
import { useNotificationContext } from '@/context/useNotificationContext';
import { cleanTextForTTS, fetchTTSAudio, unlockAudioForPlayback, getUnlockedAudioElement } from '@/utils/textToSpeech';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
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
  const { theme } = useLayoutContext();
  const isDarkMode = theme === 'dark' || theme === 'green';
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
  const isReadingRef = useRef(false);
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

  // Cümle hizalaması için satır sonu/özel boşlukları normalize et
  const normalizeTextForSentenceSync = (text) => {
    if (!text) return '';
    return text
      .replace(/\u00A0/g, ' ') // NBSP
      .replace(/[\u2000-\u200B\u202F\u205F\u3000]/g, ' ') // farklı unicode boşluklar
      .replace(/\s*\n+\s*/g, ' ') // satır sonlarını boşluk yap
      .replace(/\s{2,}/g, ' ') // çoklu boşluğu teke indir
      .trim();
  };

  const splitTextIntoChunks = (text) => {
    const normalizedText = normalizeTextForSentenceSync(text);
    if (!normalizedText || !normalizedText.trim()) return [];
    // Safari 15 ve öncesi lookbehind (?<=) desteklemez - alternatif kullan
    const sentences = normalizedText
      .replace(/([.!?])\s+/g, '$1\n')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length > 0) return sentences;
    return normalizedText.split(/\s+/).reduce((acc, word) => {
      const last = acc[acc.length - 1] || '';
      if (!last || last.length > 100) acc.push(word);
      else acc[acc.length - 1] = `${last} ${word}`.trim();
      return acc;
    }, []);
  };

  // Uzun biyografilerde tek istek truncation'a uğrayabildiği için metni parçalara bölerek çevir
  const translateLongText = async (text, targetLangCode, sourceLangCode = null) => {
    if (!text || !text.trim()) return '';

    const paragraphs = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Paragraf yoksa cümle bazlı fallback
    const baseParts = paragraphs.length > 0 ? paragraphs : splitTextIntoChunks(text);
    const groupedParts = [];
    let current = '';
    const maxCharsPerRequest = 1800;

    for (const part of baseParts) {
      const candidate = current ? `${current}\n\n${part}` : part;
      if (candidate.length <= maxCharsPerRequest) {
        current = candidate;
      } else {
        if (current) groupedParts.push(current);
        current = part;
      }
    }
    if (current) groupedParts.push(current);

    const translatedPieces = [];
    for (const part of groupedParts) {
      const translatedPart = await translateText(part, targetLangCode, sourceLangCode);
      if (translatedPart && translatedPart.trim()) {
        translatedPieces.push(translatedPart.trim());
      }
    }

    return translatedPieces.join('\n\n').trim();
  };

  // Cümle sonu bazlı birebir eşleme için her chunk'ı ayrı çevir
  const translateChunksWithAlignment = async (chunks, targetLangCode, sourceLangCode = null) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return [];
    const translatedChunks = [];

    for (const chunk of chunks) {
      const safeChunk = (chunk || '').trim();
      if (!safeChunk) continue;
      try {
        const translated = await translateText(safeChunk, targetLangCode, sourceLangCode);
        translatedChunks.push((translated || '').trim() || safeChunk);
      } catch {
        // Tek bir cümle çevirisi hata verirse akışı kesmemek için orijinali kullan
        translatedChunks.push(safeChunk);
      }
    }

    return translatedChunks;
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

  const startQueuePlayback = async (segmentQueue, langCode, startIndex = 0, startOffsetRatio = 0) => {
    if (!Array.isArray(segmentQueue) || segmentQueue.length === 0) return;
    const token = localStorage.getItem('token');
    const sessionId = readingSessionIdRef.current;

    const playSegmentAt = async (segmentIndex, offsetRatio = 0) => {
      if (sessionId !== readingSessionIdRef.current) return;
      const segmentText = segmentQueue[segmentIndex];
      if (!segmentText) return;

      queueIndexRef.current = segmentIndex;
      setActiveChunkIndex(segmentIndex);

      const cleanedChunk = cleanTextForTTS(segmentText);
      if (!cleanedChunk) {
        const nextIndex = segmentIndex + 1;
        if (nextIndex < segmentQueue.length) {
          await playSegmentAt(nextIndex, 0);
          return;
        }
        setIsReading(false);
        setIsPaused(false);
        isReadingRef.current = false;
        setAudioProgress(0);
        setPlayerStatus('completed');
        return;
      }

      const segmentBlob = await fetchTTSAudio(cleanedChunk, langCode, API_BASE_URL, token);
      const segmentUrl = URL.createObjectURL(segmentBlob);
      const audio = getUnlockedAudioElement() || new Audio();
      audio.src = segmentUrl;
      currentAudioRef.current = audio;
      audio.playbackRate = playbackRate || 1.0;

      audio.onplay = () => {
        setIsReading(true);
        isReadingRef.current = true;
        setIsPaused(false);
        setPlayerStatus('playing');
      };

      audio.ontimeupdate = () => {
        if (!audio.duration) return;
        const segmentPct = audio.currentTime / audio.duration;
        const total = Math.max(1, segmentQueue.length);
        const overallPct = ((segmentIndex + segmentPct) / total) * 100;
        setAudioProgress(Math.min(100, overallPct));
      };

      audio.onerror = () => {
        URL.revokeObjectURL(segmentUrl);
        if (suppressAudioErrorRef.current) return;
        setIsReading(false);
        setIsPaused(false);
        isReadingRef.current = false;
        setPlayerStatus('error');
        showNotification({
          title: t('scholarProfile.error'),
          message: t('scholarProfile.ttsError'),
          variant: 'danger',
        });
      };

      audio.onended = async () => {
        URL.revokeObjectURL(segmentUrl);
        if (sessionId !== readingSessionIdRef.current) return;

        const nextIndex = segmentIndex + 1;
        if (isReadingRef.current && nextIndex < segmentQueue.length) {
          await playSegmentAt(nextIndex, 0);
          return;
        }

        setIsReading(false);
        setIsPaused(false);
        isReadingRef.current = false;
        setAudioProgress(0);
        setPlayerStatus('completed');
      };

      isReadingRef.current = true;
      await audio.play();
      if (offsetRatio > 0 && audio.duration) {
        audio.currentTime = Math.min(audio.duration - 0.05, audio.duration * offsetRatio);
      }
    };

    await playSegmentAt(startIndex, startOffsetRatio);
  };

  const handleTranslateAndRead = async (targetLanguage) => {
    if (!scholar?.biography) return;

    unlockAudioForPlayback();
    setTranslating(true);
    setShowLanguageModal(false);

    try {
      const textToRead = normalizeTextForSentenceSync(stripHtmlTags(scholar.biography));
      if (!textToRead || textToRead.trim().length === 0) {
        showNotification({ title: t('scholarProfile.warning'), message: t('scholarProfile.noContentToRead'), variant: 'warning' });
        setTranslating(false);
        return;
      }

      const originalChunks = splitTextIntoChunks(textToRead);
      if (!originalChunks.length) {
        showNotification({ title: t('scholarProfile.error'), message: t('scholarProfile.translationFailed'), variant: 'danger' });
        setTranslating(false);
        return;
      }

      const translatedChunks = await translateChunksWithAlignment(originalChunks, targetLanguage.code);
      const translatedText = translatedChunks.join(' ').trim();
      const readableChunks = translatedChunks.length ? translatedChunks : splitTextIntoChunks(cleanTextForTTS(translatedText));
      if (!readableChunks.length) throw new Error('Okunabilir içerik bulunamadı');

      readingSessionIdRef.current += 1;
      playbackQueueRef.current = readableChunks;
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

      await startQueuePlayback(readableChunks, targetLanguage.code, 0, 0);
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
    isReadingRef.current = false;
    disposeCurrentAudio(true);
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
    const langCode = currentLangCodeRef.current;
    if (!langCode) return;
    const total = queue.length;
    const normalized = Math.max(0, Math.min(100, progressPercent)) / 100;
    const rawPos = normalized * total;
    const targetIndex = Math.min(total - 1, Math.floor(rawPos));
    const offsetRatio = Math.max(0, Math.min(0.98, rawPos - targetIndex));

    readingSessionIdRef.current += 1;
    disposeCurrentAudio(true);
    setActiveChunkIndex(targetIndex);
    startQueuePlayback(queue, langCode, targetIndex, offsetRatio);
  };

  const skipTime = (seconds) => {
    const audio = currentAudioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
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

  const totalQueueDuration = audioProgress > 0 ? Math.floor(elapsedTime / Math.max(audioProgress / 100, 0.01)) : 0;
  const translatedChunkCount = Math.max(1, currentTranslatedChunks.length);
  const originalChunkCount = Math.max(1, currentOriginalChunks.length);
  const originalActiveChunkIndex = Math.min(
    originalChunkCount - 1,
    Math.round((activeChunkIndex / Math.max(1, translatedChunkCount - 1)) * Math.max(0, originalChunkCount - 1))
  );

  useEffect(() => {
    if (!showReadingAssist) return;
    const originContainer = originalChunksContainerRef.current;
    const translatedContainer = translatedChunksContainerRef.current;
    const activeOriginal = originContainer?.querySelector(`[data-original-chunk-index="${originalActiveChunkIndex}"]`);
    const activeTranslated = translatedContainer?.querySelector(`[data-translated-chunk-index="${activeChunkIndex}"]`);
    activeOriginal?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    activeTranslated?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeChunkIndex, originalActiveChunkIndex, showReadingAssist]);

  useEffect(() => {
    let interval = null;
    if (isReading && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, isPaused]);

  useEffect(() => {
    return () => {
      readingSessionIdRef.current += 1;
      isReadingRef.current = false;
      disposeCurrentAudio(true);
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
                      <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>{getLanguageFlag(lang)}</div>
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
          className="p-3 d-flex justify-content-center reading-player-modal"
          style={{
            zIndex: 1080,
            position: 'fixed',
            left: '50%',
            bottom: '0.5rem',
            width: '100%',
            maxWidth: '1160px',
            transform: `translate(-50%, 0) translate(${playerPosition.x}px, ${playerPosition.y}px)`,
            cursor: isDraggingPlayer ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handlePlayerDragStart}
          role="presentation"
        >
          <Card className="border-0 shadow-lg reading-player-card" style={{ width: '100%', maxWidth: '1000px', backgroundColor: isDarkMode ? '#1c1f2e' : '#ffffff', color: isDarkMode ? '#ffffff' : '#111b36', borderRadius: '20px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
            <CardBody className="p-3">
              <div className="d-flex flex-column align-items-center mb-3">
                <div style={{ width: '44px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.28)' }} />
                <div className="d-none d-md-flex align-items-center gap-2 mt-2 drag-hint-animation" style={{ fontSize: '0.9rem', color: '#dc3545', fontWeight: 'bold', letterSpacing: '0.6px' }}>
                  <BsArrowsMove size={16} />
                  <span>TASIMAK ICIN SURUKLEYIN</span>
                </div>
              </div>

              {showReadingAssist && (
                <div className="mb-3 p-2 rounded" style={{ background: isDarkMode ? 'rgba(13,18,34,0.92)' : 'rgba(13,110,253,0.06)', border: isDarkMode ? '1px solid rgba(138,180,255,0.32)' : '1px solid rgba(13,110,253,0.22)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <small style={{ color: isDarkMode ? '#dbe9ff' : '#184b9b', fontWeight: 600 }}>Orijinal + Ceviri (Anlik)</small>
                    <small style={{ color: '#8ab4ff' }}>{activeChunkIndex + 1}/{Math.max(currentOriginalChunks.length, currentTranslatedChunks.length)}</small>
                  </div>
                  <Row className="g-2">
                    <Col md={6}>
                      <div className="p-2 rounded" style={{ background: isDarkMode ? 'rgba(7,10,20,0.9)' : '#ffffff', border: isDarkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.15)', minHeight: '108px' }}>
                        <small style={{ color: isDarkMode ? '#ffffff' : '#1e2a3b', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Orijinal Metin</small>
                        <div ref={originalChunksContainerRef} style={{ overflowY: 'auto', maxHeight: '140px' }}>
                          {currentOriginalChunks.map((chunk, idx) => (
                            <span
                              key={`o-${idx}-${chunk.slice(0, 10)}`}
                              data-original-chunk-index={idx}
                              style={{
                                display: 'inline',
                                marginRight: '6px',
                                padding: idx === originalActiveChunkIndex ? '2px 6px' : '1px 2px',
                                borderRadius: '4px',
                                background: idx === originalActiveChunkIndex ? 'rgba(255,193,7,0.5)' : 'transparent',
                                color: idx === originalActiveChunkIndex ? '#111111' : (isDarkMode ? '#f5f8ff' : '#1e2a3b'),
                                fontWeight: idx === originalActiveChunkIndex ? 700 : 500,
                                lineHeight: 1.6
                              }}
                            >
                              {chunk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-2 rounded" style={{ background: isDarkMode ? 'rgba(12,33,66,0.85)' : 'rgba(13,110,253,0.08)', border: isDarkMode ? '1px solid rgba(79,156,255,0.45)' : '1px solid rgba(13,110,253,0.3)', minHeight: '108px' }}>
                        <small style={{ color: isDarkMode ? '#dce9ff' : '#0d4ea6', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Ceviri Metni</small>
                        <div ref={translatedChunksContainerRef} style={{ overflowY: 'auto', maxHeight: '140px' }}>
                          {currentTranslatedChunks.map((chunk, idx) => (
                            <span
                              key={`t-${idx}-${chunk.slice(0, 10)}`}
                              data-translated-chunk-index={idx}
                              style={{
                                display: 'inline',
                                marginRight: '6px',
                                padding: idx === activeChunkIndex ? '2px 6px' : '1px 2px',
                                borderRadius: '4px',
                                background: idx === activeChunkIndex ? 'rgba(0,123,255,0.45)' : 'transparent',
                                color: idx === activeChunkIndex ? '#ffffff' : (isDarkMode ? '#e9f2ff' : '#12315f'),
                                fontWeight: idx === activeChunkIndex ? 700 : 500,
                                lineHeight: 1.6
                              }}
                            >
                              {chunk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              <Row className="align-items-center g-3">
                <Col xs={12} md={3}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px', animation: isReading && !isPaused ? 'pulse 2s infinite' : 'none' }}>
                      <BsVolumeUp size={22} style={{ color: '#ffffff' }} />
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-truncate" style={{ fontSize: '0.95rem', color: '#ffffff' }}>{t('scholarProfile.audioReading')}</h6>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>{isPaused ? 'Duraklatildi' : (playerStatus === 'completed' ? 'Tamamlandi' : 'Okunuyor')}</span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center gap-3 player-control-cluster">
                    <Button variant="link" className="player-icon-btn" onClick={() => skipTime(-8)}><BsSkipBackward size={20} /></Button>
                    <Button variant="light" className="rounded-circle d-flex align-items-center justify-content-center shadow player-main-btn" onClick={togglePauseResume}>{isPaused ? <BsPlay size={28} /> : <BsPause size={28} />}</Button>
                    <Button variant="link" className="player-icon-btn" onClick={() => skipTime(8)}><BsSkipForward size={20} /></Button>
                  </div>
                  <div className="w-100 px-3 mt-2">
                    <input type="range" className="w-100 player-slider" min="0" max="100" step="0.1" value={getProgress()} onMouseDown={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }} onTouchStart={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }} onMouseUp={commitSliderSeek} onTouchEnd={commitSliderSeek} onChange={(e) => { const nextValue = parseFloat(e.target.value); if (isSliderSeeking) setPreviewProgress(nextValue); else seekTo(nextValue); }} />
                    <div className="d-flex justify-content-between small opacity-75"><span>{formatTime(elapsedTime)}</span><span>{formatTime(totalQueueDuration)}</span></div>
                  </div>
                </Col>
                <Col xs={12} md={5}>
                  <div className="d-flex flex-column align-items-center align-items-md-end gap-2 px-2">
                    <Dropdown drop="up" style={{ overflow: 'visible' }}>
                      <DropdownToggle variant="outline-light" size="sm" className="rounded-pill px-3 player-pill-btn">{playbackRate}x</DropdownToggle>
                      <DropdownMenu style={{ minWidth: '120px', backgroundColor: '#1c1f2e', border: '1px solid rgba(255,255,255,0.2)' }}>
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button key={rate} onClick={() => changePlaybackRate(rate)} className="dropdown-item w-100 border-0 text-start" style={{ backgroundColor: playbackRate === rate ? '#0d6efd' : 'transparent', color: '#ffffff' }}>
                            {rate === 1.0 ? 'Normal (1x)' : `${rate}x`}
                          </button>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                    <div className="d-flex align-items-center gap-2">
                      <Button variant="outline-light" size="sm" className="rounded-pill px-2 player-pill-btn" onClick={() => setShowReadingAssist((v) => !v)}>{showReadingAssist ? 'Vurguyu Gizle' : 'Vurguyu Goster'}</Button>
                      <Button variant="outline-danger" size="sm" className="rounded-circle p-1 player-close-btn" onClick={() => { stopTextToSpeech(); setIsPlayerOpen(false); }} title="Kapat"><BsX size={18} /></Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); } }
        @keyframes dragBlink { 0% { opacity: 0.5; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1.02); } }
        .drag-hint-animation { animation: dragBlink 1s ease-in-out infinite alternate; }
        .player-slider { accent-color: #007bff; cursor: pointer; }
        .player-control-cluster { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 8px 12px; }
        .player-icon-btn { width: 38px; height: 38px; border-radius: 50% !important; color: rgba(255,255,255,0.95) !important; border: 1px solid rgba(255,255,255,0.16) !important; background: rgba(255,255,255,0.07) !important; }
        .player-main-btn { width: 56px !important; height: 56px !important; background: linear-gradient(135deg, #ffffff 0%, #e9f0ff 100%) !important; color: #111b36 !important; }
        .player-pill-btn { border-radius: 999px; font-weight: 500; }
        .player-close-btn { width: 36px; height: 36px; border: 1px solid rgba(255,77,77,0.7) !important; color: #ff5e5e !important; background: rgba(255,77,77,0.08) !important; }
      `}</style>
    </Container>
  );
};

export default ScholarProfilePage;
