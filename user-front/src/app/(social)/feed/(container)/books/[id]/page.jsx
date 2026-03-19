'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Badge, Spinner, Alert, Modal, ProgressBar } from 'react-bootstrap';
import { BsDownload, BsCalendar, BsPerson, BsBook, BsArrowLeft, BsEyeFill, BsShare, BsWhatsapp, BsNewspaper, BsThreeDotsVertical, BsGrid3X3, BsX, BsVolumeUp, BsTranslate, BsPause, BsPlay, BsSkipBackward, BsSkipForward, BsArrowsMove } from 'react-icons/bs';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLanguages } from '@/hooks/useLanguages';
import useViewPort from '@/hooks/useViewPort';
import styles from './styles.module.css';
import { getLanguageCode, cleanTextForTTS, fetchTTSAudio, unlockAudioForPlayback } from '@/utils/textToSpeech';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BookDetailPage = () => {
  const { width } = useViewPort();
  const isDesktop = width >= 769;
  const { t, loading: langLoading, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const isDarkMode = theme === 'dark' || theme === 'green';
  const { showNotification } = useNotificationContext();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingTranslationId, setReadingTranslationId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const currentAudioRef = useRef(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedTranslationForTranslate, setSelectedTranslationForTranslate] = useState(null);
  const [selectedTranslationIndexForTranslate, setSelectedTranslationIndexForTranslate] = useState(null);
  const [selectedPdfUrlForTranslate, setSelectedPdfUrlForTranslate] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [targetLang, setTargetLang] = useState(null);
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
  const isReadingRef = useRef(false);
  const pdfjsRef = useRef(null);
  const suppressAudioErrorRef = useRef(false);
  const playbackQueueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const readingSessionIdRef = useRef(0);
  const onQueueCompleteRef = useRef(null);
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

  const getPdfjs = async () => {
    if (typeof window === 'undefined') return null;
    if (pdfjsRef.current) return pdfjsRef.current;

    try {
      const reactPdfModule = await import('react-pdf');
      const pdfjs = reactPdfModule?.pdfjs;
      if (!pdfjs) {
        return null;
      }

      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      pdfjsRef.current = pdfjs;
      return pdfjs;
    } catch {
      return null;
    }
  };

  // URL'den dil bilgilerini al
  const languageId = searchParams ? searchParams.get('languageId') : null;
  const languageNameRaw = searchParams ? searchParams.get('languageName') : null;
  const languageCode = searchParams ? searchParams.get('languageCode') : null;

  // URL-encoded olabilecek dil ismini decode et
  const languageName = languageNameRaw ? decodeURIComponent(languageNameRaw) : null;

  // Dilleri yükle
  const { languages: availableLanguages, loading: languagesLoading } = useLanguages();

  // Safe translation function
  const translate = (key, fallback = '') => {
    if (langLoading || typeof t !== 'function') return fallback;
    try {
      const result = t(key);
      return result !== key ? result : fallback;
    } catch (err) {
      console.warn(`Translation error for key ${key}:`, err);
      return fallback;
    }
  };

  const getLanguageFlag = (code) => {
    const flagMap = {
      tr: '🇹🇷',
      en: '🇬🇧',
      ar: '🇸🇦',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
      pt: '🇵🇹',
      ru: '🇷🇺',
      ja: '🇯🇵',
      zh: '🇨🇳',
      ko: '🇰🇷',
      nl: '🇳🇱',
      fa: '🇮🇷',
      ur: '🇵🇰',
      hi: '🇮🇳',
    };

    return flagMap[(code || '').toLowerCase()] || '🌐';
  };

  const splitTextIntoChunks = (text) => {
    if (!text || !text.trim()) return [];
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length > 0) return sentences.slice(0, 14);

    return text
      .split(/\s+/)
      .reduce((acc, word) => {
        const last = acc[acc.length - 1] || '';
        if (!last || last.length > 100) {
          acc.push(word);
        } else {
          acc[acc.length - 1] = `${last} ${word}`.trim();
        }
        return acc;
      }, [])
      .slice(0, 14);
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

      const segmentBlob = await fetchTTSAudio(segmentText, langCode, API_BASE_URL, token);
      const segmentUrl = URL.createObjectURL(segmentBlob);
      const audio = new Audio(segmentUrl);
      audio.playbackRate = playbackRate || 1.0;
      currentAudioRef.current = audio;

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
        showNotification({ title: 'Hata', message: 'Ses oynatılamadı.', variant: 'danger' });
      };
      audio.onended = async () => {
        URL.revokeObjectURL(segmentUrl);
        if (sessionId !== readingSessionIdRef.current) return;

        const nextIndex = segmentIndex + 1;
        if (isReadingRef.current && nextIndex < segmentQueue.length) {
          await playSegmentAt(nextIndex, 0);
          return;
        }

        if (isReadingRef.current && typeof onQueueCompleteRef.current === 'function') {
          onQueueCompleteRef.current();
          return;
        }

        setIsReading(false);
        setIsPaused(false);
        isReadingRef.current = false;
        setAudioProgress(0);
        setActiveChunkIndex(0);
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



  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
          headers: headers
        });


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  const getBookImage = (book) => {
    if (book?.coverImage) {
      const url = book.coverImage.startsWith('http') ? book.coverImage : `${API_BASE_URL}${book.coverImage}`;
      return url;
    }
    if (book?.coverUrl) {
      const url = book.coverUrl.startsWith('http') ? book.coverUrl : `${API_BASE_URL}${book.coverUrl}`;
      return url;
    }
    return '/images/book-placeholder.jpg';
  };

  const getPdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    return pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl}`;
  };

  const handleReadPdf = (pdfUrl, title) => {
    const fullPdfUrl = getPdfUrl(pdfUrl);
    setSelectedPdfUrl(fullPdfUrl);
    setSelectedPdfTitle(title);
    setShowPdfViewer(true);
  };

  const handleDownloadPdf = async (pdfUrl, title) => {
    const fullPdfUrl = getPdfUrl(pdfUrl);
    if (!fullPdfUrl) return;

    try {
      const safeTitle = (title || 'book').replace(/[^\w\-]+/g, '_');
      const filename = `${safeTitle}.pdf`;
      const downloadUrl = `/api/download-pdf?pdfUrl=${encodeURIComponent(fullPdfUrl)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('PDF indirilemedi');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('PDF download error:', error);
      showNotification({
        title: 'Hata',
        message: 'PDF indirilemedi. Lütfen tekrar deneyin.',
        variant: 'danger'
      });
    }
  };

  // PDF'den text çıkarma fonksiyonu
  const extractTextFromPdf = async (pdfUrl) => {
    try {
      const pdfjs = await getPdfjs();
      if (!pdfjs) {
        return null;
      }

      showNotification({
        title: 'Bilgi',
        message: 'PDF içeriği çıkarılıyor, lütfen bekleyin...',
        variant: 'info'
      });

      // PDF'i yükle
      const loadingTask = pdfjs.getDocument({
        url: pdfUrl,
        withCredentials: false,
        httpHeaders: {}
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      let fullText = '';

      // Tüm sayfalardan text çıkar (maksimum 50 sayfa)
      const maxPages = Math.min(numPages, 50);
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();

          // Text items'ları birleştir
          const pageText = textContent.items
            .map(item => item.str)
            .filter(str => str && str.trim().length > 0)
            .join(' ');

          if (pageText.trim().length > 0) {
            fullText += pageText + ' ';
          }
        } catch (pageError) {
          console.warn(`Page ${pageNum} extraction error:`, pageError);
          // Bir sayfada hata olsa bile devam et
          continue;
        }
      }

      const extractedText = fullText.trim();

      if (extractedText.length === 0) {
        showNotification({
          title: 'Uyarı',
          message: 'PDF\'den metin çıkarılamadı. Translation içeriği kullanılacak.',
          variant: 'warning'
        });
        return null;
      }

      return extractedText;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      showNotification({
        title: 'Uyarı',
        message: 'PDF\'den metin çıkarılamadı. Translation içeriği kullanılacak.',
        variant: 'warning'
      });
      return null;
    }
  };

  // Mevcut audio objesini temizle
  const disposeCurrentAudio = (silent = true) => {
    if (currentAudioRef.current) {
      const audio = currentAudioRef.current;
      if (silent) suppressAudioErrorRef.current = true;

      // Eski audio event'lerini temizleyip sonraki sayfaya geçerken sahte "hata" bildirimi engelle
      audio.onplay = null;
      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = '';
      currentAudioRef.current = null;

      if (silent) {
        setTimeout(() => {
          suppressAudioErrorRef.current = false;
        }, 0);
      }
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
      setPlayerPosition({
        x: playerDragRef.current.originX + dx,
        y: playerDragRef.current.originY + dy,
      });
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
  }, []);

  // Sesli okumayı duraklat/devam ettir
  const pauseResumeTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    if (isPaused) {
      audio.play();
      setIsPaused(false);
      setPlayerStatus('playing');
    } else {
      audio.pause();
      setIsPaused(true);
      setPlayerStatus('paused');
    }
  };

  // Geri al (10 saniye)
  const rewindTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  // İleri al (10 saniye)
  const forwardTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  };

  // Hızı değiştir - Audio API'de yeniden başlatmaya gerek yok
  const changePlaybackRate = (newRate) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };

  // Geçen süre sayacı
  useEffect(() => {
    let interval = null;
    if (isReading && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isReading, isPaused]);

  // Backend'den metni çevir (Caching desteği ile)
  const translateText = async (text, targetLangCode, sourceLangCode = null, pageNumber = null, bookId = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Eğer sayfa bazlı çeviri ise yeni endpoint'i kullan
      if (pageNumber !== null && bookId !== null) {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/page-translate`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            pageNumber,
            originalText: text,
            targetLangCode
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Sayfa çevirisi başarısız');
        }

        const data = await response.json();
        return data.translatedText;
      }

      // Genel çeviri için eski endpoint (description/summary için)
      const response = await fetch(`${API_BASE_URL}/translation/translate`, {
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
        throw new Error(errorData.message || 'Çeviri başarısız oldu');
      }

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  // Seçilen dilde çeviri yap ve sesli oku (Google Translate TTS - yüksek kalite)
  const handleTranslateAndRead = async (targetLanguage, startPage = 1) => {
    if (!selectedTranslationForTranslate) return;

    unlockAudioForPlayback();

    // Önceki audio'yu durdur
    disposeCurrentAudio();
    readingSessionIdRef.current += 1;
    playbackQueueRef.current = [];
    queueIndexRef.current = 0;
    isReadingRef.current = false;

    setTranslating(true);
    setIsPlayerOpen(true);
    setPlayerStatus('loading');
    if (selectedTranslationIndexForTranslate !== null) {
      setReadingTranslationId(selectedTranslationIndexForTranslate);
    }
    setShowLanguageModal(false);
    setElapsedTime(0);
    setAudioProgress(0);

    try {
      let activePdfDoc = pdfDoc;
      let activeTotalPages = totalPages;
      const pdfjs = await getPdfjs();

      if (selectedPdfUrlForTranslate && !activePdfDoc) {
        if (pdfjs) {
          showNotification({ title: 'Bilgi', message: 'Kitap hazırlanıyor...', variant: 'info' });
          const loadingTask = pdfjs.getDocument({ url: selectedPdfUrlForTranslate, withCredentials: false });
          activePdfDoc = await loadingTask.promise;
          setPdfDoc(activePdfDoc);
          setTotalPages(activePdfDoc.numPages);
          activeTotalPages = activePdfDoc.numPages;
        } else {
          showNotification({
            title: 'Bilgi',
            message: 'PDF sayfaları yüklenemedi, özet/açıklama metni üzerinden okuma başlatılıyor.',
            variant: 'warning'
          });
        }
      }

      setTargetLang(targetLanguage);
      currentLangCodeRef.current = targetLanguage.code;

      const playPage = async (pageNum) => {
        if (!isReadingRef.current && pageNum !== startPage) return;

        if (activePdfDoc && pageNum > activeTotalPages) {
          setIsReading(false);
          setIsPaused(false);
          isReadingRef.current = false;
          setTranslating(false);
          setPlayerStatus('completed');
          showNotification({ title: 'Tamamlandı', message: 'Kitabın tamamı okundu.', variant: 'success' });
          return;
        }

        setCurrentPage(pageNum);

        try {
          let textToTranslate = '';
          if (activePdfDoc) {
            const page = await activePdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            textToTranslate = textContent.items.map(item => item.str).join(' ').trim();
          } else {
            const parts = [];
            if (selectedTranslationForTranslate?.description) parts.push(selectedTranslationForTranslate.description);
            if (selectedTranslationForTranslate?.summary) parts.push(selectedTranslationForTranslate.summary);
            textToTranslate = parts.join('. ');
          }

          if (!textToTranslate.trim()) {
            if (activePdfDoc && pageNum < activeTotalPages) return playPage(pageNum + 1);
            setTranslating(false);
            return;
          }

          // Çeviri al
          const rawTranslated = await translateText(
            textToTranslate, targetLanguage.code, null,
            activePdfDoc ? pageNum : 1, params.id
          );
          const translatedText = cleanTextForTTS(rawTranslated);
          const originalChunks = splitTextIntoChunks(textToTranslate);
          const translatedChunks = splitTextIntoChunks(translatedText);
          const chunks = translatedChunks;
          setCurrentOriginalChunks(originalChunks);
          setCurrentTranslatedChunks(translatedChunks);
          setActiveChunkIndex(0);

          if (!translatedText.trim()) {
            if (activePdfDoc && pageNum < activeTotalPages) return playPage(pageNum + 1);
            setTranslating(false);
            return;
          }

          // Seviye 2: metni segment segment oynat, highlight ile birebir takip et
          const segmentQueue = chunks.length > 0 ? chunks : [translatedText];
          playbackQueueRef.current = segmentQueue;
          queueIndexRef.current = 0;

          setTranslating(false);
          disposeCurrentAudio();
          onQueueCompleteRef.current = () => {
            if (isReadingRef.current && activePdfDoc && pageNum < activeTotalPages) {
              playPage(pageNum + 1);
              return;
            }

            setIsReading(false);
            setIsPaused(false);
            isReadingRef.current = false;
            setAudioProgress(0);
            setActiveChunkIndex(0);
            setPlayerStatus('completed');
          };

          await startQueuePlayback(segmentQueue, targetLanguage.code, 0, 0);

        } catch (err) {
          console.error(`Page ${pageNum} error:`, err);
          let message = err.message || 'Bir hata oluştu';
          if (message.includes('PDF_CONTENT_INVALID')) {
            message = translate('books.detail.pdfContentInvalid', 'Bu PDF çeviri için uygun değil.');
          }
          setTranslating(false);
          setIsReading(false);
          setIsPaused(false);
          isReadingRef.current = false;
          setPlayerStatus('error');
          showNotification({ title: 'Hata', message, variant: 'danger' });
        }
      };

      isReadingRef.current = true;
      playPage(startPage);

    } catch (error) {
      console.error('General read error:', error);
      setTranslating(false);
      setPlayerStatus('error');
      showNotification({ title: 'Hata', message: 'Okuma başlatılamadı.', variant: 'danger' });
    }
  };

  // Dil seçim modalını aç
  const openLanguageModal = (translation, translationIndex) => {
    setSelectedTranslationForTranslate(translation);
    setSelectedTranslationIndexForTranslate(translationIndex);
    setSelectedPdfUrlForTranslate(translation.pdfUrl ? getPdfUrl(translation.pdfUrl) : null);
    setShowLanguageModal(true);
  };

  // Sesli okumayı durdur
  const stopTextToSpeech = () => {
    isReadingRef.current = false;
    readingSessionIdRef.current += 1;
    playbackQueueRef.current = [];
    queueIndexRef.current = 0;
    onQueueCompleteRef.current = null;
    currentLangCodeRef.current = null;
    disposeCurrentAudio();
    setIsReading(false);
    setIsPaused(false);
    setPlayerStatus('idle');
    setIsPlayerOpen(false);
    setPlayerPosition({ x: 0, y: 0 });
    setReadingTranslationId(null);
    setElapsedTime(0);
    setAudioProgress(0);
    setCurrentOriginalChunks([]);
    setCurrentTranslatedChunks([]);
    setActiveChunkIndex(0);
    showNotification({ title: 'Sesli Okuma Durduruldu', message: 'Kitap okunması durduruldu', variant: 'info' });
  };

  // Zamanı formatla (saniye -> mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => audioProgress;

  const commitSliderSeek = () => {
    if (previewProgress === null) return;
    seekTo(previewProgress);
    setIsSliderSeeking(false);
    setPreviewProgress(null);
  };

  // Progress bar'a tıklayarak konuma atla
  const seekTo = (percent) => {
    if (playbackQueueRef.current.length > 1) {
      const queue = playbackQueueRef.current;
      const langCode = currentLangCodeRef.current;
      if (!queue.length || !langCode) return;

      const total = queue.length;
      const normalized = Math.max(0, Math.min(100, percent)) / 100;
      const rawPos = normalized * total;
      const targetIndex = Math.min(total - 1, Math.floor(rawPos));
      const offsetRatio = Math.max(0, Math.min(0.98, rawPos - targetIndex));

      readingSessionIdRef.current += 1;
      disposeCurrentAudio();
      setActiveChunkIndex(targetIndex);
      startQueuePlayback(queue, langCode, targetIndex, offsetRatio);
      return;
    }
    const audio = currentAudioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setAudioProgress(percent);
  };

  // Component unmount olduğunda audio'yu temizle
  useEffect(() => {
    return () => {
      readingSessionIdRef.current += 1;
      playbackQueueRef.current = [];
      queueIndexRef.current = 0;
      onQueueCompleteRef.current = null;
      currentLangCodeRef.current = null;
      disposeCurrentAudio();
      isReadingRef.current = false;
    };
  }, []);

  useEffect(() => {
    const scrollToActive = (containerRef, selector) => {
      const container = containerRef.current;
      if (!container) return;
      const el = container.querySelector(selector);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    scrollToActive(originalChunksContainerRef, `[data-original-chunk-index="${activeChunkIndex}"]`);
    scrollToActive(translatedChunksContainerRef, `[data-translated-chunk-index="${activeChunkIndex}"]`);
  }, [activeChunkIndex]);

  // Geri dönüş URL'ini oluştur (dil bilgisi varsa dahil et)
  const getBackUrl = () => {
    if (languageId && languageName && languageCode) {
      const params = new URLSearchParams({
        languageId,
        languageName,
        languageCode
      });
      return `/feed/books/list?${params.toString()}`;
    }
    return '/feed/books';
  };

  // Mevcut sayfa URL'sini döndür (dil parametreleri dahil)
  const getBookUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  // Kitap paylaşma fonksiyonu
  const handleShareBook = async () => {
    try {
      const bookUrl = getBookUrl();
      if (!bookUrl) {
        showNotification({
          title: 'Hata',
          message: 'Kitap URL\'si oluşturulamadı',
          variant: 'danger'
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: book?.title || 'Kitap',
          text: `${book?.title || 'Bu kitabı'} görüntüle`,
          url: bookUrl,
        });
      } else {
        await navigator.clipboard.writeText(bookUrl);
        showNotification({
          title: 'Başarılı',
          message: 'Kitap linki kopyalandı',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error sharing book:', error);
      showNotification({
        title: 'Hata',
        message: 'Kitap paylaşılırken bir hata oluştu',
        variant: 'danger'
      });
    }
  };

  // WhatsApp'ta paylaş
  const handleShareOnWhatsApp = async () => {
    try {
      const bookUrl = getBookUrl();

      // Kitap verisi yoksa API'den al
      let bookName = book?.title;
      if (!bookName) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const bookData = await response.json();
            // İlk çeviriden başlığı al
            bookName = bookData.translations?.[0]?.title || bookData.author || 'Kitap';
          } else {
            bookName = 'Kitap';
          }
        } catch (err) {
          bookName = 'Kitap';
        }
      }

      // Dile göre mesaj şablonu
      const messageTemplates = {
        tr: `${bookName} kitabını görüntüle: ${bookUrl}`,
        en: `View the book "${bookName}": ${bookUrl}`,
        ar: `عرض الكتاب "${bookName}": ${bookUrl}`,
        de: `Das Buch "${bookName}" ansehen: ${bookUrl}`,
        fr: `Voir le livre "${bookName}": ${bookUrl}`,
        ja: `「${bookName}」の本を見る: ${bookUrl}`
      };

      const currentLang = languageCode || locale || 'tr';
      const message = messageTemplates[currentLang] || messageTemplates['tr'];
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing on WhatsApp:', error);
      showNotification({
        title: 'Hata',
        message: 'WhatsApp paylaşımında bir hata oluştu',
        variant: 'danger'
      });
    }
  };

  // Haber akışında paylaş
  const handleShareToFeed = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        showNotification({
          title: 'Hata',
          message: 'Giriş yapmalısınız',
          variant: 'danger'
        });
        return;
      }

      // Token'dan user ID'yi çıkar (JWT decode)
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload.userId || payload.sub;
      } catch (err) {
        // Alternatif: localStorage'dan user bilgisini al
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            userId = JSON.parse(userData).id;
          } catch (parseErr) {
          }
        }
      }

      if (!userId) {
        // Son çare: API'den mevcut kullanıcı bilgisini al
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            userId = userData.id;
          }
        } catch (apiErr) {
        }
      }

      if (!userId) {
        showNotification({
          title: 'Hata',
          message: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
          variant: 'danger'
        });
        return;
      }

      // Kitap verisi yoksa API'den al
      let bookName = book?.translations?.[0]?.title || book?.title;
      if (!bookName) {
        try {
          const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const bookData = await response.json();
            // İlk çeviriden başlığı al
            bookName = bookData.translations?.[0]?.title || bookData.author || 'Kitap';
          } else {
            bookName = 'Kitap';
          }
        } catch (err) {
          bookName = 'Kitap';
        }
      }

      const bookUrl = getBookUrl();

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('type', 'shared_book');
      formData.append('title', ''); // Empty title for shared book posts
      formData.append('content', `${bookName} kitabını paylaştı`);
      formData.append('shared_book_id', params.id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showNotification({
          title: 'Başarılı',
          message: 'Kitap haber akışında paylaşıldı',
          variant: 'success'
        });
      } else {
        throw new Error('Paylaşım başarısız');
      }
    } catch (error) {
      console.error('Error sharing to feed:', error);
      showNotification({
        title: 'Hata',
        message: 'Haber akışında paylaşımda bir hata oluştu',
        variant: 'danger'
      });
    }
  };

  if (loading) {
    return (
      <Col lg={9}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{translate('books.detail.loadingBook', 'Kitap yükleniyor...')}</p>
        </div>
      </Col>
    );
  }


  if (error) {
    return (
      <Col lg={9}>
        <Alert variant="danger">
          <Alert.Heading>{t('books.list.error')}</Alert.Heading>
          <p>{error}</p>
          <Link href={getBackUrl()}>
            <Button variant="primary">{t('books.detail.backToList')}</Button>
          </Link>
        </Alert>
      </Col>
    );
  }

  if (!book) {
    return (
      <Col lg={9}>
        <Alert variant="warning">
          <Alert.Heading>{t('books.detail.notFound')}</Alert.Heading>
          <p>{t('books.detail.notAvailable')}</p>
          <Link href={getBackUrl()}>
            <Button variant="primary">{t('books.detail.backToList')}</Button>
          </Link>
        </Alert>
      </Col>
    );
  }

  // İlk çeviriyi al (kullanıcının seçtiği dil varsa onu, yoksa ilk translation)
  const mainTranslation = book.translations?.[0];
  const bookTitle = mainTranslation?.title || book.author || t('books.detail.title');

  return (
    <Col lg={9}>
      {/* Header */}
      <Card className={`mb-4 border-0 shadow-sm ${styles.pageHeaderCard}`}>
        <CardHeader className="bg-gradient text-white border-0" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Row className="align-items-center g-3">
            <Col xs={12}>
              <div className="d-flex align-items-center">
                <Link href={getBackUrl()}>
                  <Button
                    variant="light"
                    size="sm"
                    className="me-3"
                  >
                    <BsArrowLeft className="me-1" />
                    {languageName ? `${translate(`books.languages.${languageName}`, languageName)} ${translate('books.detail.backToLanguageBooks', 'Kitaplarına Dön')}` : translate('books.detail.backToList', 'Listeye Dön')}
                  </Button>
                </Link>
                <CardTitle className="mb-0 h4">
                  <BsBook className="me-2" />
                  {bookTitle}
                </CardTitle>

              </div>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Kitap Detayları */}
      <Card className={`border-0 shadow-sm ${styles.detailCard}`} style={{ position: 'relative' }}>
        {/* Dropdown Button - Sağ Üst Köşe */}
        <div className={styles.shareButtonWrapper} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          overflow: 'visible'
        }}>
          <Dropdown className="d-inline-block">
            <DropdownToggle
              variant="outline-secondary"
              size="sm"
              className={`d-flex align-items-center book-translation-share-toggle ${styles.shareToggleButton}`}
            >
              <BsShare className="me-1" />
              {t('books.share') || 'Paylaş'}
            </DropdownToggle>
            <DropdownMenu align="end">
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const bookUrl = getBookUrl();
                  if (bookUrl) {
                    navigator.clipboard.writeText(bookUrl);
                    showNotification({
                      title: 'Başarılı',
                      message: 'Kitap linki kopyalandı',
                      variant: 'success'
                    });
                  }
                }}
              >
                <BsShare size={16} className="me-2" />
                {t('books.share') || 'Paylaş'}
              </DropdownItem>
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const bookUrl = getBookUrl();
                  const title = book?.title || 'Kitap';
                  const message = `${title} kitabını görüntüle: ${bookUrl}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <BsWhatsapp size={16} className="me-2 text-success" />
                {t('books.shareOnWhatsApp') || 'WhatsApp\'ta Paylaş'}
              </DropdownItem>
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      showNotification({
                        title: 'Hata',
                        message: 'Giriş yapmalısınız',
                        variant: 'danger'
                      });
                      return;
                    }

                    let userId;
                    try {
                      const payload = JSON.parse(atob(token.split('.')[1]));
                      userId = payload.id || payload.userId || payload.sub;
                    } catch (err) {
                      const userData = localStorage.getItem('user');
                      if (userData) {
                        try {
                          userId = JSON.parse(userData).id;
                        } catch (parseErr) {
                        }
                      }
                    }

                    if (!userId) {
                      showNotification({
                        title: 'Hata',
                        message: 'Kullanıcı bilgisi bulunamadı',
                        variant: 'danger'
                      });
                      return;
                    }

                    const title = book.title || 'Kitap';

                    const formData = new FormData();
                    formData.append('user_id', userId);
                    formData.append('type', 'shared_book');
                    formData.append('title', '');
                    formData.append('content', `${title} kitabını paylaştı`);
                    formData.append('shared_book_id', params.id);

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: formData
                    });

                    if (response.ok) {
                      showNotification({
                        title: 'Başarılı',
                        message: 'Kitap haber akışında paylaşıldı',
                        variant: 'success'
                      });
                    } else {
                      throw new Error('Paylaşım başarısız');
                    }
                  } catch (error) {
                    console.error('Error sharing to feed:', error);
                    showNotification({
                      title: 'Hata',
                      message: 'Haber akışında paylaşımda bir hata oluştu',
                      variant: 'danger'
                    });
                  }
                }}
              >
                <BsNewspaper size={16} className="me-2 text-primary" />
                {t('books.shareToFeed') || 'Haber Akışında Paylaş'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <CardBody>
          {/* Kitap Kapağı */}
          <div className="text-center mb-4">
            <img
              src={getBookImage(book)}
              alt={bookTitle}
              className={`img-fluid rounded shadow ${styles.coverImage}`}
              style={{ maxWidth: '200px', maxHeight: '280px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/images/book-placeholder.jpg';
              }}
            />
          </div>

          {/* Kitap Bilgileri */}
          <div className="mb-4">
            {book.author && (
              <div className="d-flex align-items-center mb-3">
                <BsPerson className="me-2 text-primary" />
                <strong>{t('books.detail.author')}</strong>
                <span className="ms-2">{book.author}</span>
              </div>
            )}

            {book.publishDate && (
              <div className="d-flex align-items-center mb-3">
                <BsCalendar className="me-2 text-primary" />
                <strong>{t('books.detail.publishDate')}</strong>
                <span className="ms-2">{new Date(book.publishDate).toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>

          {book.categories && book.categories.length > 0 && (
            <div className="mb-4">
              <h6>{t('books.detail.categories')}</h6>
              <div>
                {book.categories.map((category, index) => (
                  <Badge key={index} bg="primary" className="me-2 mb-2">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {book.translations && book.translations.length > 0 && (
            <div className="mb-4">
              <h6>
                <BsBook className="me-2" />
                {t('books.detail.availableLanguageVersions')}
              </h6>
              <div className="row">
                {book.translations.map((translation, index) => (
                  <Col key={index} md={12} className="mb-3">
                    <Card className={`border ${styles.bookCard}`}>
                      <CardBody className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
                          <div>
                            <Badge bg="info" className={`mb-2 ${styles.languageBadge}`}>{translation.language?.name || t('books.detail.unknownLanguage')}</Badge>
                            <h5 className="mb-1">{translation.title}</h5>
                          </div>
                          <div className={styles.bookActionButtons}>
                            {translation.pdfUrl && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleReadPdf(translation.pdfUrl, translation.title)}
                                  className={`d-flex align-items-center ${styles.readButton}`}
                                >
                                  <BsEyeFill className="me-1" />
                                  {t('books.detail.readPdf')}
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(translation.pdfUrl, translation.title)}
                                  className={`d-flex align-items-center ${styles.downloadButton}`}
                                >
                                  <BsDownload className="me-1" />
                                  {t('books.detail.downloadPdf')}
                                </Button>
                              </>
                            )}
                            {/* Dil Seç ve Oku Butonu */}
                            <>
                              {!isReading || readingTranslationId !== index ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => openLanguageModal(translation, index)}
                                  className="d-flex align-items-center"
                                  disabled={translating}
                                >
                                  <BsTranslate className="me-1" />
                                  {translating ? 'Çevriliyor...' : 'Dil Seç ve Oku'}
                                </Button>
                              ) : (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={stopTextToSpeech}
                                  className="d-flex align-items-center"
                                >
                                  <BsX className="me-1" />
                                  Durdur
                                </Button>
                              )}
                            </>

                          </div>
                        </div>

                        {translation.description && (
                          <div className="mb-2">
                            <strong className="text-muted small">{t('books.detail.description')}</strong>
                            <p className="text-muted mb-0 mt-1">{translation.description}</p>
                          </div>
                        )}

                        {translation.summary && (
                          <div>
                            <strong className="text-muted small">{t('books.detail.summary')}</strong>
                            <p className="text-muted mb-0 mt-1">{translation.summary}</p>
                          </div>
                        )}

                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* PDF Viewer Modal */}
      <PdfViewer
        show={showPdfViewer}
        onHide={() => setShowPdfViewer(false)}
        pdfUrl={selectedPdfUrl}
        title={selectedPdfTitle}
      />

      {/* Dil Seçim Modal */}
      <Modal
        show={showLanguageModal}
        onHide={() => {
          if (!translating) {
            setShowLanguageModal(false);
            setSelectedTranslationForTranslate(null);
            setSelectedTranslationIndexForTranslate(null);
          }
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton={!translating}>
          <Modal.Title>
            <BsTranslate className="me-2" />
            Okuma Dili Seçin
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3 text-muted">
            Kitabı hangi dilde okumak istersiniz? Seçtiğiniz dilde çeviri yapılıp sesli okunacaktır.
          </p>
          {languagesLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Diller yükleniyor...</p>
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
                      <div style={{ fontSize: '1rem', lineHeight: 1, marginTop: '2px' }}>
                        {getLanguageFlag(lang.code)}
                      </div>
                    </Button>
                  </Col>
                ))}
            </div>
          ) : (
            <Alert variant="warning">
              Dil listesi yüklenemedi. Lütfen sayfayı yenileyin.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              if (!translating) {
                setShowLanguageModal(false);
                setSelectedTranslationForTranslate(null);
                setSelectedTranslationIndexForTranslate(null);
              }
            }}
            disabled={translating}
          >
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modern Floating Audio Player */}
      {isPlayerOpen && (
        <div
          className={`p-3 d-flex justify-content-center reading-player-modal ${styles.readingPlayerModal}`}
          style={{
            zIndex: 1050,
            position: 'fixed',
            left: '50%',
            ...(isDesktop ? { top: '50%', bottom: 'auto' } : { bottom: '0.5rem' }),
            width: '100%',
            maxWidth: '1160px',
            transform: isDesktop
              ? `translate(-50%, -50%) translate(${playerPosition.x}px, ${playerPosition.y}px)`
              : `translate(-50%, 0) translate(${playerPosition.x}px, ${playerPosition.y}px)`,
            cursor: isDraggingPlayer ? 'grabbing' : 'grab',
            userSelect: 'none',
            '--player-drag-x': `${playerPosition.x}px`,
            '--player-drag-y': `${playerPosition.y}px`
          }}
          onMouseDown={handlePlayerDragStart}
          onDoubleClick={() => setPlayerPosition({ x: 0, y: 0 })}
        >
          <Card
            className={`border-0 shadow-lg reading-player-card ${isDarkMode ? '' : 'border'}`}
            style={{
              width: '100%',
              maxWidth: '1000px',
              backgroundColor: isDarkMode ? '#1c1f2e' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#111b36',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              overflow: 'visible'
            }}
          >
            <CardBody className="p-3" style={{ overflow: 'visible' }}>
              <div className={`d-flex flex-column align-items-center mb-3 ${styles.playerDragHandle}`}>
                <div style={{ width: '44px', height: '4px', borderRadius: '4px', background: isDarkMode ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.12)' }} />
                <div className="d-none d-md-flex align-items-center gap-2 mt-2 drag-hint-animation" style={{
                  fontSize: '0.9rem',
                  color: '#dc3545',
                  fontWeight: 'bold',
                  letterSpacing: '0.6px'
                }}>
                  <BsArrowsMove size={16} />
                  <span>TAŞIMAK İÇİN SÜRÜKLEYİN</span>
                </div>
              </div>
              {showReadingAssist && (currentOriginalChunks.length > 0 || currentTranslatedChunks.length > 0) && (
                <div
                  className={`mb-3 p-2 rounded ${styles.readingAssistSection}`}
                  style={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <small style={{ color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)' }}>Orijinal + Çeviri (Anlık)</small>
                    <small style={{ color: '#8ab4ff' }}>
                      {activeChunkIndex + 1}/{Math.max(currentOriginalChunks.length, currentTranslatedChunks.length)}
                    </small>
                  </div>
                  {currentOriginalChunks.length > 0 && (
                    <div
                      className={`mb-2 p-2 rounded ${styles.chunkBox}`}
                      style={{
                        background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8f9fa',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                        minHeight: '108px'
                      }}
                    >
                      <small style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6c757d', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Orijinal Metin
                      </small>
                      <div ref={originalChunksContainerRef} className={styles.chunkScrollArea} style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {currentOriginalChunks.map((chunk, idx) => (
                          <span
                            key={`o-${idx}-${chunk.slice(0, 10)}`}
                            data-original-chunk-index={idx}
                            style={{
                              display: 'inline',
                              marginRight: '6px',
                              padding: idx === activeChunkIndex ? '1px 4px' : '0',
                              borderRadius: '4px',
                              background: idx === activeChunkIndex ? 'rgba(255,193,7,0.35)' : 'transparent',
                              textDecoration: idx === activeChunkIndex ? 'underline' : 'none',
                              color: idx === activeChunkIndex ? (isDarkMode ? '#ffffff' : '#000000') : (idx < activeChunkIndex ? (isDarkMode ? '#ffffff' : '#000000') : (isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)')),
                              transition: 'all 0.2s ease',
                              fontWeight: idx === activeChunkIndex ? '600' : 'normal'
                            }}
                          >
                            {chunk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentTranslatedChunks.length > 0 && (
                    <div
                      className={`p-2 rounded ${styles.chunkBox}`}
                      style={{
                        background: isDarkMode ? 'rgba(0,123,255,0.08)' : 'rgba(0,123,255,0.04)',
                        border: isDarkMode ? '1px solid rgba(0,123,255,0.25)' : '1px solid rgba(0,123,255,0.15)',
                        minHeight: '108px'
                      }}
                    >
                      <small style={{ color: isDarkMode ? 'rgba(255,255,255,0.72)' : '#0d6efd', display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Çeviri Metni
                      </small>
                      <div ref={translatedChunksContainerRef} className={styles.chunkScrollArea} style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {currentTranslatedChunks.map((chunk, idx) => (
                          <span
                            key={`t-${idx}-${chunk.slice(0, 10)}`}
                            data-translated-chunk-index={idx}
                            style={{
                              display: 'inline',
                              marginRight: '6px',
                              padding: idx === activeChunkIndex ? '1px 4px' : '0',
                              borderRadius: '4px',
                              background: idx === activeChunkIndex ? 'rgba(0,123,255,0.25)' : 'transparent',
                              textDecoration: idx === activeChunkIndex ? 'underline' : 'none',
                              color: idx === activeChunkIndex ? (isDarkMode ? '#ffffff' : '#000000') : (idx < activeChunkIndex ? (isDarkMode ? '#ffffff' : '#000000') : (isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)')),
                              transition: 'all 0.2s ease',
                              fontWeight: idx === activeChunkIndex ? '600' : 'normal'
                            }}
                          >
                            {chunk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Row className={`align-items-center g-3 ${styles.playerControlsRow}`}>
                {/* Book Info & Status */}
                <Col xs={12} md={3} className={styles.playerBookInfoCol}>
                  <div className={`d-flex align-items-center gap-3 ${styles.playerBookInfoInner}`}>
                    <div
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm player-volume-icon"
                      style={{ width: '45px', height: '45px', animation: isReading && !isPaused ? 'pulse 2s infinite' : 'none', color: '#ffffff !important' }}
                    >
                      <BsVolumeUp size={22} style={{ color: '#ffffff' }} />
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-truncate" style={{ fontSize: '0.95rem', color: isDarkMode ? '#ffffff' : '#111b36' }}>{book?.translations?.[0]?.title}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="primary" style={{ fontSize: '0.7rem', color: '#ffffff !important' }}>{targetLang?.name || 'Çeviri'}</Badge>
                        <span style={{ fontSize: '0.75rem', color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
                          {translating || playerStatus === 'loading'
                            ? 'Hazırlanıyor...'
                            : playerStatus === 'error'
                              ? 'Hata oluştu'
                              : playerStatus === 'completed'
                                ? 'Tamamlandı'
                                : isPaused || playerStatus === 'paused'
                                  ? 'Duraklatıldı'
                                  : 'Okunuyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Main Controls */}
                <Col xs={12} md={4} className={`d-flex flex-column align-items-center ${styles.playerMainControlsCol}`}>
                  <div className={styles.playerControlsInline}>
                    <div className={`d-flex align-items-center gap-3 player-control-cluster ${styles.playerControlRow}`}>
                      <Button
                        variant="link"
                        className="player-icon-btn"
                        disabled={currentPage <= 1 || translating}
                        onClick={() => handleTranslateAndRead(targetLang, currentPage - 1)}
                      >
                        <BsSkipBackward size={20} />
                      </Button>

                      <Button
                        variant={isDarkMode ? "light" : "primary"}
                        className="rounded-circle d-flex align-items-center justify-content-center shadow player-main-btn"
                        onClick={pauseResumeTextToSpeech}
                        disabled={translating || !currentAudioRef.current}
                      >
                        {isPaused ? <BsPlay size={28} /> : <BsPause size={28} />}
                      </Button>

                      <Button
                        variant="link"
                        className="player-icon-btn"
                        disabled={currentPage >= totalPages || translating}
                        onClick={() => handleTranslateAndRead(targetLang, currentPage + 1)}
                      >
                        <BsSkipForward size={20} />
                      </Button>
                    </div>
                    <div className={`player-page-chip text-center ${isDarkMode ? '' : 'bg-light'} ${styles.playerPageChip}`}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#6c757d' }}>SAYFA</div>
                    <div className="d-flex align-items-center gap-1 justify-content-center">
                      <div className="position-relative d-flex align-items-center">
                        <select
                          className="bg-transparent border-0 fw-bold p-0 pe-1 player-select"
                          style={{
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            minWidth: '30px',
                            textAlign: 'right',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            color: isDarkMode ? '#007bff' : '#0d6efd'
                          }}
                          value={currentPage}
                          onChange={(e) => {
                            const newPage = parseInt(e.target.value);
                            handleTranslateAndRead(targetLang, newPage);
                          }}
                        >
                          {[...Array(totalPages || 1)].map((_, i) => (
                            <option key={i + 1} value={i + 1} style={{ backgroundColor: isDarkMode ? '#1c1f2e' : '#ffffff', color: isDarkMode ? '#ffffff' : '#000000' }}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <span style={{ fontSize: '1rem', color: isDarkMode ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.5)' }}>/ {totalPages || 1}</span>
                    </div>
                  </div>
                  </div>

                  <div className={`w-100 px-3 mt-1 ${styles.playerSliderWrap}`}>
                    <input
                      type="range"
                      className="w-100 player-slider"
                      min="0"
                      max="100"
                      step="0.1"
                      value={previewProgress !== null ? previewProgress : getProgress()}
                      onMouseDown={() => {
                        setIsSliderSeeking(true);
                        setPreviewProgress(getProgress());
                      }}
                      onTouchStart={() => {
                        setIsSliderSeeking(true);
                        setPreviewProgress(getProgress());
                      }}
                      onMouseUp={commitSliderSeek}
                      onTouchEnd={commitSliderSeek}
                      onChange={(e) => {
                        const nextValue = parseFloat(e.target.value);
                        if (isSliderSeeking) {
                          setPreviewProgress(nextValue);
                        } else {
                          seekTo(nextValue);
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        accentColor: '#007bff'
                      }}
                    />
                  </div>
                </Col>

                {/* Page Info & Speed */}
                <Col xs={12} md={5} className={styles.playerActionsCol}>
                  <div className={`d-flex flex-column align-items-center align-items-md-end gap-2 px-2 ${styles.playerActionsWrap}`}>
                    <div className="d-flex align-items-center gap-2 flex-nowrap d-none d-md-flex">
                      <Dropdown drop="up" style={{ overflow: 'visible' }}>
                        <DropdownToggle
                          variant={isDarkMode ? "outline-light" : "outline-primary"}
                          size="sm"
                          className="rounded-pill px-3 d-flex align-items-center gap-1 player-pill-btn"
                          style={{ fontSize: '0.8rem', color: isDarkMode ? '#ffffff' : '#0d6efd' }}
                        >
                          {playbackRate}x
                        </DropdownToggle>
                        <DropdownMenu
                          style={{
                            minWidth: '120px',
                            backgroundColor: isDarkMode ? '#1c1f2e' : '#ffffff',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            borderRadius: '12px',
                            padding: '8px 0',
                            marginBottom: '10px',
                            zIndex: 2000,
                            position: 'absolute'
                          }}
                        >
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className="dropdown-item w-100 border-0 text-start"
                              style={{
                                backgroundColor: playbackRate === rate ? (isDarkMode ? '#007bff' : '#0d6efd') : 'transparent',
                                color: playbackRate === rate ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000'),
                                padding: '8px 16px',
                                fontSize: '0.85rem',
                                transition: 'background 0.2s',
                                cursor: 'pointer'
                              }}
                            >
                              {rate === 1.0 ? 'Normal (1x)' : `${rate}x`}
                            </button>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>

                    <div className={`d-flex align-items-center gap-2 flex-wrap justify-content-center justify-content-md-end ${styles.playerActionsRow}`}>
                      <Dropdown drop="up" style={{ overflow: 'visible' }} className="d-md-none">
                        <DropdownToggle
                          variant={isDarkMode ? "outline-light" : "outline-primary"}
                          size="sm"
                          className="rounded-pill px-2 d-flex align-items-center gap-1 player-pill-btn"
                          style={{ fontSize: '0.8rem', color: isDarkMode ? '#ffffff' : '#0d6efd' }}
                        >
                          {playbackRate}x
                        </DropdownToggle>
                        <DropdownMenu
                          style={{
                            minWidth: '120px',
                            backgroundColor: isDarkMode ? '#1c1f2e' : '#ffffff',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            borderRadius: '12px',
                            padding: '8px 0',
                            marginBottom: '10px',
                            zIndex: 2000,
                            position: 'absolute'
                          }}
                        >
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className="dropdown-item w-100 border-0 text-start"
                              style={{
                                backgroundColor: playbackRate === rate ? (isDarkMode ? '#007bff' : '#0d6efd') : 'transparent',
                                color: playbackRate === rate ? '#ffffff' : (isDarkMode ? '#ffffff' : '#000000'),
                                padding: '8px 16px',
                                fontSize: '0.85rem',
                                transition: 'background 0.2s',
                                cursor: 'pointer'
                              }}
                            >
                              {rate === 1.0 ? 'Normal (1x)' : `${rate}x`}
                            </button>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                      <Button
                        variant={isDarkMode ? "outline-light" : "outline-primary"}
                        size="sm"
                        className="rounded-pill px-2 player-pill-btn"
                        onClick={() => {
                          if (selectedPdfUrlForTranslate || selectedPdfUrl) {
                            setSelectedPdfUrl(selectedPdfUrlForTranslate || selectedPdfUrl);
                            setSelectedPdfTitle(book?.translations?.[0]?.title || 'PDF');
                            setShowPdfViewer(true);
                          } else {
                            showNotification({
                              title: 'Bilgi',
                              message: 'Bu içerik için PDF bulunamadı.',
                              variant: 'warning'
                            });
                          }
                        }}
                      >
                        <span className="d-none d-md-inline">PDF&apos;i Göster</span>
                        <span className="d-md-none">PDF</span>
                      </Button>

                      <Button
                        variant={isDarkMode ? "outline-light" : "outline-primary"}
                        size="sm"
                        className="rounded-pill px-2 player-pill-btn"
                        onClick={() => setShowReadingAssist((prev) => !prev)}
                      >
                        <span className="d-none d-md-inline">{showReadingAssist ? 'Vurguyu Gizle' : 'Vurguyu Göster'}</span>
                        <span className="d-md-none">{showReadingAssist ? 'Gizle' : 'Göster'}</span>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle p-1 player-close-btn"
                        onClick={stopTextToSpeech}
                        title="Kapat"
                      >
                        <BsX size={18} />
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
        }
        @keyframes dragBlink {
          0% { opacity: 0.5; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1.02); }
        }
        .drag-hint-animation {
          animation: dragBlink 1s ease-in-out infinite alternate;
        }
        .player-select option {
          background-color: ${isDarkMode ? '#1c1f2e' : '#ffffff'} !important;
          color: ${isDarkMode ? 'white' : 'black'} !important;
        }
        .player-slider {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 5px;
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          outline: none;
        }
        .player-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        .player-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        .player-control-cluster {
          background: ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
          border-radius: 999px;
          padding: 8px 12px;
          backdrop-filter: blur(8px);
        }
        .player-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50% !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          color: ${isDarkMode ? 'rgba(255,255,255,0.95)' : '#0d6efd'} !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(13,110,253,0.2)'} !important;
          background: ${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(13,110,253,0.05)'} !important;
          transition: all 0.2s ease;
          text-decoration: none !important;
        }
        .player-icon-btn:hover {
          transform: translateY(-1px);
          background: ${isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(13,110,253,0.1)'} !important;
          border-color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(13,110,253,0.3)'} !important;
        }
        .player-main-btn {
          width: 56px !important;
          height: 56px !important;
          background: linear-gradient(135deg, #ffffff 0%, #e9f0ff 100%) !important;
          color: #111b36 !important;
          border: 1px solid rgba(255,255,255,0.85) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.24) !important;
          transition: all 0.2s ease;
        }
        .player-main-btn:hover {
          transform: translateY(-1px) scale(1.02);
        }
        .player-page-chip {
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
          background: ${isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8f9fa'};
          min-width: 84px;
        }
        .player-pill-btn {
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.24)' : 'rgba(13,110,253,0.24)'} !important;
          background: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(13,110,253,0.05)'} !important;
          color: ${isDarkMode ? '#f4f7ff' : '#0d6efd'} !important;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .player-pill-btn:hover,
        .player-pill-btn:focus {
          border-color: ${isDarkMode ? 'rgba(255,255,255,0.42)' : 'rgba(13,110,253,0.42)'} !important;
          background: ${isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(13,110,253,0.1)'} !important;
          color: ${isDarkMode ? '#ffffff' : '#0d6efd'} !important;
          transform: translateY(-1px);
        }
        .player-close-btn {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,77,77,0.7) !important;
          color: #ff5e5e !important;
          background: rgba(255,77,77,0.08) !important;
          transition: all 0.2s ease;
        }
        .player-close-btn:hover {
          background: rgba(255,77,77,0.2) !important;
          color: #ff9d9d !important;
          transform: translateY(-1px);
        }
        @media (max-width: 991.98px) {
          .player-page-chip {
            min-width: 72px;
            padding: 6px 8px;
          }
          .player-pill-btn {
            padding-left: 0.55rem !important;
            padding-right: 0.55rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </Col>
  );
};

export default BookDetailPage;
