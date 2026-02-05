'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { BsFileText, BsCalendar, BsPerson, BsDownload, BsArrowLeft, BsEyeFill, BsBook } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { decodeArticleId } from '@/utils/articleEncoder';

// Simple translation system for public pages
const translations = {
  tr: {
    loading: 'Makale yükleniyor...',
    articleNotFound: 'Makale Bulunamadı',
    goToHomepage: 'Ana Sayfaya Git',
    islamicWindows: 'Islamic Windows',
    publicArticle: 'Genel Makale',
    joinIslamicWindows: 'Islamic Windows\'a Katıl',
    signUpNow: 'Şimdi Kaydol',
    learnMore: 'Daha Fazla Bilgi',
    author: 'Yazar',
    book: 'Kitap',
    publishedDate: 'Yayın Tarihi',
    notSpecified: 'Belirtilmemiş',
    noContentAvailable: 'İçerik mevcut değil',
    downloadPdf: 'PDF İndir',
    readOnline: 'Çevrimiçi Oku',
    joinCallToAction: 'Islamic Windows\'a Katıl',
    joinDescription: 'İslami makaleleri keşfedin, bilgi edinin ve topluluğumuzun bir parçası olun.',
    footerText: 'Bu genel makale görünümüdür. Daha fazla içerik görmek ve toplulukla bağlantı kurmak için bize katılın.',
    copyright: '2025 Islamic Windows. Tüm hakları saklıdır.',
    invalidLink: 'Geçersiz makale linki',
    summary: 'Özet',
    content: 'İçerik'
  },
  en: {
    loading: 'Loading article...',
    articleNotFound: 'Article Not Found',
    goToHomepage: 'Go to Homepage',
    islamicWindows: 'Islamic Windows',
    publicArticle: 'Public Article',
    joinIslamicWindows: 'Join Islamic Windows',
    signUpNow: 'Sign Up Now',
    learnMore: 'Learn More',
    author: 'Author',
    book: 'Book',
    publishedDate: 'Published Date',
    notSpecified: 'Not specified',
    noContentAvailable: 'No content available',
    downloadPdf: 'Download PDF',
    readOnline: 'Read Online',
    joinCallToAction: 'Join Islamic Windows',
    joinDescription: 'Discover Islamic articles, gain knowledge, and be part of our community.',
    footerText: 'This is a public article view. Join us to see more content and connect with the community.',
    copyright: '2025 Islamic Windows. All rights reserved.',
    invalidLink: 'Invalid article link',
    summary: 'Summary',
    content: 'Content'
  },
  ar: {
    loading: 'جاري تحميل المقال...',
    articleNotFound: 'المقال غير موجود',
    goToHomepage: 'العودة إلى الصفحة الرئيسية',
    islamicWindows: 'النوافذ الإسلامية',
    publicArticle: 'مقال عام',
    joinIslamicWindows: 'انضم إلى النوافذ الإسلامية',
    signUpNow: 'سجل الآن',
    learnMore: 'اعرف المزيد',
    author: 'المؤلف',
    book: 'الكتاب',
    publishedDate: 'تاريخ النشر',
    notSpecified: 'غير محدد',
    noContentAvailable: 'لا يوجد محتوى متاح',
    downloadPdf: 'تحميل PDF',
    readOnline: 'قراءة عبر الإنترنت',
    joinCallToAction: 'انضم إلى النوافذ الإسلامية',
    joinDescription: 'اكتشف المقالات الإسلامية، واكتسب المعرفة، وكن جزءاً من مجتمعنا.',
    footerText: 'هذا عرض عام للمقال. انضم إلينا لرؤية المزيد من المحتوى والتواصل مع المجتمع.',
    copyright: '2025 النوافذ الإسلامية. جميع الحقوق محفوظة.',
    invalidLink: 'رابط مقال غير صالح',
    summary: 'الملخص',
    content: 'المحتوى'
  },
  de: {
    loading: 'Artikel wird geladen...',
    articleNotFound: 'Artikel nicht gefunden',
    goToHomepage: 'Zur Startseite',
    islamicWindows: 'Islamic Windows',
    publicArticle: 'Öffentlicher Artikel',
    joinIslamicWindows: 'Islamic Windows beitreten',
    signUpNow: 'Jetzt registrieren',
    learnMore: 'Mehr erfahren',
    author: 'Autor',
    book: 'Buch',
    publishedDate: 'Veröffentlichungsdatum',
    notSpecified: 'Nicht angegeben',
    noContentAvailable: 'Kein Inhalt verfügbar',
    downloadPdf: 'PDF herunterladen',
    readOnline: 'Online lesen',
    joinCallToAction: 'Islamic Windows beitreten',
    joinDescription: 'Entdecken Sie islamische Artikel, gewinnen Sie Wissen und werden Sie Teil unserer Gemeinschaft.',
    footerText: 'Dies ist eine öffentliche Artikelansicht. Treten Sie uns bei, um mehr Inhalte zu sehen und sich mit der Community zu verbinden.',
    copyright: '2025 Islamic Windows. Alle Rechte vorbehalten.',
    invalidLink: 'Ungültiger Artikel-Link',
    summary: 'Zusammenfassung',
    content: 'Inhalt'
  },
  fr: {
    loading: 'Chargement de l\'article...',
    articleNotFound: 'Article non trouvé',
    goToHomepage: 'Aller à l\'accueil',
    islamicWindows: 'Islamic Windows',
    publicArticle: 'Article public',
    joinIslamicWindows: 'Rejoindre Islamic Windows',
    signUpNow: 'S\'inscrire maintenant',
    learnMore: 'En savoir plus',
    author: 'Auteur',
    book: 'Livre',
    publishedDate: 'Date de publication',
    notSpecified: 'Non spécifié',
    noContentAvailable: 'Aucun contenu disponible',
    downloadPdf: 'Télécharger PDF',
    readOnline: 'Lire en ligne',
    joinCallToAction: 'Rejoindre Islamic Windows',
    joinDescription: 'Découvrez les articles islamiques, acquérez des connaissances et faites partie de notre communauté.',
    footerText: 'Ceci est une vue d\'article public. Rejoignez-nous pour voir plus de contenu et vous connecter avec la communauté.',
    copyright: '2025 Islamic Windows. Tous droits réservés.',
    invalidLink: 'Lien d\'article invalide',
    summary: 'Résumé',
    content: 'Contenu'
  },
  ja: {
    loading: '記事を読み込んでいます...',
    articleNotFound: '記事が見つかりません',
    goToHomepage: 'ホームページに戻る',
    islamicWindows: 'Islamic Windows',
    publicArticle: '公開記事',
    joinIslamicWindows: 'Islamic Windowsに参加',
    signUpNow: '今すぐ登録',
    learnMore: '詳しく見る',
    author: '著者',
    book: '本',
    publishedDate: '出版日',
    notSpecified: '未指定',
    noContentAvailable: 'コンテンツがありません',
    downloadPdf: 'PDFダウンロード',
    readOnline: 'オンラインで読む',
    joinCallToAction: 'Islamic Windowsに参加',
    joinDescription: 'イスラムの記事を発見し、知識を得て、コミュニティの一員になりましょう。',
    footerText: 'これは公開記事表示です。参加してより多くのコンテンツを見て、コミュニティとつながりましょう。',
    copyright: '2025 Islamic Windows. 全著作権所有。',
    invalidLink: '無効な記事のリンク',
    summary: '要約',
    content: '内容'
  }
};

