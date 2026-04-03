'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsMicFill, BsEnvelope, BsTrash, BsThreeDots, BsClock, BsPerson, BsPlayFill, BsPauseFill, BsCollection, BsSend } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLanguages } from '@/hooks/useLanguages';
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

const SharedPodcastCard = ({ post, onDeletePost, comments = [], onLoadComments, onAddComment, onDeleteComment }) => {
  const { t, locale } = useLanguage();
  const { theme } = useLayoutContext();
  const { showNotification } = useNotificationContext();
  const { userInfo } = useAuthContext();
  const { languages } = useLanguages();
  const isDarkMode = theme === 'dark' || theme === 'green';
  const [podcastData, setPodcastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareMessageModal, setShowShareMessageModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

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
    const fetchPodcastData = async () => {
      if (!post.shared_podcast_id) {
        setError('Podcast ID bulunamadı');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/podcasts/${post.shared_podcast_id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPodcastData(data);
        } else if (response.status === 404) {
          setError('Podcast bulunamadı');
        } else {
          setError('Podcast yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcastData();
  }, [post.shared_podcast_id]);

  useEffect(() => {
    if (podcastData?.audioUrl && audioRef.current) {
      const url = podcastData.audioUrl.startsWith('http') ? podcastData.audioUrl : `${API_BASE_URL}${podcastData.audioUrl.startsWith('/') ? '' : '/'}${podcastData.audioUrl}`;
      audioRef.current.src = url;
    }
  }, [podcastData?.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
      fetch(`${API_BASE_URL}/podcasts/${post.shared_podcast_id}/listen`, { method: 'POST' }).catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const getCoverUrl = () => {
    if (!podcastData) return '/images/podcast-placeholder.jpg';
    const cover = podcastData.coverImage;
    if (!cover) return '/images/podcast-placeholder.jpg';
    if (cover.startsWith('http')) return cover;
    return `${API_BASE_URL}${cover.startsWith('/') ? '' : '/'}${cover}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
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
      <Card className="mb-3 border-0 shadow-sm">
        <CardBody className="text-center py-5">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2 text-muted">{t('post.sharedPodcastLoading')}</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-3 border-0 shadow-sm">
        <CardBody>
          <Alert variant="danger" className="mb-0 border-0">
            <strong>{t('error')}:</strong> {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!podcastData) return null;

  const isOwner = currentUserId && post.user_id && post.user_id === currentUserId;
  const lang = languages?.find(l => (l.code || l.language_code) === locale) || languages?.[0];
  const params = lang ? new URLSearchParams({
    languageId: lang.id,
    languageName: lang.name || lang.language_name || '',
    languageCode: lang.code || lang.language_code || 'tr'
  }) : new URLSearchParams({ languageCode: locale || 'tr' });
  const podcastUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed/podcasts/${post.shared_podcast_id}?${params.toString()}` : '';

  return (
    <>
      <Card className="mb-3 border-0 shadow-sm" style={{ maxWidth: '100%', overflow: 'hidden' }}>
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
                  <span style={{ color: isDarkMode ? '#e9ecef' : '#2c3e50' }}>
                    {post.user_name || t('common.user')}
                  </span>
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

          {/* Podcast Paylaşım Başlığı */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                <BsMicFill size={16} className="text-primary" />
              </div>
              <span className="fw-semibold" style={{ color: isDarkMode ? '#e9ecef' : '#212529' }}>
                {t('post.sharedPodcast')}
              </span>
            </div>
          </div>
          {/* Inline Audio Player - timeline'da dinleme */}
          {podcastData.audioUrl && (
            <div
              className="d-flex align-items-center rounded-pill px-3 py-2 mb-2 mb-sm-3"
              style={{
                background: theme === 'green' ? 'rgba(0, 0, 0, 0.15)' : (isDarkMode ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'),
                boxShadow: isDarkMode ? 'inset 0 1px 1px rgba(255,255,255,0.05)' : 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <audio
                ref={audioRef}
                onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime)}
                onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => showNotification({ title: 'Hata', message: 'Ses yüklenemedi', variant: 'danger' })}
                style={{ display: 'none' }}
              />
              <Button
                variant={isPlaying ? 'primary' : 'outline-primary'}
                size="sm"
                className="rounded-circle p-2 flex-shrink-0"
                style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
              >
                {isPlaying ? <BsPauseFill size={20} /> : <BsPlayFill size={20} />}
              </Button>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="progress rounded-pill"
                  style={{ height: '10px', cursor: 'pointer', minHeight: '24px', touchAction: 'manipulation' }}
                  onClick={handleSeek}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%`,
                      transition: 'width 0.1s linear'
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDuration(Math.floor(audioCurrentTime))}</small>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDuration(Math.floor(audioDuration))}</small>
                </div>
              </div>
            </div>
          )}

          {/* Podcast Kartı */}
          <div
            className="border-0 rounded-3 p-4 mb-3"
            style={{
              background: theme === 'green' ? 'rgba(0, 0, 0, 0.15)' : (isDarkMode ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'),
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <div className="text-center text-sm-start" style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                <div className="position-relative">
                  <img
                    src={getCoverUrl()}
                    alt={podcastData.title}
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
                    onError={(e) => { e.target.src = '/images/podcast-placeholder.jpg'; }}
                  />
                </div>
              </div>

              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <h5 className="mb-2 fw-bold text-truncate" style={{ color: isDarkMode ? '#93c5fd' : '#1e3a8a', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}>
                  {podcastData.title}
                </h5>

                <div className="mb-2">
                  {podcastData.author && (
                    <div className="d-flex align-items-center mb-1">
                      <BsPerson size={14} className="me-2 text-primary flex-shrink-0" />
                      <span className="small text-truncate" style={{ color: isDarkMode ? '#e2e8f0' : '#212529' }}>
                        {podcastData.author}
                      </span>
                    </div>
                  )}
                  {podcastData.duration && (
                    <div className="d-flex align-items-center">
                      <BsClock size={14} className="me-2 text-primary flex-shrink-0" />
                      <span className="small" style={{ color: isDarkMode ? '#e2e8f0' : '#212529' }}>
                        {formatDuration(podcastData.duration)}
                      </span>
                    </div>
                  )}
                </div>

                {podcastData.description && (
                  <p className="small mb-2" style={{
                    lineHeight: '1.5',
                    color: isDarkMode ? '#94a3b8' : '#6c757d',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {podcastData.description}
                  </p>
                )}

                <div className="d-flex gap-1 gap-sm-2 flex-wrap">
                  <Link href={`/feed/podcasts/${post.shared_podcast_id}?${params.toString()}`} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-pill px-4"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      <BsPlayFill size={14} className="me-2" />
                      {t('post.viewPodcast')}
                    </Button>
                  </Link>
                  <Link href="/feed/podcasts">
                    <Button
                      variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                      size="sm"
                      className="rounded-pill px-4"
                    >
                      <BsCollection size={14} className="me-2" />
                      {t('post.viewAllPodcasts')}
                    </Button>
                  </Link>
                  <Button
                    variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                    size="sm"
                    className="rounded-pill px-3"
                    onClick={() => {
                      if (podcastUrl) {
                        navigator.clipboard.writeText(podcastUrl);
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

          {/* Comment section - tema uyumlu */}
          {onAddComment && (
            <div className="comment-section shared-podcast-comments mt-3 pt-3" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
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
                                      <span className="fw-bold me-2" style={{ fontSize: '14px', color: 'var(--bs-body-color)' }}>
                                        {comment.user_name || comment.user_username || comment.username || 'User'}
                                      </span>
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
          id: post.id || post.shared_article_id || post.shared_story_id || post.shared_podcast_id || post.shared_newsletter_id,
          title: post.title || post.user_name || 'Paylaşım',
          caption: post.caption || post.description || '',
          image: post.user_photo_url,
          isUserPost: true,
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

export default SharedPodcastCard;
