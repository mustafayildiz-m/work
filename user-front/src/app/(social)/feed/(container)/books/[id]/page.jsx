'use client';

import { useState, useEffect } from 'react';
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
import { getBestVoice, getLanguageCode, waitForVoices } from '@/utils/textToSpeech';

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

  // URL'den dil bilgilerini al
  const languageId = searchParams.get('languageId');
  const languageName = searchParams.get('languageName');
  const languageCode = searchParams.get('languageCode');

  // Dilleri yükle
  const { languages: availableLanguages, loading: languagesLoading } = useLanguages();

  // Safe translation function
  const translate = (key, fallback = '') => {
    if (langLoading) return fallback;
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };


  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/books/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

  // Sesli okuma fonksiyonu - Translation içeriğinden
  const handleTextToSpeech = async (translation, translationIndex) => {
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

    // Translation içeriğini kullan
    const textToRead = [];
    if (translation?.description) {
      textToRead.push(translation.description);
    }
    if (translation?.summary) {
      textToRead.push(translation.summary);
    }
    const fullText = textToRead.join('. ');

    if (!fullText || fullText.trim().length === 0) {
      showNotification({
        title: 'Uyarı',
        message: 'Okunacak içerik bulunamadı',
        variant: 'warning'
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(fullText);

    // Dil ayarı
    const lang = translation.language?.code || languageCode || 'tr';
    let langCode = 'tr-TR';
    if (lang === 'tr') {
      langCode = 'tr-TR';
    } else if (lang === 'en') {
      langCode = 'en-US';
    } else if (lang === 'ar' || lang?.toLowerCase().includes('arabic')) {
      langCode = 'ar-SA'; // Arapça için Suudi Arabistan
    } else {
      langCode = 'tr-TR'; // Varsayılan
    }
    utterance.lang = langCode;

    // Arapça için ses seçimi
    if (lang === 'ar' || lang?.toLowerCase().includes('arabic') || langCode.startsWith('ar')) {
      // Mevcut sesleri al ve Arapça için ses seç
      const voices = window.speechSynthesis.getVoices();

      // Arapça sesleri filtrele
      const arabicVoices = voices.filter(voice =>
        voice.lang.startsWith('ar')
      );

      if (arabicVoices.length > 0) {
        // Tercih edilen Arapça sesler
        const preferredVoices = [
          'Google العربية',
          'Microsoft Naayf - Arabic (Saudi Arabia)',
          'ar-SA',
          'ar-EG',
          'ar'
        ];

        let selectedVoice = null;
        for (const preferredName of preferredVoices) {
          selectedVoice = arabicVoices.find(voice =>
            voice.name.includes(preferredName) || voice.lang === preferredName
          );
          if (selectedVoice) break;
        }

        // Eğer tercih edilen ses bulunamazsa, ilk Arapça sesini seç
        if (!selectedVoice && arabicVoices.length > 0) {
          selectedVoice = arabicVoices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Arapça ses bulunamadıysa uyarı göster ve çık
        showNotification({
          title: 'Uyarı',
          message: 'Arapça ses desteği bulunamadı. Tarayıcınız Arapça sesli okuma özelliğini desteklemiyor olabilir.',
          variant: 'warning'
        });
        return;
      }

      // Arapça için optimize edilmiş ayarlar
      utterance.rate = 0.9; // Biraz daha yavaş, daha net
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }
    // İngilizce için daha iyi ses seçimi
    else if (lang === 'en' || langCode === 'en-US') {
      // Mevcut sesleri al ve İngilizce için en iyi sesi seç
      const voices = window.speechSynthesis.getVoices();

      // İngilizce için tercih edilen sesler (sırayla)
      const preferredVoices = [
        'Google UK English Female',
        'Google US English Female',
        'Microsoft Zira - English (United States)',
        'Samantha',
        'Alex',
        'Karen',
        'Victoria',
        'en-US'
      ];

      // İngilizce sesleri filtrele
      const englishVoices = voices.filter(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Alex') || voice.name.includes('Karen') || voice.name.includes('Victoria'))
      );

      // Tercih edilen sesi bul
      let selectedVoice = null;
      for (const preferredName of preferredVoices) {
        selectedVoice = englishVoices.find(voice => voice.name.includes(preferredName));
        if (selectedVoice) break;
      }

      // Eğer tercih edilen ses bulunamazsa, ilk İngilizce kadın sesini seç
      if (!selectedVoice && englishVoices.length > 0) {
        selectedVoice = englishVoices.find(voice => voice.name.includes('Female')) || englishVoices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // İngilizce için optimize edilmiş ayarlar
      utterance.rate = 0.95; // Biraz daha yavaş, daha net
      utterance.pitch = 0.9; // Biraz daha düşük ton, daha doğal
      utterance.volume = 1.0;
    } else {
      // Türkçe ve diğer diller için ayarlar
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    // Seslerin yüklendiğinden emin ol
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
      setIsPaused(false);
      setReadingTranslationId(translationIndex);
      setSpeechSynthesis(window.speechSynthesis);
      setCurrentUtterance(utterance);
      setCurrentText(fullText);
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Sesli Okuma Başladı',
        message: 'Kitap sesli olarak okunuyor...',
        variant: 'info'
      });
    };

    // İlerleme takibi için boundary event
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setReadingTranslationId(null);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Sesli Okuma Tamamlandı',
        message: 'Kitap okunması tamamlandı',
        variant: 'success'
      });
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsReading(false);
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

  // Backend'den metni çevir
  const translateText = async (text, targetLangCode, sourceLangCode = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch(`${API_BASE_URL}/translation/translate`, {
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

  // Seçilen dilde çeviri yap ve sesli oku
  const handleTranslateAndRead = async (targetLanguage) => {
    if (!selectedTranslationForTranslate) {
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
      // Önceki okumayı durdur
      if (speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      let fullText = '';

      // PDF'den text çıkar veya translation içeriğini kullan
      if (selectedPdfUrlForTranslate) {
        showNotification({
          title: 'Bilgi',
          message: 'PDF içeriği çıkarılıyor...',
          variant: 'info'
        });
        const pdfText = await extractTextFromPdf(selectedPdfUrlForTranslate);
        if (pdfText) {
          fullText = pdfText;
        } else {
          // PDF'den text çıkarılamazsa translation içeriğini kullan
          const textToRead = [];
          if (selectedTranslationForTranslate?.description) {
            textToRead.push(selectedTranslationForTranslate.description);
          }
          if (selectedTranslationForTranslate?.summary) {
            textToRead.push(selectedTranslationForTranslate.summary);
          }
          fullText = textToRead.join('. ');
        }
      } else {
        // PDF yoksa translation içeriğini kullan
        const textToRead = [];
        if (selectedTranslationForTranslate?.description) {
          textToRead.push(selectedTranslationForTranslate.description);
        }
        if (selectedTranslationForTranslate?.summary) {
          textToRead.push(selectedTranslationForTranslate.summary);
        }
        fullText = textToRead.join('. ');
      }

      if (!fullText || fullText.trim().length === 0) {
        showNotification({
          title: 'Uyarı',
          message: 'Okunacak içerik bulunamadı',
          variant: 'warning'
        });
        setTranslating(false);
        return;
      }

      // Seslerin yüklenmesini bekle
      await waitForVoices();

      // Kaynak dil kodunu belirle
      const sourceLangCode = selectedTranslationForTranslate.language?.code || null;

      showNotification({
        title: 'Bilgi',
        message: `Metin ${targetLanguage.name} diline çevriliyor...`,
        variant: 'info'
      });

      // Metni çevir
      const translatedText = await translateText(fullText, targetLanguage.code, sourceLangCode);

      if (!translatedText || translatedText.trim().length === 0) {
        showNotification({
          title: 'Hata',
          message: 'Çeviri başarısız oldu',
          variant: 'danger'
        });
        setTranslating(false);
        return;
      }

      // En iyi sesi seç (kaliteli sesler için)
      const getBestVoice = (langCode) => {
        const voices = window.speechSynthesis.getVoices();

        // Dil kodunu normalize et
        const normalizedLang = langCode.toLowerCase();

        // Öncelik sırası:
        // 1. Google ile başlayan sesler (genellikle en iyi kalite)
        // 2. Premium/Enhanced sesler
        // 3. Yerel (local) sesler
        // 4. Remote sesler

        // Dille eşleşen tüm sesleri bul
        const matchingVoices = voices.filter(voice =>
          voice.lang.toLowerCase().includes(normalizedLang.split('-')[0])
        );

        if (matchingVoices.length === 0) {
          return null;
        }

        // Google sesleri (en iyi kalite)
        const googleVoice = matchingVoices.find(voice =>
          voice.name.toLowerCase().includes('google')
        );
        if (googleVoice) {
          console.log('Selected Google voice:', googleVoice.name);
          return googleVoice;
        }

        // Premium/Enhanced sesler
        const premiumVoice = matchingVoices.find(voice =>
          voice.name.toLowerCase().includes('premium') ||
          voice.name.toLowerCase().includes('enhanced') ||
          voice.name.toLowerCase().includes('natural')
        );
        if (premiumVoice) {
          console.log('Selected premium voice:', premiumVoice.name);
          return premiumVoice;
        }

        // Yerel sesler (localService = true)
        const localVoice = matchingVoices.find(voice => voice.localService);
        if (localVoice) {
          console.log('Selected local voice:', localVoice.name);
          return localVoice;
        }

        // En son çare: ilk eşleşen ses
        console.log('Selected default voice:', matchingVoices[0].name);
        return matchingVoices[0];
      };

      // Çevrilen metni sesli oku
      const utterance = new SpeechSynthesisUtterance(translatedText);

      // Dil ayarı - daha spesifik dil kodları
      const lang = targetLanguage.code;
      let langCode = 'tr-TR';
      if (lang === 'tr') {
        langCode = 'tr-TR';
      } else if (lang === 'en') {
        langCode = 'en-US'; // veya 'en-GB' İngiliz aksanı için
      } else if (lang === 'ar' || lang?.toLowerCase().includes('arabic')) {
        langCode = 'ar-SA';
      } else if (lang === 'de') {
        langCode = 'de-DE';
      } else if (lang === 'fr') {
        langCode = 'fr-FR';
      } else if (lang === 'es') {
        langCode = 'es-ES';
      } else if (lang === 'it') {
        langCode = 'it-IT';
      } else if (lang === 'ru') {
        langCode = 'ru-RU';
      } else if (lang === 'zh') {
        langCode = 'zh-CN';
      } else if (lang === 'ja') {
        langCode = 'ja-JP';
      } else if (lang === 'ko') {
        langCode = 'ko-KR';
      } else if (lang === 'pt') {
        langCode = 'pt-BR';
      } else if (lang === 'nl') {
        langCode = 'nl-NL';
      } else if (lang === 'pl') {
        langCode = 'pl-PL';
      } else if (lang === 'sv') {
        langCode = 'sv-SE';
      } else if (lang === 'hi') {
        langCode = 'hi-IN';
      } else {
        langCode = `${lang}-${lang.toUpperCase()}`;
      }

      utterance.lang = langCode;
      utterance.rate = playbackRate;
      utterance.pitch = 1.0; // Doğal ton
      utterance.volume = 1.0;

      // Ses seçimi - optimize edilmiş
      const speakWithVoice = () => {
        const bestVoice = getBestVoice(langCode);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        window.speechSynthesis.speak(utterance);
      };

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
        setIsPaused(false);
        setTranslating(false);
        setReadingTranslationId(selectedTranslationIndexForTranslate);
        setSpeechSynthesis(window.speechSynthesis);
        setCurrentUtterance(utterance);
        setCurrentText(translatedText);
        setCurrentCharIndex(0);
        setElapsedTime(0);
        showNotification({
          title: 'Sesli Okuma Başladı',
          message: `Kitap ${targetLanguage.name} dilinde okunuyor...`,
          variant: 'success'
        });
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          setCurrentCharIndex(event.charIndex);
        }
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
          title: 'Sesli Okuma Tamamlandı',
          message: 'Kitap okunması tamamlandı',
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
        setCurrentText('');
        setCurrentCharIndex(0);
        setElapsedTime(0);
        showNotification({
          title: 'Hata',
          message: 'Sesli okuma sırasında bir hata oluştu',
          variant: 'danger'
        });
      };

    } catch (error) {
      console.error('Translate and read error:', error);
      setTranslating(false);
      showNotification({
        title: 'Hata',
        message: error.message || 'Çeviri veya sesli okuma sırasında bir hata oluştu',
        variant: 'danger'
      });
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setReadingTranslationId(null);
      setSpeechSynthesis(null);
      setCurrentUtterance(null);
      setCurrentText('');
      setCurrentCharIndex(0);
      setElapsedTime(0);
      showNotification({
        title: 'Sesli Okuma Durduruldu',
        message: 'Kitap okunması durduruldu',
        variant: 'info'
      });
    }
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

  // Component unmount olduğunda sesli okumayı durdur
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
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
          <p className="mt-3">{t('books.detail.loadingBook')}</p>
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
                    {languageName ? `${t(`books.languages.${languageName}`)} ${t('books.detail.backToLanguageBooks')}` : t('books.detail.backToList')}
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
                            {/* Sesli Okuma Butonları - Her zaman göster */}
                            <>
                              {!isReading || readingTranslationId !== index ? (
                                <>
                                  {(translation.description || translation.summary) && (
                                    <Button
                                      variant="info"
                                      size="sm"
                                      onClick={() => handleTextToSpeech(translation, index)}
                                      className="d-flex align-items-center me-2"
                                    >
                                      <BsVolumeUp className="me-1" />
                                      Sesli Oku
                                    </Button>
                                  )}
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
                                </>
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
                                        disabled={!currentUtterance}
                                        title="10 saniye geri"
                                      >
                                        <BsSkipBackward size={14} />
                                      </Button>
                                      <Button
                                        variant={isPaused ? "success" : "warning"}
                                        size="sm"
                                        onClick={pauseResumeTextToSpeech}
                                        disabled={!currentUtterance}
                                        style={{ minWidth: '50px' }}
                                      >
                                        {isPaused ? <BsPlay size={16} /> : <BsPause size={16} />}
                                      </Button>
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={forwardTextToSpeech}
                                        disabled={!currentUtterance}
                                        title="10 saniye ileri"
                                      >
                                        <BsSkipForward size={14} />
                                      </Button>
                                      <div className="mx-2" style={{ borderLeft: '1px solid #dee2e6', height: '25px' }}></div>
                                      <div className="d-flex align-items-center gap-1">
                                        <span className="small text-muted">Hız:</span>
                                        <Button
                                          variant={playbackRate === 0.75 ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="px-2 py-1"
                                          onClick={() => changePlaybackRate(0.75)}
                                          disabled={!currentUtterance}
                                          style={{ fontSize: '0.75rem' }}
                                        >
                                          0.75x
                                        </Button>
                                        <Button
                                          variant={playbackRate === 1.0 ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="px-2 py-1"
                                          onClick={() => changePlaybackRate(1.0)}
                                          disabled={!currentUtterance}
                                          style={{ fontSize: '0.75rem' }}
                                        >
                                          1x
                                        </Button>
                                        <Button
                                          variant={playbackRate === 1.25 ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="px-2 py-1"
                                          onClick={() => changePlaybackRate(1.25)}
                                          disabled={!currentUtterance}
                                          style={{ fontSize: '0.75rem' }}
                                        >
                                          1.25x
                                        </Button>
                                        <Button
                                          variant={playbackRate === 1.5 ? "primary" : "outline-primary"}
                                          size="sm"
                                          className="px-2 py-1"
                                          onClick={() => changePlaybackRate(1.5)}
                                          disabled={!currentUtterance}
                                          style={{ fontSize: '0.75rem' }}
                                        >
                                          1.5x
                                        </Button>
                                      </div>
                                      <div className="mx-2" style={{ borderLeft: '1px solid #dee2e6', height: '25px' }}></div>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={stopTextToSpeech}
                                        disabled={!currentUtterance}
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
    </Col>
  );
};

export default BookDetailPage;
