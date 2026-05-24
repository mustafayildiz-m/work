'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsNewspaper, BsEnvelope, BsTrash, BsThreeDots, BsCalendar, BsSend } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import CustomConfirmDialog from '@/components/CustomConfirmDialog';
import ShareViaMessageModal from '../modals/ShareViaMessageModal';
import Image from 'next/image';
import Link from 'next/link';
import { getProfilePath } from '@/utils/profileEncoder';
import { getUserIdFromToken } from '@/utils/auth';
import { useAuthContext } from '@/context/useAuthContext';
import avatar7 from '@/assets/images/avatar/07.jpg';
import avatar12 from '@/assets/images/avatar/12.jpg';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SharedNewsletterCard = ({ post, onDeletePost, comments = [], onLoadComments, onAddComment, onDeleteComment }) => {
  const { t, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const { showNotification } = useNotificationContext();
  const { userInfo } = useAuthContext();
  const isDarkMode = theme === 'dark' || theme === 'green';
  const [newsletterData, setNewsletterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareMessageModal, setShowShareMessageModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

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
    const fetchCurrentUserProfile = async () => {
      if (!userInfo?.id) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${userInfo.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            setCurrentUserProfile(data);
          }
        }
      } catch (err) {
        console.error('Error fetching current user profile:', err);
      }
    };
    fetchCurrentUserProfile();
  }, [userInfo?.id]);

  useEffect(() => {
    if (onLoadComments && post?.id) {
      onLoadComments();
    }
  }, [post?.id]);

  const getCurrentUserAvatar = () => {
    if (currentUserProfile?.photoUrl || currentUserProfile?.photo_url) {
      return getImageUrl(currentUserProfile.photoUrl || currentUserProfile.photo_url);
    }
    return typeof avatar12 === 'string' ? avatar12 : (avatar12?.src || '/images/avatar/default.jpg');
  };

  useEffect(() => {
    const fetchNewsletterData = async () => {
      if (!post.shared_newsletter_id) {
        setError('Gazete ID bulunamadı');
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
          setError('Gazete bulunamadı');
        } else {
          setError('Gazete yüklenirken bir hata oluştu');
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
    if (typeof img !== 'string') return '/images/book-placeholder.jpg';
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
          <span className="ms-2 text-muted">{t('post.sharedNewsletterLoading') || 'Gazete yükleniyor...'}</span>
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
              {post.user_id ? (
                <Link
                  href={getProfilePath('user', post.user_id) || '#'}
                  className="d-inline-block text-decoration-none rounded-circle"
                  aria-label={post.user_name || 'User'}
                >
                  <Image
                    className="avatar-img rounded-circle"
                    src={getImageUrl(post.user_photo_url)}
                    alt={post.user_name || 'User'}
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.src = avatar7.src; }}
                  />
                </Link>
              ) : (
                <Image
                  className="avatar-img rounded-circle"
                  src={getImageUrl(post.user_photo_url)}
                  alt={post.user_name || 'User'}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.target.src = avatar7.src; }}
                />
              )}
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
                        <div className="d-flex align-items-center gap-1 me-2">
              <button 
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: '32px', height: '32px', transition: 'all 0.2s', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                title="Mesaj Olarak Gönder"
                onClick={() => setShowShareMessageModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bs-primary)';
                  e.currentTarget.querySelector('svg').style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? 'transparent' : 'var(--bs-light)';
                  e.currentTarget.querySelector('svg').style.color = 'var(--bs-primary)';
                }}
              >
                <BsEnvelope size={15} className="text-primary" style={{ transition: 'color 0.2s' }} />
              </button>
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

          {/* Gazete Paylaşım Başlığı */}
          <div className="d-flex align-items-center mb-2 mb-sm-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
              <BsNewspaper size={16} className="text-primary" />
            </div>
            <span className="fw-semibold" style={{ color: isDarkMode ? '#e9ecef' : '#212529' }}>
              {t('post.sharedNewsletter') || 'Gazete Paylaştı'}
            </span>
          </div>

          {/* Gazete Kartı */}
          <div className="border-0 rounded-3 p-4 mb-3" style={{
            background: theme === 'green' ? 'rgba(0, 0, 0, 0.15)' : (isDarkMode ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%)'),
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
                      {t('post.viewNewsletter') || 'Gazeteyi Oku'}
                    </Button>
                  </Link>
                  <Link href="/feed/newsletters">
                    <Button variant={isDarkMode ? 'outline-light' : 'outline-primary'} size="sm" className="rounded-pill px-4">
                      {t('post.viewAllNewsletters') || 'Tüm Gazeteler'}
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

          {/* Comment section */}
          {onAddComment && (
            <div className="comment-section shared-newsletter-comments mt-3 pt-3" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
              <div className="d-flex mb-3">
                <div className="me-2" style={{ flexShrink: 0 }}>
                  <Image
                    className="rounded-circle"
                    src={getCurrentUserAvatar()}
                    alt={userInfo?.username || userInfo?.name || 'User'}
                    width={36}
                    height={36}
                    style={{ width: '36px', height: '36px', objectFit: 'cover', cursor: 'pointer' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = typeof avatar12 === 'string' ? avatar12 : (avatar12?.src || '/images/avatar/default.jpg');
                    }}
                  />
                </div>
                <div className="comment-input-container flex-grow-1 position-relative">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const commentText = e.target.comment?.value?.trim();
                      if (commentText && onAddComment && post?.id) {
                        const currentScrollPosition = window.scrollY;
                        onAddComment(post.id, commentText);
                        e.target.comment.value = '';
                        setTimeout(() => window.scrollTo(0, currentScrollPosition), 100);
                      }
                    }}
                  >
                    <textarea
                      name="comment"
                      className="comment-textarea w-100"
                      rows={1}
                      placeholder={t('post.addCommentPlaceholder')}
                      maxLength={500}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                    />
                    <button className="comment-send-button" type="submit">
                      <span>{t('post.comment')}</span>
                      <BsSend />
                    </button>
                  </form>
                </div>
              </div>

              <div className="comments-list mt-3">
                {comments && comments.length > 0 ? (
                  <>
                    {(() => {
                      const reversedComments = [...comments].reverse();
                      const visibleComments = showAllComments ? reversedComments : reversedComments.slice(0, 3);
                      return (
                        <>
                          {visibleComments.map((comment, index) => (
                            <div key={comment.id || index} className="comment-item d-flex align-items-start mb-3">
                              <div className="me-2 flex-shrink-0">
                                {comment.user_id ? (
                                  <Link
                                    href={getProfilePath('user', comment.user_id) || '#'}
                                    className="d-inline-block text-decoration-none rounded-circle"
                                    aria-label={comment.user_name || comment.user_username || comment.username || 'User'}
                                  >
                                    <Image
                                      className="rounded-circle"
                                      src={getImageUrl(comment.user_photo_url || comment.user_avatar || comment.avatar) || (typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg'))}
                                      alt={comment.user_name || comment.user_username || comment.username || 'User'}
                                      width={36}
                                      height={36}
                                      style={{ width: '36px', height: '36px', objectFit: 'cover', display: 'block' }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                                      }}
                                    />
                                  </Link>
                                ) : (
                                  <Image
                                    className="rounded-circle"
                                    src={getImageUrl(comment.user_photo_url || comment.user_avatar || comment.avatar) || (typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg'))}
                                    alt={comment.user_name || comment.user_username || comment.username || 'User'}
                                    width={36}
                                    height={36}
                                    style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                                    }}
                                  />
                                )}
                              </div>
                              <div className="comment-content flex-grow-1">
                                <div
                                  className="comment-bubble"
                                  style={{
                                    backgroundColor: 'var(--bs-secondary-bg)',
                                    borderRadius: '16px',
                                    padding: '10px 14px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid var(--bs-border-color)'
                                  }}
                                >
                                  <div className="comment-header d-flex align-items-center justify-content-between mb-1">
                                    <div className="d-flex align-items-center flex-wrap">
                                      {comment.user_id ? (
                                        <Link
                                          href={getProfilePath('user', comment.user_id) || '#'}
                                          className="fw-bold me-2 text-decoration-none"
                                          style={{ fontSize: '14px', color: 'var(--bs-body-color)' }}
                                        >
                                          {comment.user_name || comment.user_username || comment.username || 'User'}
                                        </Link>
                                      ) : (
                                        <span className="fw-bold me-2" style={{ fontSize: '14px', color: 'var(--bs-body-color)' }}>
                                          {comment.user_name || comment.user_username || comment.username || 'User'}
                                        </span>
                                      )}
                                      <small className="text-muted" style={{ fontSize: '11px' }}>
                                        {comment.created_at ? new Date(comment.created_at).toLocaleString('tr-TR', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : ''}
                                      </small>
                                    </div>
                                    {(() => {
                                      const uid = getUserIdFromToken();
                                      const isOwnComment = uid && comment.user_id && (uid.toString() === comment.user_id.toString() || uid === comment.user_id);
                                      return isOwnComment && onDeleteComment ? (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                                          onClick={() => {
                                            setCommentToDelete({ id: comment.id, postId: post.id });
                                            setShowCommentDeleteConfirm(true);
                                          }}
                                          title={t('post.deleteCommentTitle')}
                                          style={{ fontSize: '14px', textDecoration: 'none' }}
                                        >
                                          <BsTrash />
                                        </button>
                                      ) : null;
                                    })()}
                                  </div>
                                  <div className="comment-text mt-1" style={{ fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word', color: 'var(--bs-body-color)' }}>
                                    {comment.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {!showAllComments && comments.length > 3 && (
                            <div className="text-center mt-2">
                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none comment-theme-link"
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                onClick={() => setShowAllComments(true)}
                              >
                                {t('post.viewAllComments', { count: comments.length - 3 }) || `Tüm yorumları gör (${comments.length - 3} daha)`}
                              </button>
                            </div>
                          )}
                          {showAllComments && comments.length > 3 && (
                            <div className="text-center mt-2">
                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none comment-theme-link"
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                onClick={() => setShowAllComments(false)}
                              >
                                {t('post.hideComments') || 'Yorumları gizle'}
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="text-center text-muted py-2">
                    <small>{t('post.noCommentsYet')}</small>
                  </div>
                )}
              </div>
            </div>
          )}
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

            <ShareViaMessageModal 
        show={showShareMessageModal} 
        onHide={() => setShowShareMessageModal(false)}
        postDataPayload={{
          id: post.shared_newsletter_id,
          postType: 'newsletter',
          title: newsletterData?.title || 'Gazete',
          caption: newsletterData?.intro || newsletterData?.description || '',
          image: getNewsletterImage(),
          isUserPost: false,
          authorName: post.user_name,
          authorAvatar: post.user_photo_url
        }}
      />

      <CustomConfirmDialog
        show={showCommentDeleteConfirm}
        onCancel={() => {
          setShowCommentDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        onConfirm={() => {
          if (commentToDelete && onDeleteComment) {
            onDeleteComment(commentToDelete.id, commentToDelete.postId);
          }
          setShowCommentDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        title={t('post.deleteCommentTitle')}
        message={t('post.deleteCommentMessage')}
        confirmText={t('post.deleteCommentConfirm')}
        cancelText={t('post.deleteCommentCancel')}
        type="danger"
      />
    </>
  );
};

export default SharedNewsletterCard;
