'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsBook, BsDownload, BsTrash, BsThreeDots, BsCalendar, BsPerson } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import { generateBookUrl } from '@/utils/bookEncoder';
import Image from 'next/image';
import Link from 'next/link';
import avatar7 from '@/assets/images/avatar/07.jpg';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SharedBookCard = ({ post, onDeletePost }) => {
  const { t, locale } = useLanguage();
  const [bookData, setBookData] = useState(null);
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
    const fetchBookData = async () => {
      if (!post.shared_book_id) {
        setError('Kitap ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/public/books/${post.shared_book_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookData(data);
        } else if (response.status === 404) {
          setError('Kitap bulunamadı');
        } else {
          setError('Kitap yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [post.shared_book_id]);

  const getBookImage = () => {
    if (!bookData) return '/images/book-placeholder.jpg';

    if (bookData.coverUrl) {
      if (bookData.coverUrl.startsWith('/uploads/') || bookData.coverUrl.startsWith('uploads/')) {
        const normalizedPath = bookData.coverUrl.startsWith('/') ? bookData.coverUrl : `/${bookData.coverUrl}`;
        return `${API_BASE_URL}${normalizedPath}`;
      }
      return bookData.coverUrl;
    }

    // Fallback to coverImage if coverUrl is not available
    if (bookData.coverImage) {
      return bookData.coverImage;
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
          <span className="ms-2 text-muted">{t('post.sharedBookLoading')}</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-3 border-0 shadow-sm">
        <CardBody>
          <Alert variant="danger" className="mb-0 border-0">
            <strong>{t('error')}:</strong> {error === 'Kitap yüklenirken bir hata oluştu' ? t('post.bookNotFoundError') : error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!bookData) {
    return null;
  }

  const isOwner = currentUserId && post.user_id && post.user_id === currentUserId;

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
                    {post.user_name || t('common.user')}
                  </span>
                )}
              </h6>
              <small className="text-muted">
                {t('post.userRole')} • {post.timeAgo || new Date(post.created_at).toLocaleDateString()}
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
                    {t('post.removeShare')}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Kitap Paylaşım Başlığı */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                <BsBook size={16} className="text-primary" />
              </div>
              <span className="fw-semibold text-dark">{t('post.sharedBook')}</span>
            </div>
          </div>

          {/* Kitap Kartı */}
          <div className="border-0 rounded-3 p-4 mb-3" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', maxWidth: '100%', overflow: 'hidden' }}>
            <div className="d-flex gap-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              {/* Kitap Kapağı - Improved z-index and positioning */}
              <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                <div className="position-relative">
                  <img
                    src={getBookImage()}
                    alt={bookData.title}
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

              {/* Kitap Detayları */}
              <div className="flex-grow-1" style={{ position: 'relative', zIndex: 1, minWidth: 0, maxWidth: 'calc(100% - 120px)' }}>
                <h5 className="mb-3 fw-bold text-truncate" style={{ color: '#1e3a8a', fontSize: '1.25rem' }}>
                  {bookData.title}
                </h5>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-white bg-opacity-75 rounded-pill px-3 py-1 d-flex align-items-center" style={{ maxWidth: '100%' }}>
                      <BsPerson size={16} className="me-2 text-primary flex-shrink-0" />
                      <span className="small fw-medium text-dark text-truncate">
                        {bookData.author || t('post.authorNotSpecified')}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-75 rounded-pill px-3 py-1 d-flex align-items-center" style={{ maxWidth: '100%' }}>
                      <BsCalendar size={14} className="me-2 text-primary flex-shrink-0" />
                      <span className="small text-dark text-truncate">{formatDate(bookData.publishDate)}</span>
                    </div>
                  </div>
                </div>

                {bookData.description && (
                  <div className="bg-white bg-opacity-75 rounded-3 p-3 mb-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <p className="small text-secondary mb-0" style={{ lineHeight: '1.6', wordBreak: 'break-word' }}>
                      {bookData.description.length > 200
                        ? `${bookData.description.substring(0, 200)}...`
                        : bookData.description
                      }
                    </p>
                  </div>
                )}

                {/* Kitap URL'si */}
                <div className="mb-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <small className="text-dark fw-semibold d-block mb-2">
                    {t('post.bookLink')}:
                  </small>
                  <div className="d-flex align-items-center bg-white rounded-3 p-2 shadow-sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <BsBook size={16} className="me-2 text-primary flex-shrink-0" />
                    <code className="small text-truncate flex-grow-1 me-2 text-dark" style={{ minWidth: 0 }}>
                      {generateBookUrl(post.shared_book_id, window.location.origin, 'tr')?.replace(window.location.origin, '')}
                    </code>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill px-3 flex-shrink-0"
                      onClick={() => {
                        const publicUrl = generateBookUrl(post.shared_book_id, window.location.origin, 'tr');
                        if (publicUrl) {
                          navigator.clipboard.writeText(publicUrl);
                        }
                      }}
                    >
                      {t('post.copy')}
                    </Button>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="d-flex gap-2 flex-wrap" style={{ maxWidth: '100%' }}>
                  {bookData.pdfUrl && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-pill px-4 shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={() => {
                        const fullUrl = bookData.pdfUrl.startsWith('/uploads/')
                          ? `${process.env.NEXT_PUBLIC_API_URL}${bookData.pdfUrl}`
                          : bookData.pdfUrl;
                        window.open(fullUrl, '_blank');
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <BsDownload size={14} className="me-2" />
                      {t('post.downloadPdf')}
                    </Button>
                  )}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill px-4"
                    onClick={() => window.open(`/feed/books/${post.shared_book_id}`, '_blank')}
                  >
                    <BsBook size={14} className="me-2" />
                    {t('post.viewBook')}
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
        title={t('post.deletePost')}
        message={t('post.deletePostConfirm')}
        confirmText={t('post.deleteConfirm')}
        cancelText={t('post.deleteCancel')}
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </>
  );
};

export default SharedBookCard;