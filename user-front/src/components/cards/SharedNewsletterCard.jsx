'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsNewspaper, BsTrash, BsThreeDots, BsCalendar } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import Image from 'next/image';
import Link from 'next/link';
import { getProfilePath } from '@/utils/profileEncoder';
import avatar7 from '@/assets/images/avatar/07.jpg';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SharedNewsletterCard = ({ post, onDeletePost }) => {
  const { t, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const { showNotification } = useNotificationContext();
  const isDarkMode = theme === 'dark' || theme === 'green';
  const [newsletterData, setNewsletterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl === 'null' || photoUrl === '' || photoUrl === 'undefined') {
      return avatar7.src || avatar7;
    }
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      return `${API_BASE_URL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
    }
    return `${API_BASE_URL}/${photoUrl}`;
  };

  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload.userId || payload.sub;
          if (userId) {
            setCurrentUserId(userId);
            return;
          }
        } catch {}
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.id) {
              setCurrentUserId(user.id);
              return;
            }
          } catch {}
        }
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error('Error getting current user ID:', err);
      }
    };
    getCurrentUserId();
  }, []);

  useEffect(() => {
    const fetchNewsletterData = async () => {
      if (!post.shared_newsletter_id) {
        setError('Bülten ID bulunamadı');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const lang = locale ? locale.toLowerCase().split('-')[0] : 'tr';
        const response = await fetch(`${API_BASE_URL}/newsletters/${post.shared_newsletter_id}?lang=${lang}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          setNewsletterData(data);
        } else if (response.status === 404) {
          setError('Bülten bulunamadı');
        } else {
          setError('Bülten yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletterData();
  }, [post.shared_newsletter_id, locale]);

  const getNewsletterImage = () => {
    if (!newsletterData?.imageUrl) return '/images/book-placeholder.jpg';
    const img = newsletterData.imageUrl;
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const localeMap = { tr: 'tr-TR', en: 'en-US', ar: 'ar-SA' };
      return date.toLocaleDateString(localeMap[locale] || 'tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDeletePost) onDeletePost(post.id);
  };

  if (loading) {
    return (
      <Card className={`mb-3 border-0 shadow-sm ${isDarkMode ? 'bg-dark' : ''}`}>
        <CardBody className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2 text-muted">{t('post.sharedNewsletterLoading') || 'Bülten yükleniyor...'}</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`mb-3 border-0 shadow-sm ${isDarkMode ? 'bg-dark' : ''}`}>
        <CardBody>
          <Alert variant="danger" className="mb-0 border-0">
            <strong>{t('error') || 'Hata'}:</strong> {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!newsletterData) return null;

  const isOwner = currentUserId && post.user_id && post.user_id === currentUserId;
  const newsletterUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed/newsletters/${post.shared_newsletter_id}` : '';

  return (
    <>
      <Card className={`mb-3 border-0 shadow-sm ${isDarkMode ? 'bg-dark' : ''}`} style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <CardBody className="p-2 p-sm-3 p-md-4" style={{ maxWidth: '100%', overflow: 'hidden' }}>
          {/* Kullanıcı Bilgileri */}
          <div className="d-flex align-items-center mb-2 mb-sm-3">
            <div className="avatar me-2 me-sm-3">
              <Image
                className="avatar-img rounded-circle"
                src={getImageUrl(post.user_photo_url)}
                alt={post.user_name || 'User'}
                width={40}
                height={40}
                style={{ objectFit: 'cover' }}
                onError={(e) => { e.target.src = avatar7.src; }}
              />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-0" style={{ color: isDarkMode ? '#e9ecef' : '#2c3e50' }}>
                {post.user_id ? (
                  <Link
                    href={getProfilePath('user', post.user_id) || '#'}
                    className="text-decoration-none"
                    style={{ color: isDarkMode ? '#e9ecef' : '#2c3e50' }}
                  >
                    {post.user_name || `User ${post.user_id}`}
                  </Link>
                ) : (
                  <span style={{ color: isDarkMode ? '#e9ecef' : '#2c3e50' }}>{post.user_name || t('common.user')}</span>
                )}
              </h6>
              <small className="text-muted">
                {t('post.userRole')} • {post.timeAgo || new Date(post.created_at).toLocaleDateString()}
              </small>
            </div>
            <Dropdown>
              <DropdownToggle variant="link" size="sm" className="text-muted p-1 text-decoration-none dropdown-toggle-no-caret">
                <BsThreeDots size={20} />
              </DropdownToggle>
              <DropdownMenu align="end" className="border-0 shadow">
                {isOwner && (
                  <DropdownItem as="button" onClick={() => setShowDeleteDialog(true)} className="text-danger">
                    <BsTrash size={14} className="me-2" />
                    {t('post.removeShare')}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Bülten Paylaşım Başlığı */}
          <div className="d-flex align-items-center mb-2 mb-sm-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
              <BsNewspaper size={16} className="text-primary" />
            </div>
            <span className="fw-semibold" style={{ color: isDarkMode ? '#e9ecef' : '#212529' }}>
              {t('post.sharedNewsletter') || 'Bülten Paylaştı'}
            </span>
          </div>

          {/* Bülten Kartı */}
          <div
            className="border-0 rounded-3 p-2 p-sm-3 p-md-4 mb-2 mb-sm-3"
            style={{
              background: isDarkMode ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%)',
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              {newsletterData.imageUrl && (
                <div className="text-center text-sm-start" style={{ flexShrink: 0 }}>
                  <img
                    src={getNewsletterImage()}
                    alt={newsletterData.title}
                    className="rounded-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      minWidth: '80px',
                      minHeight: '80px',
                      objectFit: 'cover',
                      boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)',
                      border: isDarkMode ? '3px solid rgba(255,255,255,0.1)' : '3px solid white'
                    }}
                    onError={(e) => { e.target.src = '/images/book-placeholder.jpg'; }}
                  />
                </div>
              )}
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <h5 className="mb-2 fw-bold text-truncate" style={{ color: isDarkMode ? '#93c5fd' : '#1e3a8a', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
                  {newsletterData.title}
                </h5>
                {newsletterData.publishDate && (
                  <div className="d-flex align-items-center mb-2">
                    <BsCalendar size={14} className="me-2 text-primary flex-shrink-0" />
                    <span className="small" style={{ color: isDarkMode ? '#e2e8f0' : '#212529' }}>
                      {formatDate(newsletterData.publishDate)}
                    </span>
                  </div>
                )}
                {newsletterData.intro && (
                  <p className="small mb-2" style={{
                    lineHeight: '1.5',
                    color: isDarkMode ? '#94a3b8' : '#6c757d',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {newsletterData.intro}
                  </p>
                )}
                <div className="d-flex gap-1 gap-sm-2 flex-wrap">
                  <Link href={`/feed/newsletters/${post.shared_newsletter_id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="sm" className="rounded-pill px-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                      <BsNewspaper size={14} className="me-2" />
                      {t('post.viewNewsletter') || 'Bülteni Oku'}
                    </Button>
                  </Link>
                  <Link href="/feed/newsletters">
                    <Button variant={isDarkMode ? 'outline-light' : 'outline-primary'} size="sm" className="rounded-pill px-4">
                      {t('post.viewAllNewsletters') || 'Tüm Bültenler'}
                    </Button>
                  </Link>
                  <Button
                    variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => {
                      if (newsletterUrl) {
                        navigator.clipboard.writeText(newsletterUrl);
                        showNotification({ title: 'Başarılı', message: 'Link kopyalandı', variant: 'success' });
                      }
                    }}
                  >
                    {t('post.copy')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <CustomConfirmDialog
        show={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t('post.deletePost')}
        message={t('post.deletePostConfirm')}
        confirmText={t('post.deleteConfirm')}
        cancelText={t('post.deleteCancel')}
        type="danger"
      />
    </>
  );
};

export default SharedNewsletterCard;
