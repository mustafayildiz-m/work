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
import { getBestVoice, getLanguageCode, waitForVoices } from '@/utils/textToSpeech';

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
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedTranslationForTranslate, setSelectedTranslationForTranslate] = useState(null);
  const [selectedTranslationIndexForTranslate, setSelectedTranslationIndexForTranslate] = useState(null);
  const [selectedPdfUrlForTranslate, setSelectedPdfUrlForTranslate] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [targetLang, setTargetLang] = useState(null);
  const isReadingRef = useRef(false);
  const [pdfDoc, setPdfDoc] = useState(null);

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

  // Sesli okuma fonksiyonu - PDF'den veya translation'dan
  const handleTextToSpeech = async (translation, translationIndex, pdfUrl = null) => {
    if (!('speechSynthesis' in window)) {
      showNotification({
        title: 'Uyarı',
        message: 'Tarayıcınız sesli okuma özelliğini desteklemiyor',
        variant: 'warning'
      });
      return;
    }

    // Önceki okumayı durdur
    if (speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    let fullText = '';

    // Eğer PDF URL'i varsa, PDF'den text çıkar
    if (pdfUrl) {
      const pdfText = await extractTextFromPdf(pdfUrl);
      if (pdfText) {
        fullText = pdfText;
      } else {
        // PDF'den text çıkarılamazsa translation içeriğini kullan
        const textToRead = [];
        if (translation?.summary) {
          textToRead.push(translation.summary);
        }
        if (translation?.content) {
          textToRead.push(translation.content);
        }
        fullText = textToRead.join('. ');
      }
    } else {
      // PDF yoksa translation içeriğini kullan
      const textToRead = [];
      if (translation?.summary) {
        textToRead.push(translation.summary);
      }
      if (translation?.content) {
        textToRead.push(translation.content);
      }
      fullText = textToRead.join('. ');
    }

    if (!fullText || fullText.trim().length === 0) {
      showNotification({
        title: 'Uyarı',
        message: 'Okunacak içerik bulunamadı',
        variant: 'warning'
      });
      return;
    }

    // Seslerin yüklenmesini bekle
    await waitForVoices();

    // Dil kodunu al
    const lang = translation.language?.code || languageCode || 'tr';
    const langCode = getLanguageCode(lang);

    // Utterance oluştur
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = langCode;
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // En iyi sesi seç
    const bestVoice = getBestVoice(langCode);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Sesleri speak et
    const speakWithVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      // Arapça için ses seçimi (eğer henüz seçilmediyse)
      if ((lang === 'ar' || lang?.toLowerCase().includes('arabic') || langCode.startsWith('ar')) && !utterance.voice) {
        const arabicVoices = voices.filter(voice => voice.lang.startsWith('ar'));

        if (arabicVoices.length > 0) {
          const preferredVoices = [
            'Google العربية',
            'Microsoft Naayf - Arabic (Saudi Arabia)',
            'ar-SA',
            'ar-EG'
          ];

          let selectedVoice = null;
          for (const preferredName of preferredVoices) {
            selectedVoice = arabicVoices.find(voice =>
              voice.name.includes(preferredName) || voice.lang === preferredName
            );
            if (selectedVoice) break;
          }

          if (!selectedVoice && arabicVoices.length > 0) {
            selectedVoice = arabicVoices[0];
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        } else {
          // Arapça ses bulunamadıysa uyarı göster
          showNotification({
            title: 'Uyarı',
            message: 'Arapça ses desteği bulunamadı. Tarayıcınız Arapça sesli okuma özelliğini desteklemiyor olabilir.',
            variant: 'warning'
          });
          return;
        }
      }
      // İngilizce için ses seçimi (eğer henüz seçilmediyse)
      else if ((lang === 'en' || langCode === 'en-US') && !utterance.voice) {
        const englishVoices = voices.filter(voice =>
          voice.lang.startsWith('en') &&
          (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Alex') || voice.name.includes('Karen') || voice.name.includes('Victoria'))
        );

        if (englishVoices.length > 0) {
          const preferredVoices = [
            'Google UK English Female',
            'Google US English Female',
            'Microsoft Zira - English (United States)',
            'Samantha',
            'Alex',
            'Karen',
            'Victoria'
          ];

          let selectedVoice = null;
          for (const preferredName of preferredVoices) {
            selectedVoice = englishVoices.find(voice => voice.name.includes(preferredName));
            if (selectedVoice) break;
          }

          if (!selectedVoice && englishVoices.length > 0) {
            selectedVoice = englishVoices.find(voice => voice.name.includes('Female')) || englishVoices[0];
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
      }

      window.speechSynthesis.speak(utterance);
    };

    // Sesler yüklüyse direkt başlat, değilse bekle
    if (window.speechSynthesis.getVoices().length > 0) {
      speakWithVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    utterance.onstart = () => {
      setIsReading(true);
      isReadingRef.current = true;
      setIsPaused(false);
      setReadingTranslationId(translationIndex);
      setSpeechSynthesis(window.speechSynthesis);
      setCurrentUtterance(utterance);
      setCurrentText(fullText);
      setCurrentCharIndex(0);
      setElapsedTime(0);
    };

    // İlerleme takibi için boundary event
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsReading(false);
      isReadingRef.current = false;
      setIsPaused(false);
      setReadingTranslationId(null);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Sesli Okuma Tamamlandı',
        message: 'Makale okunması tamamlandı',
        variant: 'success'
      });
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsReading(false);
      isReadingRef.current = false;
      setIsPaused(false);
      setReadingTranslationId(null);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Hata',
        message: 'Sesli okuma sırasında bir hata oluştu',
        variant: 'danger'
      });
    };
  };

  // Sesli okumayı duraklat/devam ettir
  const pauseResumeTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      showNotification({
        title: 'Devam Ediyor',
        message: 'Sesli okuma devam ediyor...',
        variant: 'info'
      });
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      showNotification({
        title: 'Duraklatıldı',
        message: 'Sesli okuma duraklatıldı',
        variant: 'info'
      });
    }
  };

  // Geri al (10 saniye)
  const rewindTextToSpeech = () => {
    if (!currentUtterance || !currentText) return;

    const currentIndex = currentCharIndex;
    const rewindChars = Math.floor((currentUtterance.rate || 1.0) * 10 * 10); // ~10 saniye geri
    const newIndex = Math.max(0, currentIndex - rewindChars);

    // Yeni utterance oluştur
    const remainingText = currentText.substring(newIndex);
    const newUtterance = new SpeechSynthesisUtterance(remainingText);

    // Ayarları kopyala
    newUtterance.lang = currentUtterance.lang;
    newUtterance.rate = currentUtterance.rate;
    newUtterance.pitch = currentUtterance.pitch;
    newUtterance.volume = currentUtterance.volume;
    newUtterance.voice = currentUtterance.voice;

    // Mevcut okumayı durdur
    window.speechSynthesis.cancel();

    // Event listener'ları ekle
    newUtterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    newUtterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(newIndex + event.charIndex);
      }
    };

    newUtterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    newUtterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    // Yeni utterance'ı başlat
    window.speechSynthesis.speak(newUtterance);
    setCurrentUtterance(newUtterance);
    setCurrentCharIndex(newIndex);

    showNotification({
      title: 'Geri Alındı',
      message: '10 saniye geri alındı',
      variant: 'info'
    });
  };

  // İleri al (10 saniye)
  const forwardTextToSpeech = () => {
    if (!currentUtterance || !currentText) return;

    const currentIndex = currentCharIndex;
    const forwardChars = Math.floor((currentUtterance.rate || 1.0) * 10 * 10); // ~10 saniye ileri
    const newIndex = Math.min(currentText.length, currentIndex + forwardChars);

    // Yeni utterance oluştur
    const remainingText = currentText.substring(newIndex);
    const newUtterance = new SpeechSynthesisUtterance(remainingText);

    // Ayarları kopyala
    newUtterance.lang = currentUtterance.lang;
    newUtterance.rate = currentUtterance.rate;
    newUtterance.pitch = currentUtterance.pitch;
    newUtterance.volume = currentUtterance.volume;
    newUtterance.voice = currentUtterance.voice;

    // Mevcut okumayı durdur
    window.speechSynthesis.cancel();

    // Event listener'ları ekle
    newUtterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    newUtterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(newIndex + event.charIndex);
      }
    };

    newUtterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    newUtterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    // Yeni utterance'ı başlat
    window.speechSynthesis.speak(newUtterance);
    setCurrentUtterance(newUtterance);
    setCurrentCharIndex(newIndex);

    showNotification({
      title: 'İleri Alındı',
      message: '10 saniye ileri alındı',
      variant: 'info'
    });
  };

  // İlerleme çubuğuna tıklayarak ileri/geri al
  const seekTo = (percent) => {
    if (!currentUtterance || !currentText) return;

    const newIndex = Math.floor((percent / 100) * currentText.length);
    const remainingText = currentText.substring(newIndex);

    const newUtterance = new SpeechSynthesisUtterance(remainingText);
    newUtterance.lang = currentUtterance.lang;
    newUtterance.rate = playbackRate || 1.0;
    newUtterance.voice = currentUtterance.voice;

    window.speechSynthesis.cancel();

    newUtterance.onstart = () => {
      setIsReading(true);
      isReadingRef.current = true;
      setIsPaused(false);
      setCurrentUtterance(newUtterance);
    };

    newUtterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(newIndex + event.charIndex);
      }
    };

    newUtterance.onend = () => {
      if (isReadingRef.current && pdfDoc && currentPage < totalPages) {
        handleTranslateAndRead(targetLang, currentPage + 1);
      } else {
        setIsReading(false);
        isReadingRef.current = false;
      }
    };

    window.speechSynthesis.speak(newUtterance);
    setCurrentCharIndex(newIndex);
  };

  // Hızı değiştir
  const changePlaybackRate = (newRate) => {
    if (!currentUtterance) return;

    const currentIndex = currentCharIndex;
    const remainingText = currentText.substring(currentIndex);
    const newUtterance = new SpeechSynthesisUtterance(remainingText);

    newUtterance.lang = currentUtterance.lang;
    newUtterance.rate = newRate;
    newUtterance.pitch = currentUtterance.pitch;
    newUtterance.volume = currentUtterance.volume;
    newUtterance.voice = currentUtterance.voice;

    // Event listener'ları ekle
    newUtterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    newUtterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(currentIndex + event.charIndex);
      }
    };

    newUtterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    newUtterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(newUtterance);
    setCurrentUtterance(newUtterance);
    setPlaybackRate(newRate);
  };

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

    if (!('speechSynthesis' in window)) {
      showNotification({ title: 'Uyarı', message: 'Tarayıcı desteği yok', variant: 'warning' });
      return;
    }

    setTranslating(true);
    setShowLanguageModal(false);

    try {
      window.speechSynthesis.cancel();

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

      await waitForVoices();
      setTargetLang(targetLanguage);

      const playPage = async (pageNum) => {
        if (pageNum > activeTotalPages) {
          setIsReading(false);
          isReadingRef.current = false;
          setTranslating(false);
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

          const translatedText = await translateText(
            textToTranslate,
            targetLanguage.code,
            null,
            pageNum,
            params.id
          );

          setTranslating(false);

          const utterance = new SpeechSynthesisUtterance(translatedText);
          const langCode = getLanguageCode(targetLanguage.code);
          utterance.lang = langCode;
          utterance.rate = playbackRate || 1.0;

          const bestVoice = getBestVoice(langCode);
          if (bestVoice) utterance.voice = bestVoice;

          utterance.onstart = () => {
            setIsReading(true);
            isReadingRef.current = true;
            setIsPaused(false);
            setSpeechSynthesis(window.speechSynthesis);
            setCurrentUtterance(utterance);
            setCurrentText(translatedText);
            setCurrentCharIndex(0);
          };

          utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
              setCurrentCharIndex(event.charIndex);
            }
          };

          utterance.onend = () => {
            if (isReadingRef.current && pageNum < activeTotalPages) {
              playPage(pageNum + 1);
            } else {
              setIsReading(false);
              isReadingRef.current = false;
            }
          };

          utterance.onerror = (err) => {
            console.error('TTS Error:', err);
            setIsReading(false);
            isReadingRef.current = false;
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error(`Page ${pageNum} error:`, err);
          setTranslating(false);
          setIsReading(false);
          isReadingRef.current = false;
        }
      };

      playPage(startPage);

    } catch (error) {
      console.error('Play error:', error);
      setTranslating(false);
      showNotification({ title: 'Hata', message: 'Bir sorun oluştu', variant: 'danger' });
    }
  };

  const stopTextToSpeech = () => {
    if (window.speechSynthesis) {
      isReadingRef.current = false;
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setReadingTranslationId(null);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
    }
  };

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
                                  href={getPdfUrl(translation.pdfUrl)}
                                  target="_blank"
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

      {/* Floating Audio Player */}
      {isReading && (
        <Col
          xs={12}
          className="fixed-bottom p-3 d-flex justify-content-center"
          style={{ zIndex: 1050, pointerEvents: 'none' }}
        >
          <Card
            className="shadow-lg border-0 rounded-4 overflow-visible"
            style={{
              width: '100%',
              maxWidth: '800px',
              background: '#1c1f2e',
              color: 'white',
              pointerEvents: 'auto',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.3)'
            }}
          >
            <CardBody className="p-3 overflow-visible">
              <Row className="align-items-center g-3">
                {/* Left Controls */}
                <Col xs="auto" className="d-flex align-items-center gap-2">
                  <Button
                    variant="link"
                    className="p-0 text-white opacity-75 hover-opacity-100"
                    onClick={rewindTextToSpeech}
                  >
                    <BsSkipBackward size={22} />
                  </Button>

                  <Button
                    variant="primary"
                    className="rounded-circle d-flex align-items-center justify-content-center pulse-animation"
                    style={{ width: '45px', height: '45px', background: '#007bff', border: 'none' }}
                    onClick={pauseResumeTextToSpeech}
                  >
                    {isPaused ? <BsPlay size={24} /> : <BsPause size={24} />}
                  </Button>

                  <Button
                    variant="link"
                    className="p-0 text-white opacity-75 hover-opacity-100"
                    onClick={forwardTextToSpeech}
                  >
                    <BsSkipForward size={22} />
                  </Button>
                </Col>

                {/* Info & Progress */}
                <Col>
                  <div className="d-flex justify-content-between align-items-end mb-2 px-1">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ minWidth: '80px' }}>
                        <select
                          className="form-select form-select-sm player-select"
                          value={currentPage}
                          onChange={(e) => handleTranslateAndRead(targetLang, parseInt(e.target.value))}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#007bff',
                            fontWeight: 'bold',
                            padding: '2px 8px'
                          }}
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>Sayfa {num}</option>
                          ))}
                        </select>
                      </div>
                      <span className="small text-white-50 text-truncate" style={{ maxWidth: '200px' }}>
                        {article?.translations?.[readingTranslationId]?.title || 'Okunuyor...'}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <Dropdown drop="up" className="overflow-visible">
                        <DropdownToggle
                          variant="link"
                          className="p-0 text-white text-decoration-none small d-flex align-items-center gap-1 opacity-75"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <span style={{ color: '#007bff', fontWeight: 'bold' }}>{playbackRate}x</span>
                        </DropdownToggle>
                        <DropdownMenu
                          variant="dark"
                          style={{
                            background: '#2a2d3e',
                            border: '1px solid rgba(255,255,255,0.1)',
                            minWidth: '80px',
                            zIndex: 2000
                          }}
                        >
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <DropdownItem
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={playbackRate === rate ? 'text-primary fw-bold' : 'text-white'}
                            >
                              {rate}x
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                      <span className="small fw-mono" style={{ color: '#007bff' }}>
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                  </div>

                  <div className="w-100 px-3 mt-1">
                    <input
                      type="range"
                      className="w-100 player-slider"
                      min="0"
                      max="100"
                      step="0.1"
                      value={getProgress()}
                      onChange={(e) => seekTo(parseFloat(e.target.value))}
                      style={{
                        cursor: 'pointer',
                        accentColor: '#007bff'
                      }}
                    />
                  </div>
                </Col>

                {/* Close */}
                <Col xs="auto">
                  <Button
                    variant="link"
                    className="p-0 text-white opacity-50 hover-opacity-100"
                    onClick={stopTextToSpeech}
                  >
                    <BsX size={28} />
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
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
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        {lang.code}
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

      {/* Component unmount cleanup */}
      <CleanupEffect />
    </Col>
  );
};

// Separated cleanup to avoid effect misuse
const CleanupEffect = () => {
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  return null;
};

export default ArticleDetailPage;

