'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { BsBook, BsCalendar, BsPerson, BsDownload, BsArrowLeft, BsEyeFill } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { decodeBookId } from '@/utils/bookEncoder';

// Simple translation system for public pages
const translations = {
  tr: {
    loading: 'Kitap yükleniyor...',
    bookNotFound: 'Kitap Bulunamadı',
    goToHomepage: 'Ana Sayfaya Git',
    islamicWindows: 'Islamic Windows',
    publicBook: 'Genel Kitap',
    joinIslamicWindows: 'Islamic Windows\'a Katıl',
    signUpNow: 'Şimdi Kaydol',
    learnMore: 'Daha Fazla Bilgi',
    author: 'Yazar',
    category: 'Kategori',
    publishedDate: 'Yayın Tarihi',
    notSpecified: 'Belirtilmemiş',
    noDescriptionAvailable: 'Açıklama mevcut değil',
    downloadPdf: 'PDF İndir',
    readOnline: 'Çevrimiçi Oku',
    joinCallToAction: 'Islamic Windows\'a Katıl',
    joinDescription: 'İslami kitapları keşfedin, bilgi edinin ve topluluğumuzun bir parçası olun.',
    footerText: 'Bu genel kitap görünümüdür. Daha fazla içerik görmek ve toplulukla bağlantı kurmak için bize katılın.',
    copyright: '2025 Islamic Windows. Tüm hakları saklıdır.',
    invalidLink: 'Geçersiz kitap linki'
  },
  en: {
    loading: 'Loading book...',
    bookNotFound: 'Book Not Found',
    goToHomepage: 'Go to Homepage',
    islamicWindows: 'Islamic Windows',
    publicBook: 'Public Book',
    joinIslamicWindows: 'Join Islamic Windows',
    signUpNow: 'Sign Up Now',
    learnMore: 'Learn More',
    author: 'Author',
    category: 'Category',
    publishedDate: 'Published Date',
    notSpecified: 'Not specified',
    noDescriptionAvailable: 'No description available',
    downloadPdf: 'Download PDF',
    readOnline: 'Read Online',
    joinCallToAction: 'Join Islamic Windows',
    joinDescription: 'Discover Islamic books, gain knowledge, and be part of our community.',
    footerText: 'This is a public book view. Join us to see more content and connect with the community.',
    copyright: '2025 Islamic Windows. All rights reserved.',
    invalidLink: 'Invalid book link'
  },
  ar: {
    loading: 'جاري تحميل الكتاب...',
    bookNotFound: 'الكتاب غير موجود',
    goToHomepage: 'العودة إلى الصفحة الرئيسية',
    islamicWindows: 'النوافذ الإسلامية',
    publicBook: 'كتاب عام',
    joinIslamicWindows: 'انضم إلى النوافذ الإسلامية',
    signUpNow: 'سجل الآن',
    learnMore: 'اعرف المزيد',
    author: 'المؤلف',
    category: 'الفئة',
    publishedDate: 'تاريخ النشر',
    notSpecified: 'غير محدد',
    noDescriptionAvailable: 'لا يوجد وصف متاح',
    downloadPdf: 'تحميل PDF',
    readOnline: 'قراءة عبر الإنترنت',
    joinCallToAction: 'انضم إلى النوافذ الإسلامية',
    joinDescription: 'اكتشف الكتب الإسلامية، واكتسب المعرفة، وكن جزءاً من مجتمعنا.',
    footerText: 'هذا عرض عام للكتاب. انضم إلينا لرؤية المزيد من المحتوى والتواصل مع المجتمع.',
    copyright: '2025 النوافذ الإسلامية. جميع الحقوق محفوظة.',
    invalidLink: 'رابط كتاب غير صالح'
  },
  de: {
    loading: 'Buch wird geladen...',
    bookNotFound: 'Buch nicht gefunden',
    goToHomepage: 'Zur Startseite',
    islamicWindows: 'Islamic Windows',
    publicBook: 'Öffentliches Buch',
    joinIslamicWindows: 'Islamic Windows beitreten',
    signUpNow: 'Jetzt registrieren',
    learnMore: 'Mehr erfahren',
    author: 'Autor',
    category: 'Kategorie',
    publishedDate: 'Veröffentlichungsdatum',
    notSpecified: 'Nicht angegeben',
    noDescriptionAvailable: 'Keine Beschreibung verfügbar',
    downloadPdf: 'PDF herunterladen',
    readOnline: 'Online lesen',
    joinCallToAction: 'Islamic Windows beitreten',
    joinDescription: 'Entdecken Sie islamische Bücher, gewinnen Sie Wissen und werden Sie Teil unserer Gemeinschaft.',
    footerText: 'Dies ist eine öffentliche Buchansicht. Treten Sie uns bei, um mehr Inhalte zu sehen und sich mit der Community zu verbinden.',
    copyright: '2025 Islamic Windows. Alle Rechte vorbehalten.',
    invalidLink: 'Ungültiger Buch-Link'
  },
  fr: {
    loading: 'Chargement du livre...',
    bookNotFound: 'Livre non trouvé',
    goToHomepage: 'Aller à l\'accueil',
    islamicWindows: 'Islamic Windows',
    publicBook: 'Livre public',
    joinIslamicWindows: 'Rejoindre Islamic Windows',
    signUpNow: 'S\'inscrire maintenant',
    learnMore: 'En savoir plus',
    author: 'Auteur',
    category: 'Catégorie',
    publishedDate: 'Date de publication',
    notSpecified: 'Non spécifié',
    noDescriptionAvailable: 'Aucune description disponible',
    downloadPdf: 'Télécharger PDF',
    readOnline: 'Lire en ligne',
    joinCallToAction: 'Rejoindre Islamic Windows',
    joinDescription: 'Découvrez les livres islamiques, acquérez des connaissances et faites partie de notre communauté.',
    footerText: 'Ceci est une vue de livre public. Rejoignez-nous pour voir plus de contenu et vous connecter avec la communauté.',
    copyright: '2025 Islamic Windows. Tous droits réservés.',
    invalidLink: 'Lien de livre invalide'
  },
  ja: {
    loading: '本を読み込んでいます...',
    bookNotFound: '本が見つかりません',
    goToHomepage: 'ホームページに戻る',
    islamicWindows: 'Islamic Windows',
    publicBook: '公開本',
    joinIslamicWindows: 'Islamic Windowsに参加',
    signUpNow: '今すぐ登録',
    learnMore: '詳しく見る',
    author: '著者',
    category: 'カテゴリー',
    publishedDate: '出版日',
    notSpecified: '未指定',
    noDescriptionAvailable: '説明がありません',
    downloadPdf: 'PDFダウンロード',
    readOnline: 'オンラインで読む',
    joinCallToAction: 'Islamic Windowsに参加',
    joinDescription: 'イスラムの本を発見し、知識を得て、コミュニティの一員になりましょう。',
    footerText: 'これは公開本表示です。参加してより多くのコンテンツを見て、コミュニティとつながりましょう。',
    copyright: '2025 Islamic Windows. 全著作権所有。',
    invalidLink: '無効な本のリンク'
  }
};

