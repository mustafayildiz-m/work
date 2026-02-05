'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsFileText, BsDownload, BsTrash, BsThreeDots, BsCalendar, BsPerson, BsBook } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import { generateArticleUrl } from '@/utils/articleEncoder';
import Image from 'next/image';
import Link from 'next/link';
import avatar7 from '@/assets/images/avatar/07.jpg';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SharedArticleCard = ({ post, onDeletePost }) => {
  const { t, locale } = useLanguage();
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl === 'null' || photoUrl === '' || photoUrl === 'undefined') {
      return avatar7.src || avatar7;
    }

    // If it's already an absolute URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }

    // If it starts with /uploads/, add API base URL
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }

    // If it starts with uploads/ (without leading slash), add API base URL with slash
    if (photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}/${photoUrl}`;
    }

    // For any other relative URL, add API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${apiBaseUrl}/${photoUrl}`;
  };

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Try to get from token first
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload.userId || payload.sub;
          if (userId) {
            setCurrentUserId(userId);
            return;
          }
        } catch (err) {
        }

        // Fallback to localStorage user data
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.id) {
              setCurrentUserId(user.id);
              return;
            }
          } catch (parseErr) {
          }
        }

        // Last resort: API call
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUserId(userData.id);
          }
        } catch (apiErr) {
        }
      } catch (error) {
        console.error('Error getting current user ID:', error);
      }
    };

    getCurrentUserId();
  }, []);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!post.shared_article_id) {
        setError('Makale ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/articles/${post.shared_article_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setArticleData(data);
        } else if (response.status === 404) {
          setError('Makale bulunamadı');
        } else {
          setError('Makale yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [post.shared_article_id]);

  const getArticleImage = () => {
    if (!articleData) return '/images/book-placeholder.jpg';

    if (articleData.coverImage) {
      if (articleData.coverImage.startsWith('/uploads/') || articleData.coverImage.startsWith('uploads/')) {
        const normalizedPath = articleData.coverImage.startsWith('/') ? articleData.coverImage : `/${articleData.coverImage}`;
        return `${API_BASE_URL}${normalizedPath}`;
      }
      return articleData.coverImage;
    }

    return '/images/book-placeholder.jpg';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Map language codes to locale strings
      const localeMap = {
        'tr': 'tr-TR',
        'en': 'en-US',
        'ar': 'ar-SA',
        'de': 'de-DE',
        'fr': 'fr-FR',
        'ja': 'ja-JP'
      };
      const dateLocale = localeMap[locale] || 'tr-TR';
      return date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    if (onDeletePost) {
      onDeletePost(post.id);
    }
  };

  if (loading) {
    return (
      <Card className="mb-3 border-0 shadow-sm">
        <CardBody className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2 text-muted">{t('post.sharedArticleLoading') || 'Makale yükleniyor...'}</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-3 border-0 shadow-sm">
        <CardBody>
          <Alert variant="danger" className="mb-0 border-0">
            <strong>{t('error') || 'Hata'}:</strong> {error === 'Makale yüklenirken bir hata oluştu' ? t('post.articleNotFoundError') || error : error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!articleData) {
    return null;
  }

  const isOwner = currentUserId && post.user_id && post.user_id === currentUserId;
  const mainTranslation = articleData.translations?.[0];
  const articleTitle = mainTranslation?.title || articleData.title || 'Makale';

  return (
    <>
      <Card className="mb-3 border-0 shadow-sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <CardBody className="p-4" style={{ maxWidth: '100%', overflow: 'hidden' }}>
          {/* Kullanıcı Bilgileri */}
          <div className="d-flex align-items-center mb-3">
            <div className="avatar me-3">
              <Image
                className="avatar-img rounded-circle"
                src={getImageUrl(post.user_photo_url)}
                alt={post.user_name || 'User'}
                width={40}
                height={40}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = avatar7.src;
                }}
              />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-0" style={{ color: '#2c3e50' }}>
                {post.user_id ? (
                  <Link
                    href={`/profile/user/${post.user_id}`}
                    className="text-decoration-none"
                    style={{ color: '#2c3e50' }}
                  >
                    {post.user_name || `User ${post.user_id}`}
                  </Link>
                ) : (
                  <span className="text-decoration-none" style={{ color: '#2c3e50' }}>
                    {post.user_name || t('common.user') || 'Kullanıcı'}
                  </span>
                )}
              </h6>
              <small className="text-muted">
                {t('post.userRole') || 'Kullanıcı'} • {post.timeAgo || new Date(post.created_at).toLocaleDateString()}
              </small>
            </div>
            <Dropdown>
              <DropdownToggle variant="link" size="sm" className="text-muted p-1 text-decoration-none">
                <BsThreeDots size={20} />
              </DropdownToggle>
              <DropdownMenu align="end" className="border-0 shadow">
                {isOwner && (
                  <DropdownItem as="button" onClick={() => setShowDeleteDialog(true)} className="text-danger">
                    <BsTrash size={14} className="me-2" />
                    {t('post.removeShare') || 'Paylaşımı Kaldır'}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Makale Paylaşım Başlığı */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2">
                <BsFileText size={16} className="text-info" />
              </div>
              <span className="fw-semibold text-dark">{t('post.sharedArticle') || 'Makale Paylaştı'}</span>
            </div>
          </div>

          {/* Makale Kartı */}
          <div className="border-0 rounded-3 p-4 mb-3" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', maxWidth: '100%', overflow: 'hidden' }}>
            <div className="d-flex gap-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              {/* Makale Kapağı */}
              {articleData.coverImage && (
                <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                  <div className="position-relative">
                    <Image
                      src={getArticleImage()}
                      alt={articleTitle}
                      width={100}
                      height={140}
                      className="rounded-3"
                      style={{
                        width: '100px',
                        height: '140px',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
                        border: '3px solid white',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/book-placeholder.jpg';
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-5px) scale(1.02)';
                        e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Makale Detayları */}
              <div className="flex-grow-1" style={{ position: 'relative', zIndex: 1, minWidth: 0, maxWidth: articleData.coverImage ? 'calc(100% - 120px)' : '100%' }}>
                <h5 className="mb-3 fw-bold text-truncate" style={{ color: '#006064', fontSize: '1.25rem' }}>
                  {articleTitle}
                </h5>

                <div className="mb-3">
                  {articleData.author && (
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-white bg-opacity-75 rounded-pill px-3 py-1 d-flex align-items-center" style={{ maxWidth: '100%' }}>
                        <BsPerson size={16} className="me-2 text-info flex-shrink-0" />
                        <span className="small fw-medium text-dark text-truncate">
                          {articleData.author}
                        </span>
                      </div>
                    </div>
                  )}
                  {articleData.publishDate && (
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-white bg-opacity-75 rounded-pill px-3 py-1 d-flex align-items-center" style={{ maxWidth: '100%' }}>
                        <BsCalendar size={14} className="me-2 text-info flex-shrink-0" />
                        <span className="small text-dark text-truncate">{formatDate(articleData.publishDate)}</span>
                      </div>
                    </div>
                  )}
                  {articleData.book && (
                    <div className="d-flex align-items-center">
                      <div className="bg-white bg-opacity-75 rounded-pill px-3 py-1 d-flex align-items-center" style={{ maxWidth: '100%' }}>
                        <BsBook size={14} className="me-2 text-info flex-shrink-0" />
                        <span className="small text-dark text-truncate">
                          {articleData.book.translations?.[0]?.title || articleData.book.author || t('post.relatedBook') || 'İlgili Kitap'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {mainTranslation?.summary && (
                  <div className="bg-white bg-opacity-75 rounded-3 p-3 mb-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <p className="small text-secondary mb-0" style={{ lineHeight: '1.6', wordBreak: 'break-word' }}>
                      {mainTranslation.summary.length > 200
                        ? `${mainTranslation.summary.substring(0, 200)}...`
                        : mainTranslation.summary
                      }
                    </p>
                  </div>
                )}

                {/* Makale URL'si */}
                <div className="mb-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <small className="text-dark fw-semibold d-block mb-2">
                    {t('post.articleLink') || 'Makale Linki'}:
                  </small>
                  <div className="d-flex align-items-center bg-white rounded-3 p-2 shadow-sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <BsFileText size={16} className="me-2 text-info flex-shrink-0" />
                    <code className="small text-truncate flex-grow-1 me-2 text-dark" style={{ minWidth: 0 }}>
                      {generateArticleUrl(post.shared_article_id, window.location.origin, 'tr')?.replace(window.location.origin, '')}
                    </code>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="rounded-pill px-3 flex-shrink-0"
                      onClick={() => {
                        const publicUrl = generateArticleUrl(post.shared_article_id, window.location.origin, 'tr');
                        if (publicUrl) {
                          navigator.clipboard.writeText(publicUrl);
                        }
                      }}
                    >
                      {t('post.copy') || 'Kopyala'}
                    </Button>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="d-flex gap-2 flex-wrap" style={{ maxWidth: '100%' }}>
                  {mainTranslation?.pdfUrl && (
                    <Button
                      variant="info"
                      size="sm"
                      className="rounded-pill px-4 shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
                        border: 'none',
                        color: 'white',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => {
                        const fullUrl = mainTranslation.pdfUrl.startsWith('/uploads/')
                          ? `${process.env.NEXT_PUBLIC_API_URL}${mainTranslation.pdfUrl}`
                          : mainTranslation.pdfUrl;
                        window.open(fullUrl, '_blank');
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <BsDownload size={14} className="me-2" />
                      {t('post.downloadPdf') || 'PDF İndir'}
                    </Button>
                  )}
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="rounded-pill px-4"
                    onClick={() => window.open(`/feed/articles/${post.shared_article_id}`, '_blank')}
                  >
                    <BsFileText size={14} className="me-2" />
                    {t('post.viewArticle') || 'Makaleyi Görüntüle'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <CustomConfirmDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        title={t('post.deletePost') || 'Gönderiyi Sil'}
        message={t('post.deletePostConfirm') || 'Bu gönderiyi silmek istediğinize emin misiniz?'}
        confirmText={t('post.deleteConfirm') || 'Sil'}
        cancelText={t('post.deleteCancel') || 'İptal'}
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </>
  );
};

export default SharedArticleCard;

