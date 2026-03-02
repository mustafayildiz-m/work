'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Badge, Spinner, Alert, Modal, ProgressBar } from 'react-bootstrap';
import { BsDownload, BsCalendar, BsPerson, BsBook, BsArrowLeft, BsEyeFill, BsShare, BsWhatsapp, BsNewspaper, BsThreeDotsVertical, BsGrid3X3, BsX, BsVolumeUp, BsTranslate, BsPause, BsPlay, BsSkipBackward, BsSkipForward } from 'react-icons/bs';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import PdfViewer from '@/components/PdfViewer';
import { generateBookUrl } from '@/utils/bookEncoder';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLanguages } from '@/hooks/useLanguages';
import { pdfjs } from 'react-pdf';
import styles from './styles.module.css';
import { getLanguageCode, cleanTextForTTS, fetchTTSAudio } from '@/utils/textToSpeech';

// PDF.js worker'ı yapılandır
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const BookDetailPage = () => {
  const { t, loading: langLoading, locale } = useLanguage();
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
  const isReadingRef = useRef(false);

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

  // Mevcut audio objesini temizle
  const disposeCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
  };

  // Sesli okumayı duraklat/devam ettir
  const pauseResumeTextToSpeech = () => {
    const audio = currentAudioRef.current;
    if (!audio) return;
    if (isPaused) {
      audio.play();
      setIsPaused(false);
    } else {
      audio.pause();
      setIsPaused(true);
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
        // Audio progress güncelle
        if (currentAudioRef.current && currentAudioRef.current.duration) {
          const pct = (currentAudioRef.current.currentTime / currentAudioRef.current.duration) * 100;
          setAudioProgress(Math.min(100, pct));
        }
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

    // Önceki audio'yu durdur
    disposeCurrentAudio();
    isReadingRef.current = false;

    setTranslating(true);
    setShowLanguageModal(false);
    setElapsedTime(0);
    setAudioProgress(0);

    try {
      let activePdfDoc = pdfDoc;
      let activeTotalPages = totalPages;

      if (selectedPdfUrlForTranslate && !activePdfDoc) {
        showNotification({ title: 'Bilgi', message: 'Kitap hazırlanıyor...', variant: 'info' });
        const loadingTask = pdfjs.getDocument({ url: selectedPdfUrlForTranslate, withCredentials: false });
        activePdfDoc = await loadingTask.promise;
        setPdfDoc(activePdfDoc);
        setTotalPages(activePdfDoc.numPages);
        activeTotalPages = activePdfDoc.numPages;
      }

      setTargetLang(targetLanguage);

      const playPage = async (pageNum) => {
        if (!isReadingRef.current && pageNum !== startPage) return;

        if (activePdfDoc && pageNum > activeTotalPages) {
          setIsReading(false);
          isReadingRef.current = false;
          setTranslating(false);
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

          if (!translatedText.trim()) {
            if (activePdfDoc && pageNum < activeTotalPages) return playPage(pageNum + 1);
            setTranslating(false);
            return;
          }

          // Backend Google TTS'den MP3 al
          const token = localStorage.getItem('token');
          const audioBlob = await fetchTTSAudio(translatedText, targetLanguage.code, API_BASE_URL, token);
          const audioUrl = URL.createObjectURL(audioBlob);

          setTranslating(false);
          disposeCurrentAudio();

          if (!isReadingRef.current && pageNum !== startPage) {
            URL.revokeObjectURL(audioUrl);
            return;
          }

          const audio = new Audio(audioUrl);
          audio.playbackRate = playbackRate || 1.0;
          currentAudioRef.current = audio;

          audio.onplay = () => { setIsReading(true); isReadingRef.current = true; setIsPaused(false); };
          audio.ontimeupdate = () => {
            if (audio.duration) setAudioProgress((audio.currentTime / audio.duration) * 100);
          };
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (isReadingRef.current && activePdfDoc && pageNum < activeTotalPages) {
              playPage(pageNum + 1);
            } else {
              setIsReading(false);
              isReadingRef.current = false;
              setAudioProgress(0);
            }
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            setIsReading(false);
            isReadingRef.current = false;
            showNotification({ title: 'Hata', message: 'Ses oynatılamadı.', variant: 'danger' });
          };

          isReadingRef.current = true;
          await audio.play();

        } catch (err) {
          console.error(`Page ${pageNum} error:`, err);
          let message = err.message || 'Bir hata oluştu';
          if (message.includes('PDF_CONTENT_INVALID')) {
            message = translate('books.detail.pdfContentInvalid', 'Bu PDF çeviri için uygun değil.');
          }
          setTranslating(false);
          setIsReading(false);
          isReadingRef.current = false;
          showNotification({ title: 'Hata', message, variant: 'danger' });
        }
      };

      isReadingRef.current = true;
      playPage(startPage);

    } catch (error) {
      console.error('General read error:', error);
      setTranslating(false);
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
    disposeCurrentAudio();
    setIsReading(false);
    setIsPaused(false);
    setReadingTranslationId(null);
    setElapsedTime(0);
    setAudioProgress(0);
    showNotification({ title: 'Sesli Okuma Durduruldu', message: 'Kitap okunması durduruldu', variant: 'info' });
  };

  // Zamanı formatla (saniye -> mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => audioProgress;

  // Progress bar'a tıklayarak konuma atla
  const seekTo = (percent) => {
    const audio = currentAudioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setAudioProgress(percent);
  };

  // Component unmount olduğunda audio'yu temizle
  useEffect(() => {
    return () => {
      disposeCurrentAudio();
      isReadingRef.current = false;
    };
  }, []);

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

  // Kitap URL'sini oluştur (encoded)
  const getBookUrl = () => {
    const baseUrl = window.location.origin;
    const currentLang = languageCode || locale || 'tr';

    if (params?.id) {
      return generateBookUrl(params.id, baseUrl, currentLang);
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
      <Card className="mb-4 border-0 shadow-sm">
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
      <Card className="border-0 shadow-sm" style={{ position: 'relative' }}>
        {/* Dropdown Button - Sağ Üst Köşe */}
        <div style={{
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
              className="d-flex align-items-center book-translation-share-toggle"
            >
              <BsShare className="me-1" />
              {t('books.share') || 'Paylaş'}
            </DropdownToggle>
            <DropdownMenu align="end">
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const baseUrl = window.location.origin;
                  const lang = languageCode || 'tr';
                  const bookUrl = generateBookUrl(params.id, baseUrl, lang);
                  navigator.clipboard.writeText(bookUrl);
                  showNotification({
                    title: 'Başarılı',
                    message: 'Kitap linki kopyalandı',
                    variant: 'success'
                  });
                }}
              >
                <BsShare size={16} className="me-2" />
                {t('books.share') || 'Paylaş'}
              </DropdownItem>
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const baseUrl = window.location.origin;
                  const lang = languageCode || 'tr';
                  const bookUrl = generateBookUrl(params.id, baseUrl, lang);
                  const title = book.title || 'Kitap';
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
              className="img-fluid rounded shadow"
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
                                  href={getPdfUrl(translation.pdfUrl)}
                                  target="_blank"
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

                        {/* Sesli Okuma Kontrol Paneli - Sadece bu translation için okuma yapılırken görünür */}
                        {isReading && readingTranslationId === index && (
                          <div className="mt-4 pt-3 border-top">
                            <Card className="border-0 shadow-sm bg-light">
                              <CardBody className="p-3">
                                <Row className="align-items-center">
                                  <Col xs={12} className="mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <div className="d-flex align-items-center gap-2">
                                        <BsVolumeUp size={18} className="text-primary" />
                                        <span className="fw-bold small">Sesli Okuma</span>
                                        {isPaused && <Badge bg="warning" className="small">Duraklatıldı</Badge>}
                                      </div>
                                      <div className="text-muted small">
                                        {formatTime(elapsedTime)}
                                      </div>
                                    </div>
                                    <ProgressBar
                                      now={getProgress()}
                                      variant="primary"
                                      style={{ height: '6px', borderRadius: '3px' }}
                                    />
                                  </Col>
                                  <Col xs={12}>
                                    <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={rewindTextToSpeech}
                                        disabled={!isReading}
                                        title="10 saniye geri"
                                      >
                                        <BsSkipBackward size={14} />
                                      </Button>
                                      <Button
                                        variant={isPaused ? "success" : "warning"}
                                        size="sm"
                                        onClick={pauseResumeTextToSpeech}
                                        disabled={!isReading}
                                        style={{ minWidth: '50px' }}
                                      >
                                        {isPaused ? <BsPlay size={16} /> : <BsPause size={16} />}
                                      </Button>
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={forwardTextToSpeech}
                                        disabled={!isReading}
                                        title="10 saniye ileri"
                                      >
                                        <BsSkipForward size={14} />
                                      </Button>
                                      <div className="mx-2" style={{ borderLeft: '1px solid #dee2e6', height: '25px' }}></div>
                                      <div className="d-flex align-items-center gap-1">
                                        <span className="small text-muted">Hız:</span>
                                        {[0.75, 1.0, 1.25, 1.5].map(rate => (
                                          <Button
                                            key={rate}
                                            variant={playbackRate === rate ? "primary" : "outline-primary"}
                                            size="sm"
                                            className="px-2 py-1"
                                            onClick={() => changePlaybackRate(rate)}
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            {rate}x
                                          </Button>
                                        ))}
                                      </div>
                                      <div className="mx-2" style={{ borderLeft: '1px solid #dee2e6', height: '25px' }}></div>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={stopTextToSpeech}
                                        className="px-2"
                                      >
                                        <BsX size={16} />
                                      </Button>
                                    </div>
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
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
              }
            }}
            disabled={translating}
          >
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modern Floating Audio Player */}
      {(isReading || translating) && (
        <div className="fixed-bottom p-3 d-flex justify-content-center" style={{ zIndex: 1050 }}>
          <Card
            className="border-0 shadow-lg"
            style={{
              width: '100%',
              maxWidth: '800px',
              backgroundColor: '#1c1f2e !important',
              color: '#ffffff !important',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'visible' // Kutunun kesilmesini engeller
            }}
          >
            <CardBody className="p-3" style={{ overflow: 'visible' }}>
              <Row className="align-items-center g-3">
                {/* Book Info & Status */}
                <Col xs={12} md={4}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '45px', height: '45px', animation: isReading && !isPaused ? 'pulse 2s infinite' : 'none', color: '#ffffff !important' }}
                    >
                      <BsVolumeUp size={22} style={{ color: '#ffffff' }} />
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-truncate" style={{ fontSize: '0.95rem', color: '#ffffff !important' }}>{book?.translations?.[0]?.title}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="primary" style={{ fontSize: '0.7rem', color: '#ffffff !important' }}>{targetLang?.name || 'Çeviri'}</Badge>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6) !important' }}>
                          {translating ? 'Hazırlanıyor...' : isPaused ? 'Duraklatıldı' : 'Okunuyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Main Controls */}
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <Button
                      variant="link"
                      className="p-0 opacity-75"
                      style={{ color: '#ffffff !important', border: 'none', boxShadow: 'none' }}
                      disabled={currentPage <= 1 || translating}
                      onClick={() => handleTranslateAndRead(targetLang, currentPage - 1)}
                    >
                      <BsSkipBackward size={20} />
                    </Button>

                    <Button
                      variant="light"
                      className="rounded-circle d-flex align-items-center justify-content-center shadow"
                      style={{ width: '50px', height: '50px', backgroundColor: '#ffffff !important', color: '#1c1f2e !important', border: 'none' }}
                      onClick={pauseResumeTextToSpeech}
                      disabled={translating}
                    >
                      {isPaused ? <BsPlay size={28} /> : <BsPause size={28} />}
                    </Button>

                    <Button
                      variant="link"
                      className="p-0 opacity-75"
                      style={{ color: '#ffffff !important', border: 'none', boxShadow: 'none' }}
                      disabled={currentPage >= totalPages || translating}
                      onClick={() => handleTranslateAndRead(targetLang, currentPage + 1)}
                    >
                      <BsSkipForward size={20} />
                    </Button>
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

                {/* Page Info & Speed */}
                <Col xs={12} md={4}>
                  <div className="d-flex align-items-center justify-content-end gap-3 px-2">
                    <div className="text-end me-2">
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5) !important' }}>SAYFA</div>
                      <div className="d-flex align-items-center gap-1 justify-content-end">
                        <div className="position-relative d-flex align-items-center">
                          <select
                            className="bg-transparent border-0 fw-bold p-0 pe-1 player-select"
                            style={{
                              outline: 'none',
                              cursor: 'pointer',
                              fontSize: '1.25rem',
                              minWidth: '30px',
                              textAlign: 'right',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              color: '#007bff !important'
                            }}
                            value={currentPage}
                            onChange={(e) => {
                              const newPage = parseInt(e.target.value);
                              handleTranslateAndRead(targetLang, newPage);
                            }}
                          >
                            {[...Array(totalPages || 1)].map((_, i) => (
                              <option key={i + 1} value={i + 1} style={{ backgroundColor: '#1c1f2e', color: '#ffffff' }}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6) !important' }}>/ {totalPages || 1}</span>
                      </div>
                    </div>

                    <Dropdown drop="up" style={{ overflow: 'visible' }}>
                      <DropdownToggle
                        variant="outline-light"
                        size="sm"
                        className="rounded-pill px-3 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem', color: '#ffffff !important', borderColor: 'rgba(255,255,255,0.3) !important' }}
                      >
                        {playbackRate}x
                      </DropdownToggle>
                      <DropdownMenu
                        style={{
                          minWidth: '120px',
                          backgroundColor: '#1c1f2e !important',
                          border: '1px solid rgba(255,255,255,0.2) !important',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5) !important',
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
                              backgroundColor: playbackRate === rate ? '#007bff !important' : 'transparent',
                              color: '#ffffff !important',
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
                      variant="outline-danger"
                      size="sm"
                      className="rounded-circle p-1"
                      style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}
                      onClick={stopTextToSpeech}
                      title="Kapat"
                    >
                      <BsX size={18} />
                    </Button>
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
    </Col>
  );
};

export default BookDetailPage;
