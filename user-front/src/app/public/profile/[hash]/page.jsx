'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { BsPatchCheckFill, BsCalendarDate, BsGeoAlt, BsPersonFill } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import avatar7 from '@/assets/images/avatar/07.jpg';
import background5 from '@/assets/images/bg/05.jpg';
import { decodeProfileId } from '@/utils/profileEncoder';

// Simple translation system for public pages
const translations = {
  tr: {
    loading: 'Profil yükleniyor...',
    profileNotFound: 'Profil Bulunamadı',
    goToHomepage: 'Ana Sayfaya Git',
    islamicWindows: 'Islamic Windows',
    publicProfile: 'Genel Profil',
    joinIslamicWindows: 'Islamic Windows\'a Katıl',
    signUpNow: 'Şimdi Kaydol',
    learnMore: 'Daha Fazla Bilgi',
    biography: 'Biyografi',
    notSpecified: 'Belirtilmemiş',
    noBiographyAvailable: 'Biyografi mevcut değil',
    noBiographyAvailableForScholar: 'Bu alim için biyografi mevcut değil',
    scholar: 'Alim',
    user: 'Kullanıcı',
    joinCallToAction: 'Islamic Windows\'a Katıl',
    joinDescription: 'Alimlerle bağlantı kurun, bilgi paylaşın ve İslami topluluğumuzun bir parçası olun.',
    footerText: 'Bu genel profil görünümüdür. Daha fazla içerik görmek ve toplulukla bağlantı kurmak için bize katılın.',
    copyright: '2025 Islamic Windows. Tüm hakları saklıdır.',
    invalidLink: 'Geçersiz profil linki'
  },
  en: {
    loading: 'Loading profile...',
    profileNotFound: 'Profile Not Found',
    goToHomepage: 'Go to Homepage',
    islamicWindows: 'Islamic Windows',
    publicProfile: 'Public Profile',
    joinIslamicWindows: 'Join Islamic Windows',
    signUpNow: 'Sign Up Now',
    learnMore: 'Learn More',
    biography: 'Biography',
    notSpecified: 'Not specified',
    noBiographyAvailable: 'No biography available',
    noBiographyAvailableForScholar: 'No biography available for this scholar',
    scholar: 'Scholar',
    user: 'User',
    joinCallToAction: 'Join Islamic Windows',
    joinDescription: 'Connect with scholars, share knowledge, and be part of our Islamic community.',
    footerText: 'This is a public profile view. Join us to see more content and connect with the community.',
    copyright: '2025 Islamic Windows. All rights reserved.',
    invalidLink: 'Invalid profile link'
  },
  ar: {
    loading: 'جاري تحميل الملف الشخصي...',
    profileNotFound: 'الملف الشخصي غير موجود',
    goToHomepage: 'العودة إلى الصفحة الرئيسية',
    islamicWindows: 'النوافذ الإسلامية',
    publicProfile: 'ملف شخصي عام',
    joinIslamicWindows: 'انضم إلى النوافذ الإسلامية',
    signUpNow: 'سجل الآن',
    learnMore: 'اعرف المزيد',
    biography: 'السيرة الذاتية',
    notSpecified: 'غير محدد',
    noBiographyAvailable: 'لا توجد سيرة ذاتية متاحة',
    noBiographyAvailableForScholar: 'لا توجد سيرة ذاتية متاحة لهذا العالم',
    scholar: 'عالم',
    user: 'مستخدم',
    joinCallToAction: 'انضم إلى النوافذ الإسلامية',
    joinDescription: 'تواصل مع العلماء، شارك المعرفة، وكن جزءاً من مجتمعنا الإسلامي.',
    footerText: 'هذا عرض عام للملف الشخصي. انضم إلينا لرؤية المزيد من المحتوى والتواصل مع المجتمع.',
    copyright: '2025 النوافذ الإسلامية. جميع الحقوق محفوظة.',
    invalidLink: 'رابط ملف شخصي غير صالح'
  },
  de: {
    loading: 'Profil wird geladen...',
    profileNotFound: 'Profil nicht gefunden',
    goToHomepage: 'Zur Startseite',
    islamicWindows: 'Islamic Windows',
    publicProfile: 'Öffentliches Profil',
    joinIslamicWindows: 'Islamic Windows beitreten',
    signUpNow: 'Jetzt registrieren',
    learnMore: 'Mehr erfahren',
    biography: 'Biografie',
    notSpecified: 'Nicht angegeben',
    noBiographyAvailable: 'Keine Biografie verfügbar',
    noBiographyAvailableForScholar: 'Keine Biografie für diesen Gelehrten verfügbar',
    scholar: 'Gelehrter',
    user: 'Benutzer',
    joinCallToAction: 'Islamic Windows beitreten',
    joinDescription: 'Verbinden Sie sich mit Gelehrten, teilen Sie Wissen und werden Sie Teil unserer islamischen Gemeinschaft.',
    footerText: 'Dies ist eine öffentliche Profilansicht. Treten Sie uns bei, um mehr Inhalte zu sehen und sich mit der Community zu verbinden.',
    copyright: '2025 Islamic Windows. Alle Rechte vorbehalten.',
    invalidLink: 'Ungültiger Profil-Link'
  },
  fr: {
    loading: 'Chargement du profil...',
    profileNotFound: 'Profil non trouvé',
    goToHomepage: 'Aller à l\'accueil',
    islamicWindows: 'Islamic Windows',
    publicProfile: 'Profil public',
    joinIslamicWindows: 'Rejoindre Islamic Windows',
    signUpNow: 'S\'inscrire maintenant',
    learnMore: 'En savoir plus',
    biography: 'Biographie',
    notSpecified: 'Non spécifié',
    noBiographyAvailable: 'Aucune biographie disponible',
    noBiographyAvailableForScholar: 'Aucune biographie disponible pour ce savant',
    scholar: 'Savant',
    user: 'Utilisateur',
    joinCallToAction: 'Rejoindre Islamic Windows',
    joinDescription: 'Connectez-vous avec des savants, partagez des connaissances et faites partie de notre communauté islamique.',
    footerText: 'Ceci est une vue de profil public. Rejoignez-nous pour voir plus de contenu et vous connecter avec la communauté.',
    copyright: '2025 Islamic Windows. Tous droits réservés.',
    invalidLink: 'Lien de profil invalide'
  },
  ja: {
    loading: 'プロフィールを読み込んでいます...',
    profileNotFound: 'プロフィールが見つかりません',
    goToHomepage: 'ホームページに戻る',
    islamicWindows: 'Islamic Windows',
    publicProfile: '公開プロフィール',
    joinIslamicWindows: 'Islamic Windowsに参加',
    signUpNow: '今すぐ登録',
    learnMore: '詳しく見る',
    biography: '経歴',
    notSpecified: '未指定',
    noBiographyAvailable: '経歴情報がありません',
    noBiographyAvailableForScholar: 'この学者の経歴情報がありません',
    scholar: '学者',
    user: 'ユーザー',
    joinCallToAction: 'Islamic Windowsに参加',
    joinDescription: '学者とつながり、知識を共有し、イスラムコミュニティの一員になりましょう。',
    footerText: 'これは公開プロフィール表示です。参加してより多くのコンテンツを見て、コミュニティとつながりましょう。',
    copyright: '2025 Islamic Windows. 全著作権所有。',
    invalidLink: '無効なプロフィールリンク'
  }
};

