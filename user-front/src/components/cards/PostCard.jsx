import { timeSince, timeSinceTurkish, getTimeSince } from '@/utils/date';
import Image from 'next/image';
import { Card, CardBody, CardFooter, CardHeader, Col, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap';
import { BsBookmark, BsBookmarkCheck, BsBookmarkFill, BsChatFill, BsEnvelope, BsFlag, BsLink, BsPencilSquare, BsPersonX, BsReplyFill, BsSendFill, BsShare, BsSlashCircle, BsThreeDots, BsXCircle, BsTrash, BsPencil, BsChat, BsSend, BsX } from 'react-icons/bs';
import GlightBox from '../GlightBox';
import LoadContentButton from '../LoadContentButton';
import CommentItem from './components/CommentItem';
import Link from 'next/link';
import avatar12 from '@/assets/images/avatar/12.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import postImg3 from '@/assets/images/post/1by1/03.jpg';
import postImg1 from '@/assets/images/post/3by2/01.jpg';
import postImg2 from '@/assets/images/post/3by2/02.jpg';
import VideoPlayer from './components/VideoPlayer';
import { useState, useEffect } from 'react';
import { getUserIdFromToken } from '@/utils/auth';
import CustomConfirmDialog from '../CustomConfirmDialog';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useAuthContext } from '@/context/useAuthContext';
import { encodePostId } from '@/utils/encoding';