const PublicBookPage = () => {
  const params = useParams();
  const { hash } = params;

  const [bookData, setBookData] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('tr');

  const t = (key) => translations[language][key] || key;

  // URL'den dil parametresini al
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && ['tr', 'en', 'ar', 'de', 'fr', 'ja'].includes(langParam)) {
        setLanguage(langParam);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Decode hash to get bookId and lang
        const decoded = decodeBookId(hash);

        if (!decoded) {
          setError(t('invalidLink'));
          setLoading(false);
          return;
        }

        const { bookId, lang } = decoded;
        setBookInfo({ bookId, lang });

        // Fetch book data from API
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/public/books/${bookId}${lang ? `?lang=${lang}` : ''}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookData(data);
        } else if (response.status === 404) {
          setError(t('bookNotFound'));
        } else {
          setError('Failed to load book');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchBookData();
    }
  }, [hash]);

  const getImageUrl = (coverUrl) => {
    if (!coverUrl) return '/images/book-placeholder.jpg';
    if (coverUrl.startsWith('/uploads/') || coverUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const normalizedPath = coverUrl.startsWith('/') ? coverUrl : `/${coverUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return coverUrl;
  };

  const getBookTitle = () => {
    if (!bookData) return '';
    return bookData.title || bookData.name || 'Untitled Book';
  };

  const getBookAuthor = () => {
    if (!bookData) return t('notSpecified');
    return bookData.author || bookData.authorName || t('notSpecified');
  };

  const getBookDescription = () => {
    if (!bookData) return t('noDescriptionAvailable');
    return bookData.description || bookData.summary || t('noDescriptionAvailable');
  };

  const getBookCategory = () => {
    if (!bookData) return t('notSpecified');
    return bookData.category || bookData.categoryName || t('notSpecified');
  };

  const getPublishDate = () => {
    if (!bookData) return t('notSpecified');
    return bookData.publishDate || bookData.createdAt || t('notSpecified');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('notSpecified');

    try {
      const date = new Date(dateString);
      const localeMap = {
        tr: 'tr-TR',
        en: 'en-US',
        ar: 'ar-SA',
        de: 'de-DE',
        fr: 'fr-FR',
        ja: 'ja-JP'
      };
      const locale = localeMap[language] || 'tr-TR';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">{t('loading')}</span>
          </Spinner>
          <p className="text-muted">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="danger" className="text-center">
                <h4>{t('bookNotFound')}</h4>
                <p className="mb-3">{error}</p>
                <Link href="/" className="btn btn-primary">
                  <FaArrowLeft className="me-2" />
                  {t('goToHomepage')}
                </Link>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const isRTL = language === 'ar';

  return (
    <div className={`d-flex flex-column min-vh-100 bg-light ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="py-4 shadow-sm" style={{ backgroundColor: '#F1F8E9', borderBottom: '1px solid #C5E1A5' }}>
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <Link href="/" className="me-3" style={{ color: '#2E7D32' }}>
                  <FaArrowLeft size={20} />
                </Link>
                <div>
                  <h4 className="mb-0 fw-bold" style={{ color: '#1B5E20' }}>{t('islamicWindows')}</h4>
                  <small className="fw-medium" style={{ color: '#388E3C' }}>{t('publicBook')}</small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2 flex-wrap">
                {['tr', 'en', 'ar', 'de', 'fr', 'ja'].map(lang => (
                  <Button
                    key={lang}
                    variant={language === lang ? 'success' : 'outline-success'}
                    size="sm"
                    className={language === lang ? 'shadow-sm px-3' : 'px-3'}
                    style={{ borderRadius: '20px' }}
                    onClick={() => {
                      setLanguage(lang);
                      // URL'i güncelle
                      const url = new URL(window.location.href);
                      url.searchParams.set('lang', lang);
                      window.history.replaceState({}, '', url);
                    }}
                  >
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Book Content */}
      <Container className="py-4 flex-grow-1">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-sm">
              <CardBody>
                <Row className="align-items-start">
                  <Col md={4} className="text-center mb-4 mb-md-0">
                    <div className="position-relative">
                      <Image
                        className="img-fluid rounded shadow-sm"
                        src={getImageUrl(bookData?.coverUrl || bookData?.coverImage)}
                        alt={getBookTitle()}
                        width={300}
                        height={400}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/images/book-placeholder.jpg';
                        }}
                      />
                    </div>
                  </Col>

                  <Col md={8}>
                    <div className="ps-md-3">
                      <h1 className="mb-3">{getBookTitle()}</h1>

                      <div className="mb-4">
                        <Row className="g-3">
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsPerson className="me-2 text-primary" />
                              <strong>{t('author')}:</strong>
                              <span className="ms-2">{getBookAuthor()}</span>
                            </div>
                          </Col>
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsBook className="me-2 text-primary" />
                              <strong>{t('category')}:</strong>
                              <span className="ms-2">{getBookCategory()}</span>
                            </div>
                          </Col>
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsCalendar className="me-2 text-primary" />
                              <strong>{t('publishedDate')}:</strong>
                              <span className="ms-2">{formatDate(getPublishDate())}</span>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="mb-4">
                        <h5>{t('description') || 'Description'}</h5>
                        <div
                          className="text-muted"
                          dangerouslySetInnerHTML={{ __html: getBookDescription() }}
                        />
                      </div>

                      <div className="d-flex gap-3 mb-4">
                        {bookData?.pdfUrl && (
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => window.open(getImageUrl(bookData.pdfUrl), '_blank')}
                          >
                            <BsDownload className="me-2" />
                            {t('downloadPdf')}
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="lg"
                          onClick={() => window.open('/', '_blank')}
                        >
                          <BsEyeFill className="me-2" />
                          {t('readOnline')}
                        </Button>
                      </div>

                      <div className="text-end">
                        <Button
                          variant="success"
                          size="lg"
                          onClick={() => window.location.href = '/auth-advance/sign-up'}
                        >
                          {t('joinIslamicWindows')}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Call to Action */}
            <Card className="mt-4 border-primary">
              <CardBody className="text-center">
                <h5 className="mb-3">{t('joinCallToAction')}</h5>
                <p className="text-muted mb-4">
                  {t('joinDescription')}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = '/auth-advance/sign-up'}
                  >
                    {t('signUpNow')}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => window.open('/', '_blank')}
                  >
                    {t('learnMore')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto">
        <Container>
          <Row>
            <Col>
              <div className="text-center">
                <p className="mb-0">&copy; {t('copyright')}</p>
                <small className="text-muted">
                  {t('footerText')}
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default PublicBookPage;