const PublicProfilePage = () => {
  const params = useParams();
  const { hash } = params;

  const [profileData, setProfileData] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
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
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Decode hash to get type and id
        const decoded = decodeProfileId(hash);

        if (!decoded) {
          setError(t('invalidLink'));
          setLoading(false);
          return;
        }

        const { type, id } = decoded;
        setProfileInfo({ type, id });

        let apiUrl;
        if (type === 'scholar') {
          apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/public/scholars/${id}`;
        } else if (type === 'user') {
          apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/public/users/${id}`;
        } else {
          throw new Error('Invalid profile type');
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else if (response.status === 404) {
          setError(t('profileNotFound'));
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchProfileData();
    }
  }, [hash]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return photoUrl;
  };

  const getProfileDisplayName = () => {
    if (!profileData) return '';

    if (profileInfo?.type === 'scholar') {
      return profileData.fullName || 'Scholar';
    } else {
      return profileData.firstName && profileData.lastName
        ? `${profileData.firstName} ${profileData.lastName}`
        : profileData.name || profileData.fullName || 'User';
    }
  };

  const getProfileLocation = () => {
    if (!profileData) return t('notSpecified');

    if (profileInfo?.type === 'scholar') {
      return profileData.locationName || t('notSpecified');
    } else {
      return profileData.location || profileData.locationName || t('notSpecified');
    }
  };

  const getProfileBio = () => {
    if (!profileData) return t('noBiographyAvailable');

    if (profileInfo?.type === 'scholar') {
      return profileData.biography || t('noBiographyAvailableForScholar');
    } else {
      return profileData.biography || profileData.description || t('noBiographyAvailable');
    }
  };

  const getProfileDateInfo = () => {
    if (!profileData) return t('notSpecified');

    if (profileInfo?.type === 'scholar') {
      return profileData.birthDate ? `${profileData.birthDate} - ${profileData.deathDate || 'Present'}` : t('notSpecified');
    } else {
      return profileData.joinDate || profileData.createdAt || profileData.created_at || t('notSpecified');
    }
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
                <h4>{t('profileNotFound')}</h4>
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
    <div className={`min-vh-100 bg-light ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div
        className="text-white py-4"
        style={{
          background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
          boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <Link href="/" className="text-white me-3">
                  <FaArrowLeft size={20} />
                </Link>
                <div>
                  <h4 className="mb-0">{t('islamicWindows')}</h4>
                  <small>{t('publicProfile')}</small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2 flex-wrap">
                {['tr', 'en', 'ar', 'de', 'fr', 'ja'].map(lang => (
                  <Button
                    key={lang}
                    variant={language === lang ? 'light' : 'outline-light'}
                    size="sm"
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

      {/* Profile Content */}
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              {/* Cover Image */}
              <div
                className="h-200px rounded-top"
                style={{
                  backgroundImage: `url(${profileData?.coverImage ? getImageUrl(profileData.coverImage) : background5.src})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat'
                }}
              />

              <CardBody className="py-0">
                <div className="d-flex align-items-start text-center text-sm-start">
                  <div>
                    <div className="position-relative d-inline-block">
                      <div className="avatar avatar-xxl mt-n5 mb-3">
                        <img
                          className="avatar-img rounded-circle border border-white border-3"
                          src={getImageUrl(profileData?.photoUrl || profileData?.photo_url)}
                          alt="avatar"
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ms-sm-4 mt-sm-3 flex-grow-1">
                    <h1 className="mb-0 h5">
                      {getProfileDisplayName()}
                      <BsPatchCheckFill className="text-success small ms-1" />
                    </h1>
                    <p className="text-muted mb-2">
                      {profileInfo?.type === 'scholar' ? t('scholar') : t('user')}
                    </p>

                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <div className="d-flex align-items-center">
                        <BsGeoAlt className="me-1" />
                        {getProfileLocation()}
                      </div>
                      <div className="d-flex align-items-center">
                        <BsCalendarDate className="me-1" />
                        {formatDate(getProfileDateInfo())}
                      </div>
                    </div>
                  </div>

                  <div className="ms-auto mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.open('/', '_blank')}
                    >
                      {t('joinIslamicWindows')}
                    </Button>
                  </div>
                </div>
              </CardBody>

              <CardBody className="pt-0">
                <div className="border-top pt-4">
                  <h6 className="d-flex align-items-center mb-3">
                    <BsPersonFill className="me-2 text-primary" />
                    {t('biography')}
                  </h6>
                  <div
                    className="text-muted"
                    dangerouslySetInnerHTML={{ __html: getProfileBio() }}
                  />
                </div>
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
                    onClick={() => window.open('/', '_blank')}
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
      <footer className="bg-dark text-white py-4 mt-5">
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

export default PublicProfilePage;