const ActionMenu = ({
  name,
  postId,
  isOwnPost,
  isUserPost,
  onUnfollow,
  onDeletePost,
  onEditPost,
  onHidePost,
  onBlock,
  onReportPost,
  onSavePost,
  onAddComment,
  isDeleting
}) => {
  const { t } = useLanguage();

  return <Dropdown>
    <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
      <BsThreeDots />
    </DropdownToggle>

    <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
      {/* Gönderiyi kaydet - yorum satırına alındı */}
      {/* <li>
          <DropdownItem href="#" onClick={onSavePost}>
            {' '}
            <BsBookmark size={22} className="fa-fw pe-2" />
            Gönderiyi kaydet
          </DropdownItem>
        </li> */}

      {/* Yorum yap - yorum satırına alındı (sadece kullanıcı gönderileri için) */}
      {/* {isUserPost && (
          <li>
            <DropdownItem href="#" onClick={onAddComment}>
              {' '}
              <BsChat size={22} className="fa-fw pe-2" />
              Yorum yap
            </DropdownItem>
          </li>
        )} */}

      {!isOwnPost ? (
        // Show unfollow option for posts not owned by current user
        <li>
          <DropdownItem
            href="#"
            onClick={() => {
              if (onUnfollow) {
                onUnfollow();
              } else {
                // console.error('onUnfollow function not provided');
              }
            }}
          >
            {' '}
            <BsPersonX size={22} className="fa-fw pe-2" />
            {name} {t('post.unfollowUser')}
          </DropdownItem>
        </li>
      ) : (
        // Show edit and delete options for posts owned by current user
        <>
          <li>
            <DropdownItem
              href="#"
              onClick={() => {
                if (onEditPost) {
                  onEditPost(postId);
                } else {
                  // console.error('onEditPost function not provided');
                }
              }}
              className="text-primary"
            >
              {' '}
              <BsPencil size={22} className="fa-fw pe-2" />
              {t('post.editPost')}
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              href="#"
              onClick={() => {
                if (onDeletePost) {
                  onDeletePost(postId);
                } else {
                  // console.error('onDeletePost function not provided');
                }
              }}
              className="text-danger"
              disabled={isDeleting}
            >
              {' '}
              <BsTrash size={22} className="fa-fw pe-2" />
              {isDeleting ? `${t('post.deletePost')}...` : t('post.deletePost')}
            </DropdownItem>
          </li>
        </>
      )}

      {/* Gönderiyi gizle - yorum satırına alındı */}
      {/* <li>
          <DropdownItem href="#" onClick={onHidePost}>
            {' '}
            <BsXCircle size={22} className="fa-fw pe-2" />
            Gönderiyi gizle
          </DropdownItem>
        </li> */}

      {/* Engelle - yorum satırına alındı */}
      {/* <li>
          <DropdownItem href="#" onClick={onBlock}>
            {' '}
            <BsSlashCircle size={22} className="fa-fw pe-2" />
            Engelle
          </DropdownItem>
        </li> */}

      {/* Gönderiyi şikayet et - yorum satırına alındı */}
      {/* <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem href="#" onClick={onReportPost}>
            {' '}
            <BsFlag size={22} className="fa-fw pe-2" />
            Gönderiyi şikayet et
          </DropdownItem>
        </li> */}
    </DropdownMenu>
  </Dropdown>;
};

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const PostCard = ({
  createdAt,
  timeAgo,
  title,
  likesCount,
  caption,
  commentsCount,
  image,
  video,
  socialUser,
  photos,
  isVideo,
  isUserPost,
  postId,
  isOwnPost,
  onUnfollow,
  onDeletePost,
  onEditPost,
  onHidePost,
  onBlock,
  onReportPost,
  onSavePost,
  onAddComment,
  onDeleteComment,
  comments = [],
  onLoadComments,
  isDeleting,
  fileUrls = [],
  isSharedPost = false,
  originalUser = null,
  translations = null,  // Yeni prop: Scholar post translations
  onLanguageChange = null,  // Callback: Dil değiştiğinde
  status = null  // Post status: 'pending', 'approved', 'rejected'
}) => {
  const { t, locale } = useLanguage();
  const { showNotification } = useNotificationContext();
  const { userInfo } = useAuthContext();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Aktif dili belirle - translations'dan caption'ı bul
  const activeLanguage = translations?.find(trans => trans.content === caption)?.language || 'tr';
  const [isSharing, setIsSharing] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [isShared, setIsShared] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Get current user's profile picture
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!userInfo?.id) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userInfo.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            setCurrentUserProfile(data);
          }
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };

    fetchCurrentUserProfile();
  }, [userInfo?.id]);

  // Get current user's avatar
  const getCurrentUserAvatar = () => {
    if (currentUserProfile?.photoUrl || currentUserProfile?.photo_url) {
      return getImageUrl(currentUserProfile.photoUrl || currentUserProfile.photo_url);
    }
    // Fallback to default avatar
    return avatar12;
  };

  // Share post function (for both user and scholar posts)
  const handleSharePost = async () => {
    try {
      setIsSharing(true);
      const token = localStorage.getItem('token');

      // Check if postId is valid
      if (!postId) {
        console.error('Invalid postId:', postId);
        showNotification({
          title: 'Hata!',
          message: 'Geçersiz gönderi ID\'si',
          variant: 'danger',
          delay: 4000
        });
        return;
      }

      // Determine post type based on postId format and isUserPost prop
      // UUID format = scholar post, integer format = user post
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
      const isScholarPost = isUUID || !isUserPost;

      // Backend expects: 1 = 'scholar', 2 = 'user'
      const postTypeNumber = isScholarPost ? 1 : 2;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: postId, // Keep as string for scholar posts (UUID), integer for user posts
          post_type: postTypeNumber
        })
      });

      if (response.ok) {
        setIsShared(true);
        setShareCount(prev => prev + 1);

        // Reload share data to get accurate count
        try {
          await loadShareData();
        } catch (loadError) {
          console.error('LoadShareData error after share:', loadError);
          // Don't show error notification for this, just log it
        }

        showNotification({
          title: 'Başarılı!',
          message: 'Gönderi başarıyla paylaşıldı!',
          variant: 'success',
          delay: 3000
        });
      } else {
        const errorData = await response.json();
        console.error('Paylaşım hatası:', errorData.message);
        showNotification({
          title: 'Hata!',
          message: errorData.message || 'Paylaşım sırasında bir hata oluştu',
          variant: 'danger',
          delay: 4000
        });
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      showNotification({
        title: 'Hata!',
        message: 'Paylaşım sırasında bir hata oluştu',
        variant: 'danger',
        delay: 4000
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Unshare post function (for both user and scholar posts)
  const handleUnsharePost = async () => {
    try {
      setIsSharing(true);
      const token = localStorage.getItem('token');

      // Determine post type based on postId format and isUserPost prop
      // UUID format = scholar post, integer format = user post
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
      const isScholarPost = isUUID || !isUserPost;

      // Backend expects: '1' = 'scholar', '2' or 'user' = 'user'
      const postTypeParam = isScholarPost ? '1' : 'user';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares/${postId}?post_type=${postTypeParam}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();

        setIsShared(false);
        setShareCount(prev => Math.max(0, prev - 1));

        // Reload share data to get accurate count
        try {
          await loadShareData();
        } catch (loadError) {
          console.error('LoadShareData error after unshare:', loadError);
          // Don't show error notification for this, just log it
        }

        showNotification({
          title: 'Başarılı!',
          message: responseData.message || 'Paylaşım kaldırıldı!',
          variant: 'success',
          delay: 3000
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Paylaşım kaldırma hatası:', errorData);
        showNotification({
          title: 'Hata!',
          message: errorData.message || 'Paylaşım kaldırılırken bir hata oluştu',
          variant: 'danger',
          delay: 4000
        });
      }
    } catch (error) {
      console.error('Paylaşım kaldırma hatası:', error);
      showNotification({
        title: 'Hata!',
        message: 'Paylaşım kaldırılırken bir hata oluştu',
        variant: 'danger',
        delay: 4000
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Copy link function
  const handleCopyLink = () => {
    // Encode the post ID for the URL
    const encodedId = encodePostId(postId);
    // Get current language from context or default to 'tr'
    const currentLang = locale || 'tr';
    // Add post type: 1 for scholar posts, 2 for user posts
    const postType = isUserPost ? '2' : '1';
    const postUrl = `${window.location.origin}/post/${encodedId}?lang=${currentLang}&type=${postType}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      showNotification({
        title: 'Başarılı!',
        message: 'Gönderi linki kopyalandı!',
        variant: 'success',
        delay: 2000
      });
    }).catch(() => {
      showNotification({
        title: 'Hata!',
        message: 'Link kopyalanamadı',
        variant: 'danger',
        delay: 3000
      });
    });
  };

  // Load initial share data (for both user and scholar posts)
  const loadShareData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Determine post type based on postId format and isUserPost prop
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
      const isScholarPost = isUUID || !isUserPost;
      const postTypeParam = isScholarPost ? '1' : 'user';

      // Check if user has shared this post
      const [shareStatusResponse, shareCountResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares/check/${postId}?post_type=${postTypeParam}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-post-shares/post/${postId}/count?post_type=${postTypeParam}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (shareStatusResponse.ok) {
        const shareStatus = await shareStatusResponse.json();
        setIsShared(shareStatus.isShared);
      }

      if (shareCountResponse.ok) {
        const shareCountData = await shareCountResponse.json();
        setShareCount(shareCountData.count);
      }
    } catch (error) {
      console.error('Share data yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    loadShareData();
  }, [postId, isUserPost]);

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl, bustCache = false) => {
    const defaultAvatar = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');

    // If photoUrl is missing or invalid
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined' || photoUrl === '') {
      return defaultAvatar;
    }

    // If photoUrl is an object (imported image), return its src property
    if (typeof photoUrl === 'object') {
      return photoUrl.src || defaultAvatar;
    }

    // Ensure photoUrl is a string before using string methods
    if (typeof photoUrl !== 'string') {
      return defaultAvatar;
    }

    // If it's already an absolute URL, return as is (with cache busting if needed)
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return bustCache ? `${photoUrl}?t=${Date.now()}` : photoUrl;
    }

    // If it starts with /uploads/, add API base URL
    if (photoUrl.startsWith('/uploads/')) {
      // Use the correct API URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const fullUrl = `${apiBaseUrl}${photoUrl}`;
      if (process.env.NODE_ENV === 'development') {
      }
      return bustCache ? `${fullUrl}?t=${Date.now()}` : fullUrl;
    }

    // If it starts with uploads/ (without leading slash), add API base URL with slash
    if (photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const fullUrl = `${apiBaseUrl}/${photoUrl}`;
      if (process.env.NODE_ENV === 'development') {
      }
      return bustCache ? `${fullUrl}?t=${Date.now()}` : fullUrl;
    }

    // For any other relative URL, add API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const fullUrl = `${apiBaseUrl}/${photoUrl}`;
    if (process.env.NODE_ENV === 'development') {
    }
    return bustCache ? `${fullUrl}?t=${Date.now()}` : fullUrl;
  };

  // Helper function to get proper video URL
  const getVideoUrl = (videoUrl) => {
    if (process.env.NODE_ENV === 'development') {
    }
    if (!videoUrl || typeof videoUrl !== 'string') return null;

    // If it's already an absolute URL, return as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }

    // If it starts with /uploads/, add API base URL
    if (videoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${videoUrl}`;
    }

    // If it starts with uploads/ (without leading slash), add API base URL with slash
    if (videoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}/${videoUrl}`;
    }

    // For any other relative URL, add API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${apiBaseUrl}/${videoUrl}`;
  };

  // Simple HTML sanitization function
  const sanitizeHtml = (html) => {
    if (!html) return '';

    // Remove potentially dangerous tags and attributes
    return html
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove iframe tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove object tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      // Remove embed tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      // Remove on* attributes (event handlers)
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove data: URLs
      .replace(/data:/gi, '');
  };

  // Helper function to check if a file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  // State for image preview modal
  const [selectedImage, setSelectedImage] = useState(null);

  // Debug props (development only)
  if (process.env.NODE_ENV === 'development') {
  }

  // State for comment delete confirmation
  const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  return <>
    <Card style={{
      borderRadius: isSharedPost ? '0 0 12px 12px' : '12px',
      overflow: 'hidden'
    }}>
      {/* Shared Post Indicator - Facebook Style */}
      {isSharedPost && originalUser && (
        <div className="px-3 py-3" style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #dee2e6',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div className="d-flex align-items-center">
            <div className="me-3" style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
            }}>
              <BsShare className="text-white" style={{ fontSize: '14px' }} />
            </div>
            <div>
              <div className="d-flex align-items-center">
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                  {originalUser.firstName} {originalUser.lastName}
                </span>
                <span className="text-muted ms-2" style={{ fontSize: '13px' }}>
                  {t('post.sharedBy')}
                </span>
              </div>
              <div className="text-muted small" style={{ fontSize: '12px', marginTop: '2px' }}>
                <i className="fas fa-clock me-1"></i>
                {createdAt ? getTimeSince(new Date(createdAt), t, locale) : t('time.justNow')}
              </div>
            </div>
          </div>
        </div>
      )}

      <CardHeader className="border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ flexShrink: 0 }}>
              <span role="button">
                <img
                  className="rounded-circle"
                  src={getImageUrl(isUserPost ? socialUser?.avatar : socialUser?.photoUrl)}
                  alt={isUserPost ? (socialUser?.name || 'User') : (socialUser?.fullName || 'Scholar')}
                  style={{
                    width: '44px',
                    height: '44px',
                    objectFit: 'cover',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onError={(e) => {
                    if (process.env.NODE_ENV === 'development') {
                      // console.error('Avatar failed to load:', e.target.src);
                    }
                    e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 231, 160, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </span>
            </div>

            <div>
              <div className="nav nav-divider">
                <h6 className="nav-item card-title mb-0 d-flex align-items-center gap-2">
                  {' '}
                  {socialUser?.id ? (
                    <Link
                      href={isUserPost ? `/profile/user/${socialUser?.id}` : `/profile/scholar/${socialUser?.id}`}
                      className="text-decoration-none"
                    >
                      {isUserPost ? (socialUser?.name || t('post.userRole')) : (socialUser?.fullName || t('post.scholarRole'))}
                    </Link>
                  ) : (
                    <span className="text-decoration-none">
                      {isUserPost ? (socialUser?.name || t('post.userRole')) : (socialUser?.fullName || t('post.scholarRole'))}
                    </span>
                  )}
                  {status === 'pending' && isOwnPost && (
                    <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                      {t('feed.postPending')}
                    </span>
                  )}
                </h6>
                <span className="nav-item small"> {createdAt ? getTimeSince(createdAt, t) : ''}</span>
              </div>
              {/* Show "Kullanıcı" for user posts, "Alim" for scholar posts */}
              {isUserPost ? (
                <p className="mb-0 small">
                  {socialUser?.role === 'admin' ? 'Yönetici' :
                    socialUser?.role === 'moderator' ? 'Moderatör' :
                      t('post.userRole')}
                </p>
              ) : (
                <p className="mb-0 small">{t('post.scholarRole')}</p>
              )}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {!isSharedPost && (
              <ActionMenu
                name={isUserPost ? socialUser?.name : socialUser?.fullName}
                postId={postId}
                isOwnPost={isOwnPost}
                isUserPost={isUserPost}
                onUnfollow={onUnfollow}
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
                onHidePost={onHidePost}
                onBlock={onBlock}
                onReportPost={onReportPost}
                onSavePost={onSavePost}
                onAddComment={onAddComment}
                comments={comments}
                onLoadComments={onLoadComments}
                isDeleting={isDeleting}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {title && (
          <h6 className="mb-3 fw-bold">
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
            />
          </h6>
        )}

        {caption && (
          <div
            className="mb-3"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(caption) }}
          />
        )}

        {image && (
          <Image
            className="card-img"
            src={getImageUrl(image)}
            alt="Gönderi"
            width={600}
            height={400}
            style={{ width: '100%', height: 'auto' }}
            onError={(e) => {
              if (process.env.NODE_ENV === 'development') {
                // console.error('Post image failed to load:', e.target.src);
              }
            }}
          />
        )}

        {video && (
          <div className="mb-3">
            <video
              className="card-img w-100 rounded"
              controls
              preload="metadata"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => {
                if (process.env.NODE_ENV === 'development') {
                  // console.error('Video failed to load:', e.target.src);
                }
              }}
            >
              <source src={getVideoUrl(video)} type="video/mp4" />
              <source src={getVideoUrl(video)} type="video/avi" />
              <source src={getVideoUrl(video)} type="video/mov" />
              <source src={getVideoUrl(video)} type="video/wmv" />
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          </div>
        )}

        {fileUrls && fileUrls.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-2">Ekli Dosyalar:</h6>
            <div className="d-flex flex-wrap gap-2">
              {fileUrls.map((fileUrl, index) => {
                const fileName = fileUrl.split('/').pop();
                const fileExtension = fileName.split('.').pop().toLowerCase();
                const fullFileUrl = getImageUrl(fileUrl);
                const isImage = isImageFile(fileName);

                return (
                  <div key={index}>
                    {isImage ? (
                      // Image files - show only the image
                      <div className="mb-2">
                        <Image
                          src={fullFileUrl}
                          alt={fileName}
                          width={300}
                          height={200}
                          className="img-fluid rounded"
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            height: '200px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          onClick={() => setSelectedImage(fullFileUrl)}
                          onError={(e) => {
                            if (process.env.NODE_ENV === 'development') {
                              // console.error('File image failed to load:', e.target.src);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      // Non-image files - show file info with buttons
                      <div className="border rounded p-3 mb-2" style={{ minWidth: '200px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-2">
                            {fileExtension === 'pdf' && <span className="text-danger fs-4">📄</span>}
                            {fileExtension === 'docx' && <span className="text-primary fs-4">📝</span>}
                            <span className="text-secondary fs-4">📎</span>
                          </div>
                          <div className="flex-grow-1">
                            <small className="d-block fw-bold">{fileName}</small>
                            <small className="text-muted">{fileExtension.toUpperCase()}</small>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <a
                            href={fullFileUrl}
                            download
                            className="btn btn-sm btn-primary"
                          >
                            İndir
                          </a>
                          <a
                            href={fullFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Aç
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {photos && photos.length > 0 && (
          <div className="d-flex justify-content-between">
            <Row className="g-3">
              {photos.slice(0, 3).map((photo, index) => (
                <Col xs={6} key={index}>
                  <GlightBox className="h-100" href={getImageUrl(photo)} data-gallery="image-popup">
                    <Image
                      className="rounded img-fluid"
                      src={getImageUrl(photo)}
                      alt="Post Image"
                      width={200}
                      height={150}
                      style={{ width: '100%', height: 'auto' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </GlightBox>
                </Col>
              ))}
              {photos.length > 3 && (
                <Col xs={6}>
                  <div className="position-relative bg-dark mt-3 rounded">
                    <div className="hover-actions-item position-absolute top-50 start-50 translate-middle z-index-9">
                      <Link className="btn btn-link text-white" href="">
                        {' '}
                        Tümünü gör ({photos.length - 3} daha){' '}
                      </Link>
                    </div>
                    <GlightBox href={getImageUrl(photos[3])} data-glightbox data-gallery="image-popup">
                      <Image
                        className="img-fluid opacity-50 rounded"
                        src={getImageUrl(photos[3])}
                        alt="More images"
                        width={200}
                        height={150}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </GlightBox>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
        {isVideo && <VideoPlayer />}

        {/* Dil Seçici - Sadece scholar posts ve translations varsa göster */}
        {!isUserPost && translations && translations.length > 1 && (
          <div className="d-flex gap-2 flex-wrap mb-3 pb-2 border-bottom">
            {translations.map((trans) => {
              const langInfo = LANGUAGES.find(l => l.code === trans.language);
              return (
                <button
                  key={trans.language}
                  onClick={() => onLanguageChange && onLanguageChange(trans.language)}
                  className={`btn btn-sm ${trans.language === activeLanguage ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontWeight: trans.language === activeLanguage ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={langInfo?.name}
                >
                  <span style={{ fontSize: '1rem' }}>{langInfo?.flag || ''}</span>
                  <span>{trans.language.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        )}

        <ul className="nav nav-stack py-3 small">
          {/* Like button removed temporarily */}
          {/**
           * <li className="nav-item">
            <Link className="nav-link icons-center" href="">
              {' '}
              <BsChatFill size={18} className="pe-1" />
              Yorumlar ({commentsCount})
            </Link>
          </li>
           * 
           */}
          {/* Kaydet butonu - yorum satırına alındı */}
          {/* <li className="nav-item">
            <Link className="nav-link icons-center" href="">
              {' '}
              <BsBookmarkFill size={18} className="pe-1" />
              {t('post.saved')} ({commentsCount})
            </Link>
          </li> */}

          <Dropdown className="nav-item ms-sm-auto">
            <DropdownToggle as="a" className="nav-link mb-0 content-none icons-center cursor-pointer" id="cardShareAction" data-bs-toggle="dropdown" aria-expanded="false">
              <BsReplyFill size={16} className="flip-horizontal ps-1" />
              {t('post.shareCount')} ({shareCount})
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardShareAction">
              <li>
                <DropdownItem href="#" onClick={handleCopyLink}>
                  {' '}
                  <BsLink size={22} className="fa-fw pe-2" />
                  {t('post.copyPostLink')}
                </DropdownItem>
              </li>
              {/* Show share functionality for both user and scholar posts */}
              {isShared ? (
                <li>
                  <DropdownItem href="#" onClick={handleUnsharePost} disabled={isSharing}>
                    {' '}
                    <BsXCircle size={22} className="fa-fw pe-2" />
                    {isSharing ? t('post.unsharing') : t('post.unsharePost')}
                  </DropdownItem>
                </li>
              ) : (
                <li>
                  <DropdownItem href="#" onClick={handleSharePost} disabled={isSharing}>
                    {' '}
                    <BsShare size={22} className="fa-fw pe-2" />
                    {isSharing ? t('post.sharing') : t('post.shareToFeed')}
                  </DropdownItem>
                </li>
              )}
            </DropdownMenu>
          </Dropdown>
        </ul>
        {/* Show comment section only for user posts (not scholar posts) */}
        {isUserPost && (
          <div className="comment-section">
            <div className="d-flex mb-3">
              <div className="me-2" style={{ flexShrink: 0 }}>
                <span role="button">
                  <Image
                    className="rounded-circle"
                    src={getCurrentUserAvatar()}
                    alt={userInfo?.username || userInfo?.name || 'User'}
                    width={36}
                    height={36}
                    style={{
                      width: '36px',
                      height: '36px',
                      objectFit: 'cover',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = typeof avatar12 === 'string' ? avatar12 : (avatar12?.src || '/images/avatar/default.jpg');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 231, 160, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </span>
              </div>

              <div className="comment-input-container flex-grow-1 position-relative">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const commentText = e.target.comment.value.trim();
                  if (commentText && onAddComment) {

                    // Save current scroll position
                    const currentScrollPosition = window.scrollY;

                    // Add comment
                    onAddComment(postId, commentText);
                    e.target.comment.value = '';

                    // Restore scroll position after a short delay
                    setTimeout(() => {
                      window.scrollTo(0, currentScrollPosition);
                    }, 100);
                  } else {
                  }
                }}>
                  <textarea
                    name="comment"
                    className="comment-textarea w-100"
                    rows={1}
                    placeholder={t('post.addCommentPlaceholder')}
                    maxLength={500}
                    onInput={(e) => {
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    className="comment-send-button"
                    type="submit"
                  >
                    <span>{t('post.comment')}</span>
                    <BsSend />
                  </button>
                </form>
              </div>
            </div>

            {/* Comments List */}
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
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  objectFit: 'cover',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  cursor: 'pointer'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.08)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(181, 231, 160, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                            <div className="comment-content flex-grow-1">
                              <div
                                className="comment-bubble"
                                style={{
                                  backgroundColor: 'var(--bs-secondary-bg, #f8f9fa)',
                                  borderRadius: '16px',
                                  padding: '10px 14px',
                                  position: 'relative',
                                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                  border: '1px solid var(--bs-border-color, #e9ecef)',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <div className="comment-header d-flex align-items-center justify-content-between mb-1">
                                  <div className="d-flex align-items-center flex-wrap">
                                    <span className="fw-bold me-2" style={{ fontSize: '14px' }}>
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
                                  {/* Delete comment button - only show for own comments */}
                                  {(() => {
                                    const currentUserId = getUserIdFromToken();
                                    const commentUserId = comment.user_id;

                                    // Check if current user is the comment author
                                    const isOwnComment = currentUserId && commentUserId &&
                                      (currentUserId.toString() === commentUserId.toString() ||
                                        currentUserId === commentUserId);

                                    return isOwnComment && onDeleteComment ? (
                                      <button
                                        className="btn btn-sm btn-link text-danger p-0 ms-2"
                                        onClick={() => {
                                          setCommentToDelete({ id: comment.id, postId: postId });
                                          setShowCommentDeleteConfirm(true);
                                        }}
                                        title="Yorumu sil"
                                        style={{
                                          fontSize: '14px',
                                          textDecoration: 'none'
                                        }}
                                      >
                                        <BsTrash />
                                      </button>
                                    ) : null;
                                  })()}
                                </div>
                                <div className="comment-text mt-1" style={{
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: 'var(--bs-body-color)',
                                  wordBreak: 'break-word'
                                }}>
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {!showAllComments && comments.length > 3 && (
                          <div className="text-center mt-2">
                            <button
                              className="btn btn-link text-muted p-0 text-decoration-none"
                              style={{ fontSize: '0.9rem', fontWeight: '500' }}
                              onClick={() => setShowAllComments(true)}
                            >
                              Tüm yorumları gör ({comments.length - 3} daha)
                            </button>
                          </div>
                        )}

                        {showAllComments && comments.length > 3 && (
                          <div className="text-center mt-2">
                            <button
                              className="btn btn-link text-muted p-0 text-decoration-none"
                              style={{ fontSize: '0.9rem', fontWeight: '500' }}
                              onClick={() => setShowAllComments(false)}
                            >
                              Yorumları gizle
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

        {/**
         * <ul className="comment-wrap list-unstyled">
          {comments.map(comment => <CommentItem {...comment} key={comment.id} />)}
        </ul>
         * 
         */}
      </CardBody>

      {/* <CardFooter className="border-0 pt-0">{comments && <LoadContentButton name="Daha fazla yorum yükle" />}</CardFooter> */}
    </Card>

    {/* Comment Delete Confirmation Dialog */}
    <CustomConfirmDialog
      show={showCommentDeleteConfirm}
      onConfirm={() => {
        if (commentToDelete && onDeleteComment) {
          onDeleteComment(commentToDelete.id, commentToDelete.postId);
        }
        setShowCommentDeleteConfirm(false);
        setCommentToDelete(null);
      }}
      onCancel={() => {
        setShowCommentDeleteConfirm(false);
        setCommentToDelete(null);
      }}
      title={t('post.deleteCommentTitle')}
      message={t('post.deleteCommentMessage')}
      confirmText={t('post.deleteCommentConfirm')}
      cancelText={t('post.deleteCommentCancel')}
      type="danger"
    />

    {/* Image Preview Modal */}
    {selectedImage && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999
        }}
        onClick={() => setSelectedImage(null)}
      >
        <div className="position-relative">
          <button
            className="btn btn-light position-absolute top-0 end-0 m-2"
            style={{ zIndex: 10000 }}
            onClick={() => setSelectedImage(null)}
          >
            <BsX size={24} />
          </button>
          <Image
            src={selectedImage}
            alt="Önizleme"
            width={800}
            height={600}
            className="img-fluid"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )}
  </>;
};

export default PostCard;
