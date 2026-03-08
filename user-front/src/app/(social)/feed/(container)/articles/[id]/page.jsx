'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Badge, Spinner, Alert, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ProgressBar } from 'react-bootstrap';
import { BsDownload, BsCalendar, BsPerson, BsFileText, BsArrowLeft, BsEyeFill, BsBook, BsGrid3X3, BsShare, BsWhatsapp, BsNewspaper, BsX, BsVolumeUp, BsTranslate, BsPause, BsPlay, BsSkipBackward, BsSkipForward } from 'react-icons/bs';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLanguages } from '@/hooks/useLanguages';
import PdfViewer from '@/components/PdfViewer';
import { generateArticleUrl } from '@/utils/articleEncoder';
import { pdfjs } from 'react-pdf';
import { getLanguageCode, cleanTextForTTS, fetchTTSAudio } from '@/utils/textToSpeech';

// PDF.js worker'ı yapılandır
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ArticleDetailPage = () => {
  const { t, loading: langLoading, locale } = useLanguage();
  const { showNotification } = useNotificationContext();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState(null);
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedTranslationForTranslate, setSelectedTranslationForTranslate] = useState(null);
  const [selectedTranslationIndexForTranslate, setSelectedTranslationIndexForTranslate] = useState(null);
  const [selectedPdfUrlForTranslate, setSelectedPdfUrlForTranslate] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [targetLang, setTargetLang] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerStatus, setPlayerStatus] = useState('idle');
  const [showReadingAssist, setShowReadingAssist] = useState(true);
  const [currentOriginalChunks, setCurrentOriginalChunks] = useState([]);
  const [currentTranslatedChunks, setCurrentTranslatedChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPlayer, setIsDraggingPlayer] = useState(false);
  const [isSliderSeeking, setIsSliderSeeking] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(null);
  const isReadingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
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


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/articles/${params.id}`, {
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  const getArticleImage = (article) => {
    if (article?.coverImage) {
      return article.coverImage.startsWith('http') ? article.coverImage : `${API_BASE_URL}${article.coverImage}`;
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
      const safeTitle = (title || 'article').replace(/[^\w\-]+/g, '_');
      const filename = `${safeTitle}.pdf`;
      const downloadUrl = `/api/download-pdf?pdfUrl=${encodeURIComponent(fullPdfUrl)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('PDF indirilemedi');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      showNotification({ title: 'Hata', message: 'PDF indirilemedi.', variant: 'danger' });
    }
  };

  // PDF'den text çıkarma fonksiyonu
  const extractTextFromPdf = async (pdfUrl) => {
    try {
      if (typeof window === 'undefined' || !pdfjs) {
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

  const getLanguageFlag = (code) => {
    const flagMap = {
      tr: '🇹🇷', en: '🇬🇧', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸',
      it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', ja: '🇯🇵', zh: '🇨🇳', ko: '🇰🇷',
      nl: '🇳🇱', fa: '🇮🇷', ur: '🇵🇰', hi: '🇮🇳',
    };
    return flagMap[(code || '').toLowerCase()] || '🌐';
  };

  const splitTextIntoChunks = (text) => {
    if (!text || !text.trim()) return [];
    const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
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
  }, []);

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

  const rewindTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const forwardTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  };

  const changePlaybackRate = (newRate) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
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

  // Zaman göstergesi için effect
  useEffect(() => {
    let interval = null;
    if (isReading && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (isPaused) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading, isPaused]);

  // Backend'den metni çevir (Caching desteği ile)
  const translateText = async (text, targetLangCode, sourceLangCode = null, pageNumber = null, articleId = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Eğer sayfa bazlı çeviri ise yeni endpoint'i kullan
      if (pageNumber !== null && articleId !== null) {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/page-translate`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            pageNumber,
            originalText: text,
            targetLangCode
          })
        });

        if (!response.ok) {
          throw new Error('Sayfa çevirisi başarısız');
        }

        const data = await response.json();
        return data.translatedText;
      }

      // Genel çeviri için eski endpoint
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

  // Seçilen dilde çeviri yap ve sesli oku (Sayfa bazlı)
  const handleTranslateAndRead = async (targetLanguage, startPage = 1) => {
    if (!selectedTranslationForTranslate) return;
    disposeCurrentAudio();
    readingSessionIdRef.current += 1;
    playbackQueueRef.current = [];
    queueIndexRef.current = 0;
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

      // Eğer PDF varsa ve henüz yüklenmemişse yükle
      if (selectedPdfUrlForTranslate && !activePdfDoc) {
        const loadingTask = pdfjs.getDocument(selectedPdfUrlForTranslate);
        activePdfDoc = await loadingTask.promise;
        setPdfDoc(activePdfDoc);
        setTotalPages(activePdfDoc.numPages);
        activeTotalPages = activePdfDoc.numPages;
      } else if (!selectedPdfUrlForTranslate) {
        // PDF yoksa tek sayfa olarak kabul et veya içeriği böl
        const content = selectedTranslationForTranslate.content || '';
        const pages = content.match(/.{1,3000}/gs) || [content]; // Her 3000 karakter bir sayfa olsun
        activeTotalPages = pages.length;
        setTotalPages(pages.length);
      }

      setTargetLang(targetLanguage);
      currentLangCodeRef.current = targetLanguage.code;

      const playPage = async (pageNum) => {
        if (pageNum > activeTotalPages) {
          setIsReading(false);
          setIsPaused(false);
          isReadingRef.current = false;
          setTranslating(false);
          setPlayerStatus('completed');
          showNotification({ title: 'Tamamlandı', message: 'Okuma tamamlandı.', variant: 'success' });
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
            const content = selectedTranslationForTranslate.content || '';
            const pages = content.match(/.{1,3000}/gs) || [content];
            textToTranslate = pages[pageNum - 1];
          }

          if (!textToTranslate || textToTranslate.trim().length === 0) {
            if (pageNum < activeTotalPages) return playPage(pageNum + 1);
            setTranslating(false);
            return;
          }

          const rawTranslatedText = await translateText(
            textToTranslate,
            targetLanguage.code,
            null,
            pageNum,
            params.id
          );

          // HTML entity ve fazla boşlukları temizle
          const translatedText = cleanTextForTTS(rawTranslatedText);
          const originalChunks = splitTextIntoChunks(textToTranslate);
          const translatedChunks = splitTextIntoChunks(translatedText);
          const chunks = translatedChunks;
          setCurrentOriginalChunks(originalChunks);
          setCurrentTranslatedChunks(translatedChunks);
          setActiveChunkIndex(0);

          setTranslating(false);
          disposeCurrentAudio();
          const segmentQueue = chunks.length > 0 ? chunks : [translatedText];
          playbackQueueRef.current = segmentQueue;
          queueIndexRef.current = 0;
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
          setTranslating(false);
          setIsReading(false);
          setIsPaused(false);
          isReadingRef.current = false;
          setPlayerStatus('error');
        }
      };

      isReadingRef.current = true;
      playPage(startPage);

    } catch (error) {
      console.error('Play error:', error);
      setTranslating(false);
      setPlayerStatus('error');
      showNotification({ title: 'Hata', message: 'Bir sorun oluştu', variant: 'danger' });
    }
  };

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
  };

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

  // Dil seçim modalını aç
  const openLanguageModal = (translation, translationIndex, pdfUrl = null) => {
    setSelectedTranslationForTranslate(translation);
    setSelectedTranslationIndexForTranslate(translationIndex);
    setSelectedPdfUrlForTranslate(pdfUrl);
    setShowLanguageModal(true);
  };

  // Geri dönüş URL'ini oluştur (dil bilgisi varsa dahil et)
  const getBackUrl = () => {
    if (languageId && languageName && languageCode) {
      const params = new URLSearchParams({
        languageId,
        languageName,
        languageCode
      });
      return `/feed/articles/list?${params.toString()}`;
    }
    return '/feed/articles';
  };

  // Makale URL'sini oluştur (encoded)
  const getArticleUrl = () => {
    const baseUrl = window.location.origin;
    const currentLang = languageCode || locale || 'tr';

    if (params?.id) {
      return generateArticleUrl(params.id, baseUrl, currentLang);
    }

    return '';
  };

  // Makale paylaşma fonksiyonu
  const handleShareArticle = async () => {
    try {
      const articleUrl = getArticleUrl();
      if (!articleUrl) {
        showNotification({
          title: 'Hata',
          message: 'Makale URL\'si oluşturulamadı',
          variant: 'danger'
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: article?.title || 'Makale',
          text: `${article?.title || 'Bu makaleyi'} görüntüle`,
          url: articleUrl,
        });
      } else {
        await navigator.clipboard.writeText(articleUrl);
        showNotification({
          title: 'Başarılı',
          message: 'Makale linki kopyalandı',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      showNotification({
        title: 'Hata',
        message: 'Makale paylaşılırken bir hata oluştu',
        variant: 'danger'
      });
    }
  };

  // WhatsApp'ta paylaş
  const handleShareOnWhatsApp = async () => {
    try {
      const articleUrl = getArticleUrl();

      // Makale verisi yoksa API'den al
      let articleName = article?.title;
      if (!articleName) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/articles/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const articleData = await response.json();
            // İlk çeviriden başlığı al
            articleName = articleData.translations?.[0]?.title || articleData.author || 'Makale';
          } else {
            articleName = 'Makale';
          }
        } catch (err) {
          articleName = 'Makale';
        }
      }

      // Dile göre mesaj şablonu
      const messageTemplates = {
        tr: `${articleName} makalesini görüntüle: ${articleUrl}`,
        en: `View the article "${articleName}": ${articleUrl}`,
        ar: `عرض المقال "${articleName}": ${articleUrl}`,
        de: `Den Artikel "${articleName}" ansehen: ${articleUrl}`,
        fr: `Voir l'article "${articleName}": ${articleUrl}`,
        ja: `「${articleName}」の記事を見る: ${articleUrl}`
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

      // Makale verisi yoksa API'den al
      let articleName = article?.title;
      if (!articleName) {
        try {
          const response = await fetch(`${API_BASE_URL}/articles/${params.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const articleData = await response.json();
            // İlk çeviriden başlığı al
            articleName = articleData.translations?.[0]?.title || articleData.author || 'Makale';
          } else {
            articleName = 'Makale';
          }
        } catch (err) {
          articleName = 'Makale';
        }
      }

      const articleUrl = getArticleUrl();

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('type', 'shared_article');
      formData.append('title', ''); // Empty title for shared article posts
      formData.append('content', `${articleName} makalesini paylaştı`);
      formData.append('shared_article_id', params.id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showNotification({
          title: 'Başarılı',
          message: 'Makale haber akışında paylaşıldı',
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
          <p className="mt-3">{translate('articles.detail.loadingArticle')}</p>
        </div>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={9}>
        <Alert variant="danger">
          <Alert.Heading>{translate('articles.detail.error')}</Alert.Heading>
          <p>{error}</p>
          <Link href={getBackUrl()}>
            <Button variant="primary">{translate('articles.detail.backToList')}</Button>
          </Link>
        </Alert>
      </Col>
    );
  }

  if (!article) {
    return (
      <Col lg={9}>
        <Alert variant="warning">
          <Alert.Heading>{translate('articles.detail.notFound')}</Alert.Heading>
          <p>{translate('articles.detail.notAvailable')}</p>
          <Link href={getBackUrl()}>
            <Button variant="primary">{translate('articles.detail.backToList')}</Button>
          </Link>
        </Alert>
      </Col>
    );
  }

  // İlk çeviriyi al
  const mainTranslation = article.translations?.[0];
  const articleTitle = mainTranslation?.title || article.title || 'Makale';

  return (
    <Col lg={9}>
      {/* Header */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="bg-gradient text-white border-0" style={{
          background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)'
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
                    {languageName ? `${translate(`books.languages.${languageName}`, languageName)} ${translate('articles.detail.backToLanguageArticles', 'Makalelerine Dön')}` : translate('articles.detail.backToList', 'Listeye Dön')}
                  </Button>
                </Link>
                <CardTitle className="mb-0 h4">
                  <BsFileText className="me-2" />
                  {articleTitle}
                </CardTitle>
              </div>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Makale Detayları */}
      <Card className="border-0 shadow-sm" style={{ position: 'relative' }}>
        {/* Dropdown Button - Sağ Üst Köşe */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          overflow: 'visible'
        }}>
          <Dropdown className="d-inline-block" style={{ position: 'static' }}>
            <DropdownToggle
              variant="light"
              size="sm"
              id="article-share-dropdown"
              className="article-share-dropdown-toggle"
              style={{
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                border: '1px solid rgba(181, 231, 160, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 2px 8px rgba(181, 231, 160, 0.15)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                height: '40px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 231, 160, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 231, 160, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BsGrid3X3
                size={18}
                style={{
                  color: '#66BB6A',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              />
            </DropdownToggle>
            <DropdownMenu
              align="end"
              style={{
                zIndex: 10000,
                minWidth: '200px',
                position: 'absolute',
                top: '100%',
                right: 0,
                left: 'auto'
              }}
            >
              <DropdownItem as="button" onClick={handleShareArticle}>
                <BsShare size={16} className="me-2" />
                {t('articles.share') || 'Paylaş'}
              </DropdownItem>
              <DropdownItem as="button" onClick={handleShareOnWhatsApp}>
                <BsWhatsapp size={16} className="me-2 text-success" />
                {t('articles.shareOnWhatsApp') || 'WhatsApp\'ta Paylaş'}
              </DropdownItem>
              <DropdownItem as="button" onClick={handleShareToFeed}>
                <BsNewspaper size={16} className="me-2 text-primary" />
                {t('articles.shareToFeed') || 'Haber Akışında Paylaş'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <CardBody>
          {/* Makale Kapağı */}
          {article.coverImage && (
            <div className="text-center mb-4">
              <Image
                src={getArticleImage(article)}
                alt={articleTitle}
                width={400}
                height={280}
                className="img-fluid rounded shadow"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/images/book-placeholder.jpg';
                }}
              />
            </div>
          )}

          {/* Makale Bilgileri */}
          <div className="mb-4">
            {article.author && (
              <div className="d-flex align-items-center mb-3">
                <BsPerson className="me-2 text-primary" size={20} />
                <strong>{translate('articles.detail.author')}</strong>
                <span className="ms-2">{article.author}</span>
              </div>
            )}

            {article.publishDate && (
              <div className="d-flex align-items-center mb-3">
                <BsCalendar className="me-2 text-primary" size={20} />
                <strong>{translate('articles.detail.publishDate')}</strong>
                <span className="ms-2">{new Date(article.publishDate).toLocaleDateString('tr-TR')}</span>
              </div>
            )}

            {article.book && (
              <div className="d-flex align-items-center mb-3">
                <BsBook className="me-2 text-primary" size={20} />
                <strong>{translate('articles.detail.book')}</strong>
                <span className="ms-2">{article.book.translations?.[0]?.title || article.book.author}</span>
              </div>
            )}
          </div>

          {/* Çeviriler */}
          {article.translations && article.translations.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-3">
                <BsFileText className="me-2" />
                {translate('articles.detail.availableLanguageVersions')}
              </h6>
              <div className="row">
                {article.translations.map((translation, index) => (
                  <Col key={index} md={12} className="mb-3">
                    <Card className="border">
                      <CardBody className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
                          <div>
                            <Badge bg="info" className="mb-2">
                              {t(`books.languages.${translation.language?.name}`) || translation.language?.name || translate('articles.detail.unknownLanguage')}
                            </Badge>
                            <h5 className="mb-1">{translation.title}</h5>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            {translation.pdfUrl && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleReadPdf(translation.pdfUrl, translation.title)}
                                  className="d-flex align-items-center"
                                >
                                  <BsEyeFill className="me-1" />
                                  {translate('articles.detail.readPdf')}
                                </Button>
                                {(translation.pdfUrl || translation.summary || translation.content) && (
                                  <>
                                    {!isReading || readingTranslationId !== index ? (
                                      <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => {
                                          const pdfUrl = translation.pdfUrl ? getPdfUrl(translation.pdfUrl) : null;
                                          openLanguageModal(translation, index, pdfUrl);
                                        }}
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
                                )}
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(translation.pdfUrl, translation.title)}
                                  className="d-flex align-items-center"
                                >
                                  <BsDownload className="me-1" />
                                  {translate('articles.detail.downloadPdf')}
                                </Button>
                              </>
                            )}
                            <Dropdown className="d-inline-block">
                              <DropdownToggle
                                variant="outline-secondary"
                                size="sm"
                                className="d-flex align-items-center article-translation-share-toggle"
                              >
                                <BsShare className="me-1" />
                                {translate('articles.share') || 'Paylaş'}
                              </DropdownToggle>
                              <DropdownMenu align="end">
                                <DropdownItem
                                  as="button"
                                  onClick={() => {
                                    const baseUrl = window.location.origin;
                                    const lang = translation.language?.code || languageCode || 'tr';
                                    const articleUrl = generateArticleUrl(params.id, baseUrl, lang);
                                    navigator.clipboard.writeText(articleUrl);
                                    showNotification({
                                      title: 'Başarılı',
                                      message: 'Makale linki kopyalandı',
                                      variant: 'success'
                                    });
                                  }}
                                >
                                  <BsShare size={16} className="me-2" />
                                  {t('articles.share') || 'Paylaş'}
                                </DropdownItem>
                                <DropdownItem
                                  as="button"
                                  onClick={() => {
                                    const baseUrl = window.location.origin;
                                    const lang = translation.language?.code || languageCode || 'tr';
                                    const articleUrl = generateArticleUrl(params.id, baseUrl, lang);
                                    const message = `${translation.title} makalesini görüntüle: ${articleUrl}`;
                                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                  }}
                                >
                                  <BsWhatsapp size={16} className="me-2 text-success" />
                                  {t('articles.shareOnWhatsApp') || 'WhatsApp\'ta Paylaş'}
                                </DropdownItem>
                                <DropdownItem
                                  as="button"
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

                                      const formData = new FormData();
                                      formData.append('user_id', userId);
                                      formData.append('type', 'shared_article');
                                      formData.append('title', '');
                                      formData.append('content', `${translation.title} makalesini paylaştı`);
                                      formData.append('shared_article_id', params.id);

                                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: formData
                                      });

                                      if (response.ok) {
                                        showNotification({
                                          title: 'Başarılı',
                                          message: 'Makale haber akışında paylaşıldı',
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
                                  {t('articles.shareToFeed') || 'Haber Akışında Paylaş'}
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>

                        {translation.summary && (
                          <div className="mb-2">
                            <strong className="text-muted small">{translate('articles.detail.summary')}</strong>
                            <p className="text-muted mb-0 mt-1">{translation.summary}</p>
                          </div>
                        )}

                        {translation.content && (
                          <div>
                            <strong className="text-muted small">{translate('articles.detail.content')}</strong>
                            <p className="text-muted mb-0 mt-1" style={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.6'
                            }}>
                              {translation.content}
                            </p>
                          </div>
                        )}

                        {/* Inline Player Removed - Using Floating Player */}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modern Floating Audio Player */}
      {isPlayerOpen && (
        <div
          className="p-3 d-flex justify-content-center"
          style={{
            zIndex: 1050,
            position: 'fixed',
            left: '50%',
            bottom: '0.5rem',
            width: '100%',
            maxWidth: '1160px',
            transform: `translate(-50%, 0) translate(${playerPosition.x}px, ${playerPosition.y}px)`,
            cursor: isDraggingPlayer ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
          onMouseDown={handlePlayerDragStart}
          onDoubleClick={() => setPlayerPosition({ x: 0, y: 0 })}
          role="presentation"
        >
          <Card className="border-0 shadow-lg" style={{ width: '100%', backgroundColor: '#1c1f2e', color: '#fff', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CardBody className="p-3">
              <div className="d-flex justify-content-center mb-2">
                <div style={{ width: '44px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.28)' }} />
              </div>
              {showReadingAssist && (currentOriginalChunks.length > 0 || currentTranslatedChunks.length > 0) && (
                <div className="mb-3 p-2 rounded" style={{ maxHeight: '280px', overflowY: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <small style={{ color: 'rgba(255,255,255,0.75)' }}>Orijinal + Çeviri (Anlık)</small>
                    <small style={{ color: '#8ab4ff' }}>{activeChunkIndex + 1}/{Math.max(currentOriginalChunks.length, currentTranslatedChunks.length)}</small>
                  </div>
                  {currentOriginalChunks.length > 0 && (
                    <div className="mb-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '108px' }}>
                      <small style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Orijinal Metin</small>
                      <div ref={originalChunksContainerRef} style={{ maxHeight: '80px', overflowY: 'auto' }}>
                        {currentOriginalChunks.map((chunk, idx) => (
                          <span key={`o-${idx}-${chunk.slice(0, 10)}`} data-original-chunk-index={idx} style={{
                            display: 'inline', marginRight: '6px', padding: idx === activeChunkIndex ? '1px 4px' : '0',
                            borderRadius: '4px', background: idx === activeChunkIndex ? 'rgba(255,193,7,0.32)' : 'transparent',
                            textDecoration: idx === activeChunkIndex ? 'underline' : 'none',
                            color: idx <= activeChunkIndex ? '#fff' : 'rgba(255,255,255,0.65)', transition: 'all 0.2s ease'
                          }}>{chunk}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentTranslatedChunks.length > 0 && (
                    <div className="p-2 rounded" style={{ background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.25)', minHeight: '108px' }}>
                      <small style={{ color: 'rgba(255,255,255,0.72)', display: 'block', marginBottom: '4px' }}>Çeviri Metni</small>
                      <div ref={translatedChunksContainerRef} style={{ maxHeight: '80px', overflowY: 'auto' }}>
                        {currentTranslatedChunks.map((chunk, idx) => (
                          <span key={`t-${idx}-${chunk.slice(0, 10)}`} data-translated-chunk-index={idx} style={{
                            display: 'inline', marginRight: '6px', padding: idx === activeChunkIndex ? '1px 4px' : '0',
                            borderRadius: '4px', background: idx === activeChunkIndex ? 'rgba(0,123,255,0.35)' : 'transparent',
                            textDecoration: idx === activeChunkIndex ? 'underline' : 'none',
                            color: idx <= activeChunkIndex ? '#fff' : 'rgba(255,255,255,0.65)', transition: 'all 0.2s ease'
                          }}>{chunk}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Row className="align-items-center g-3">
                <Col xs={12} md={3}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px' }}>
                      <BsVolumeUp size={22} style={{ color: '#fff' }} />
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-truncate" style={{ fontSize: '0.95rem' }}>{article?.translations?.[0]?.title}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="primary" style={{ fontSize: '0.7rem' }}>{targetLang?.name || 'Çeviri'}</Badge>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                          {translating || playerStatus === 'loading' ? 'Hazırlanıyor...' : isPaused ? 'Duraklatıldı' : playerStatus === 'completed' ? 'Tamamlandı' : 'Okunuyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center gap-3 mb-2 player-control-cluster">
                    <Button variant="link" className="player-icon-btn" disabled={currentPage <= 1 || translating} onClick={() => handleTranslateAndRead(targetLang, currentPage - 1)}><BsSkipBackward size={20} /></Button>
                    <Button variant="light" className="rounded-circle d-flex align-items-center justify-content-center shadow player-main-btn" onClick={pauseResumeTextToSpeech} disabled={translating || !currentAudioRef.current}>
                      {isPaused ? <BsPlay size={28} /> : <BsPause size={28} />}
                    </Button>
                    <Button variant="link" className="player-icon-btn" disabled={currentPage >= totalPages || translating} onClick={() => handleTranslateAndRead(targetLang, currentPage + 1)}><BsSkipForward size={20} /></Button>
                  </div>
                  <div className="player-page-chip mb-2 text-center">
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>SAYFA</div>
                    <div className="d-flex align-items-center gap-1 justify-content-center">
                      <select className="bg-transparent border-0 fw-bold p-0 pe-1 player-select" style={{ fontSize: '1.2rem', color: '#007bff' }} value={currentPage} onChange={(e) => handleTranslateAndRead(targetLang, parseInt(e.target.value))}>
                        {[...Array(totalPages || 1)].map((_, i) => (<option key={i + 1} value={i + 1} style={{ backgroundColor: '#1c1f2e', color: '#fff' }}>{i + 1}</option>))}
                      </select>
                      <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.62)' }}>/ {totalPages || 1}</span>
                    </div>
                  </div>
                  <div className="w-100 px-3 mt-1">
                    <input
                      type="range"
                      className="w-100 player-slider"
                      min="0"
                      max="100"
                      step="0.1"
                      value={previewProgress !== null ? previewProgress : getProgress()}
                      onMouseDown={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }}
                      onTouchStart={() => { setIsSliderSeeking(true); setPreviewProgress(getProgress()); }}
                      onMouseUp={commitSliderSeek}
                      onTouchEnd={commitSliderSeek}
                      onChange={(e) => {
                        const nextValue = parseFloat(e.target.value);
                        if (isSliderSeeking) setPreviewProgress(nextValue);
                        else seekTo(nextValue);
                      }}
                      style={{ cursor: 'pointer', accentColor: '#007bff' }}
                    />
                  </div>
                </Col>
                <Col xs={12} md={5}>
                  <div className="d-flex flex-column align-items-end gap-2 px-2">
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <Dropdown drop="up" style={{ overflow: 'visible' }}>
                        <DropdownToggle variant="outline-light" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-1 player-pill-btn">{playbackRate}x</DropdownToggle>
                        <DropdownMenu style={{ minWidth: '120px', backgroundColor: '#1c1f2e', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                            <button key={rate} onClick={() => changePlaybackRate(rate)} className="dropdown-item w-100 border-0 text-start" style={{ backgroundColor: playbackRate === rate ? '#007bff' : 'transparent', color: '#fff' }}>
                              {rate === 1.0 ? 'Normal (1x)' : `${rate}x`}
                            </button>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                      <Button variant="outline-light" size="sm" className="rounded-pill px-2 player-pill-btn" onClick={() => {
                        if (selectedPdfUrlForTranslate || selectedPdfUrl) {
                          setSelectedPdfUrl(selectedPdfUrlForTranslate || selectedPdfUrl);
                          setSelectedPdfTitle(article?.translations?.[0]?.title || 'PDF');
                          setShowPdfViewer(true);
                        }
                      }}>PDF'i Göster</Button>
                      <Button variant="outline-light" size="sm" className="rounded-pill px-2 player-pill-btn" onClick={() => setShowReadingAssist((prev) => !prev)}>
                        {showReadingAssist ? 'Vurguyu Gizle' : 'Vurguyu Göster'}
                      </Button>
                      <Button variant="outline-danger" size="sm" className="rounded-circle p-1 player-close-btn" onClick={stopTextToSpeech}><BsX size={18} /></Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </div>
      )}

      <style jsx global>{`
        .pulse-animation {
          box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
        }
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
        .player-select option {
          background-color: #1c1f2e !important;
          color: white !important;
        }
        .player-slider {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 5px;
          background: rgba(255,255,255,0.1);
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
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
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
          color: rgba(255,255,255,0.95) !important;
          border: 1px solid rgba(255,255,255,0.16) !important;
          background: rgba(255,255,255,0.07) !important;
          transition: all 0.2s ease;
          text-decoration: none !important;
        }
        .player-main-btn {
          width: 56px !important;
          height: 56px !important;
          background: linear-gradient(135deg, #ffffff 0%, #e9f0ff 100%) !important;
          color: #111b36 !important;
          border: 1px solid rgba(255,255,255,0.85) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.24) !important;
        }
        .player-page-chip {
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          min-width: 84px;
        }
        .player-pill-btn {
          border: 1px solid rgba(255,255,255,0.24) !important;
          background: rgba(255,255,255,0.08) !important;
          color: #f4f7ff !important;
          font-weight: 500;
        }
        .player-close-btn {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,77,77,0.7) !important;
          color: #ff5e5e !important;
          background: rgba(255,77,77,0.08) !important;
        }
      `}</style>
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
            setSelectedPdfUrlForTranslate(null);
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
            Makaleyi hangi dilde okumak istersiniz? Seçtiğiniz dilde çeviri yapılıp sesli okunacaktır.
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
                setSelectedPdfUrlForTranslate(null);
              }
            }}
            disabled={translating}
          >
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

    </Col>
  );
};

export default ArticleDetailPage;