const PublicArticlePage = () => {
  const params = useParams();
  const { hash } = params;

  const [articleData, setArticleData] = useState(null);
  const [articleInfo, setArticleInfo] = useState(null);
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
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Decode hash to get articleId and lang
        const decoded = decodeArticleId(hash);

        if (!decoded) {
          setError(t('invalidLink'));
          setLoading(false);
          return;
        }

        const { articleId, lang } = decoded;
        setArticleInfo({ articleId, lang });

        // Fetch article data from API
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/articles/public/${articleId}${lang ? `?lang=${lang}` : ''}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setArticleData(data);
        } else if (response.status === 404) {
          setError(t('articleNotFound'));
        } else {
          setError('Failed to load article');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchArticleData();
    }
  }, [hash]);

  const getImageUrl = (url) => {
    if (!url) return '/images/book-placeholder.jpg';
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return url;
  };

  const getArticleImage = () => {
    if (!articleData) return '/images/book-placeholder.jpg';

    // Makale kendi coverImage'ı
    if (articleData.coverImage) {
      return getImageUrl(articleData.coverImage);
    }

    // Kitabın cover image'ı
    if (articleData.book) {
      if (articleData.book.coverImage) {
        return getImageUrl(articleData.book.coverImage);
      }
      if (articleData.book.coverUrl) {
        return getImageUrl(articleData.book.coverUrl);
      }
    }

    return '/images/book-placeholder.jpg';
  };

  const getArticleTitle = () => {
    if (!articleData) return '';
    // İlk translation'dan başlık al
    const translation = articleData.translations?.[0];
    return translation?.title || articleData.title || 'Untitled Article';
  };

  const getArticleAuthor = () => {
    if (!articleData) return t('notSpecified');
    return articleData.author || t('notSpecified');
  };

  const getArticleSummary = () => {
    if (!articleData) return t('noContentAvailable');
    const translation = articleData.translations?.[0];
    return translation?.summary || t('noContentAvailable');
  };

  const getArticleContent = () => {
    if (!articleData) return t('noContentAvailable');
    const translation = articleData.translations?.[0];
    return translation?.content || t('noContentAvailable');
  };

  const getBookTitle = () => {
    if (!articleData?.book) return t('notSpecified');
    const bookTranslation = articleData.book.translations?.[0];
    return bookTranslation?.title || articleData.book.author || t('notSpecified');
  };

  const getPublishDate = () => {
    if (!articleData) return t('notSpecified');
    return articleData.publishDate || articleData.createdAt || t('notSpecified');
  };

  const getPdfUrl = () => {
    if (!articleData) return null;
    const translation = articleData.translations?.[0];
    return translation?.pdfUrl || null;
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
                <h4>{t('articleNotFound')}</h4>
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
  const pdfUrl = getPdfUrl();

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
                  <small className="fw-medium" style={{ color: '#388E3C' }}>{t('publicArticle')}</small>
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

      {/* Article Content */}
      <Container className="py-4 flex-grow-1">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-sm">
              <CardBody>
                <Row className="align-items-start">
                  {/* Article Cover Image */}
                  <Col md={4} className="text-center mb-4 mb-md-0">
                    <div className="position-relative">
                      <Image
                        className="img-fluid rounded shadow-sm"
                        src={getArticleImage()}
                        alt={getArticleTitle()}
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
                      <h1 className="mb-3">{getArticleTitle()}</h1>

                      <div className="mb-4">
                        <Row className="g-3">
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsPerson className="me-2 text-info" />
                              <strong>{t('author')}:</strong>
                              <span className="ms-2">{getArticleAuthor()}</span>
                            </div>
                          </Col>
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsBook className="me-2 text-info" />
                              <strong>{t('book')}:</strong>
                              <span className="ms-2">{getBookTitle()}</span>
                            </div>
                          </Col>
                          <Col xs={12} sm={6}>
                            <div className="d-flex align-items-center">
                              <BsCalendar className="me-2 text-info" />
                              <strong>{t('publishedDate')}:</strong>
                              <span className="ms-2">{formatDate(getPublishDate())}</span>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      {/* Summary */}
                      <div className="mb-4">
                        <h5>{t('summary')}</h5>
                        <div
                          className="text-muted"
                          style={{ lineHeight: '1.6' }}
                        >
                          {getArticleSummary()}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="mb-4">
                        <h5>{t('content')}</h5>
                        <div
                          className="text-muted"
                          style={{
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '200px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          {getArticleContent().substring(0, 300)}...
                        </div>
                      </div>

                      <div className="d-flex gap-3 mb-4 flex-wrap">
                        {pdfUrl && (
                          <Button
                            variant="info"
                            size="lg"
                            onClick={() => window.open(getImageUrl(pdfUrl), '_blank')}
                          >
                            <BsDownload className="me-2" />
                            {t('downloadPdf')}
                          </Button>
                        )}
                        <Button
                          variant="outline-info"
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
            <Card className="mt-4 border-info">
              <CardBody className="text-center">
                <h5 className="mb-3">{t('joinCallToAction')}</h5>
                <p className="text-muted mb-4">
                  {t('joinDescription')}
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button
                    variant="info"
                    size="lg"
                    onClick={() => window.location.href = '/auth-advance/sign-up'}
                  >
                    {t('signUpNow')}
                  </Button>
                  <Button
                    variant="outline-info"
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

export default PublicArticlePage;

