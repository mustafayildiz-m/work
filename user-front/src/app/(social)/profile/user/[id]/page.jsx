'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, Row, Col, Badge } from 'react-bootstrap';
import {
  BsEnvelope, BsCalendar, BsPerson, BsClock, BsGeoAlt,
  BsTelephone, BsCake, BsShieldCheck, BsInfoCircle, BsPersonX
} from 'react-icons/bs';
import { useLanguage } from '../../../../../context/useLanguageContext';

const InfoItem = ({ icon: Icon, label, value, color = "primary" }) => {
  const { t } = useLanguage();
  return (
    <div className="d-flex align-items-start mb-3 p-3 rounded-3" style={{ backgroundColor: `var(--bs-${color}-bg-subtle, rgba(var(--bs-${color}-rgb), 0.05))` }}>
      <div className={`icon-lg rounded-circle bg-${color} text-white flex-shrink-0 d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
        <Icon size={20} />
      </div>
      <div>
        <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>{label}</small>
        <span className="fw-medium text-body" style={{ fontSize: '0.95rem' }}>{value || <span className="text-muted fst-italic">{t('userProfile.notSpecified', 'Belirtilmemiş')}</span>}</span>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const params = useParams();
  const { t, locale } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = params.id;

        if (userId) {
          const token = localStorage.getItem('token');

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            console.error('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]);

  // Tarih formatını düzenle
  const formatDate = (dateString, includeDay = true) => {
    if (!dateString) return <span className="text-muted fst-italic">{t('userProfile.notSpecified', 'Belirtilmemiş')}</span>;

    try {
      const date = new Date(dateString);
      const localeMap = {
        'tr': 'tr-TR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'de': 'de-DE',
        'fr': 'fr-FR',
        'ja': 'ja-JP'
      };

      const options = {
        year: 'numeric',
        month: 'long',
        day: includeDay ? 'numeric' : undefined
      };

      return date.toLocaleDateString(localeMap[locale] || 'tr-TR', options);
    } catch (error) {
      return dateString;
    }
  };

  // Rol badge'ini döndür
  const getRoleBadge = (role) => {
    const roleConfig = {
      'user': { text: t('userProfile.user', 'Kullanıcı'), variant: 'primary', icon: <BsPerson size={12} /> },
      'admin': { text: t('userProfile.admin', 'Yönetici'), variant: 'danger', icon: <BsShieldCheck size={12} /> },
      'moderator': { text: t('userProfile.moderator', 'Moderatör'), variant: 'warning', icon: <BsShieldCheck size={12} /> }
    };

    const config = roleConfig[role] || roleConfig['user'];
    return (
      <Badge bg={config.variant} className="d-inline-flex align-items-center gap-1 px-2 py-1">
        {config.icon} {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="mt-3 text-muted">{t('userProfile.loading', 'Kullanıcı bilgileri yükleniyor...')}</p>
        </CardBody>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="text-center py-5">
          <div className="mb-3">
            <BsPersonX size={48} className="text-muted" />
          </div>
          <h4>{t('userProfile.notFound', 'Kullanıcı Bulunamadı')}</h4>
          <p className="text-muted">{t('userProfile.notFoundDescription', 'Aradığınız kullanıcı profili mevcut değil veya erişilemiyor.')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="vstack gap-4">

      {/* 1. Biyografi Kartı - En Üstte */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{
          background: 'linear-gradient(45deg, var(--bs-primary) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}></div>
        <CardBody className="position-relative p-4">
          <h5 className="card-title mb-4 d-flex align-items-center text-primary">
            <BsInfoCircle className="me-2" size={22} />
            {t('userProfile.about', 'Hakkımda')}
          </h5>
          <div className="p-3 rounded-3 bg-light bg-opacity-50 border border-light">
            <p className="mb-0 text-body" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
              {user.biography || user.description || <span className="text-muted fst-italic">{t('userProfile.noBiography', 'Henüz bir biyografi eklenmemiş.')}</span>}
            </p>
          </div>
        </CardBody>
      </Card>

      <Row className="g-4">
        {/* 2. Sol Kolon - Kişisel & İletişim */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <h5 className="card-title mb-4 d-flex align-items-center text-primary">
                <BsPerson className="me-2" size={22} />
                {t('userProfile.personalInfo', 'Kişisel Bilgiler')}
              </h5>

              <InfoItem
                icon={BsPerson}
                label={t('userProfile.fullName', 'Ad Soyad')}
                value={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                color="primary"
              />

              <InfoItem
                icon={BsCake}
                label={t('userProfile.birthDate', 'Doğum Tarihi')}
                value={formatDate(user.birthDate)}
                color="info"
              />

              <InfoItem
                icon={BsTelephone}
                label={t('userProfile.phone', 'Telefon')}
                value={user.phoneNo}
                color="success"
              />

              <InfoItem
                icon={BsEnvelope}
                label={t('userProfile.email', 'E-posta')}
                value={user.email}
                color="warning"
              />

              <InfoItem
                icon={BsGeoAlt}
                label={t('userProfile.location', 'Konum')}
                value={user.location || user.locationName}
                color="danger"
              />
            </CardBody>
          </Card>
        </Col>

        {/* 3. Sağ Kolon - Hesap Detayları */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <h5 className="card-title mb-4 d-flex align-items-center text-primary">
                <BsShieldCheck className="me-2" size={22} />
                {t('userProfile.accountDetails', 'Hesap Durumu')}
              </h5>

              <Row className="g-3">
                <Col xs={6}>
                  <div className="p-3 rounded-3 bg-light text-center border h-100 d-flex flex-column align-items-center justify-content-center">
                    <small className="text-muted d-block mb-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>{t('userProfile.role', 'Hesap Türü')}</small>
                    {getRoleBadge(user.role)}
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 rounded-3 bg-light text-center border h-100 d-flex flex-column align-items-center justify-content-center">
                    <small className="text-muted d-block mb-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>{t('userProfile.status', 'Durum')}</small>
                    <Badge bg={user.isActive ? 'success' : 'danger'} className="px-2 py-1">
                      {user.isActive ? t('userProfile.active', 'Aktif') : t('userProfile.inactive', 'Pasif')}
                    </Badge>
                  </div>
                </Col>
              </Row>

              <hr className="my-4 text-muted opacity-25" />

              <div className="d-flex align-items-center mb-3">
                <BsCalendar className="text-primary me-3" />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('userProfile.registrationDate', 'Kayıt Tarihi')}</span>
                    <span className="fw-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <BsClock className="text-info me-3" />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('userProfile.lastUpdate', 'Son Güncelleme')}</span>
                    <span className="fw-medium">{formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block text-center">
                  User ID: <span className="font-monospace">{user.id}</span>
                </small>
              </div>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
