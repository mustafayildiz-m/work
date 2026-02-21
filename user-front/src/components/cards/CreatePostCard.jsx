'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button, Card, Col, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalFooter, ModalHeader, OverlayTrigger, Row, Tooltip, Spinner } from 'react-bootstrap';
import { BsBookmarkCheck, BsCalendar2EventFill, BsCameraReels, BsCameraReelsFill, BsCameraVideoFill, BsEmojiSmileFill, BsEnvelope, BsFileEarmarkText, BsGeoAltFill, BsImageFill, BsImages, BsPencilSquare, BsTagFill, BsThreeDots, BsCheckCircleFill } from 'react-icons/bs';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useToggle from '@/hooks/useToggle';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useAuthContext } from '@/context/useAuthContext';
import DropzoneFormInput from '../form/DropzoneFormInput';
import TextFormInput from '../form/TextFormInput';
import TextAreaFormInput from '../form/TextAreaFormInput';
import DateFormInput from '../form/DateFormInput';
import avatar1 from '@/assets/images/avatar/01.jpg';
import avatar2 from '@/assets/images/avatar/02.jpg';
import avatar3 from '@/assets/images/avatar/03.jpg';
import avatar4 from '@/assets/images/avatar/04.jpg';
import avatar5 from '@/assets/images/avatar/05.jpg';
import avatar6 from '@/assets/images/avatar/06.jpg';
import avatar7 from '@/assets/images/avatar/07.jpg';
import ChoicesFormInput from '../form/ChoicesFormInput';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const FilePreview = ({ fileUrls, onRemove }) => {
  const { t } = useLanguage();
  if (fileUrls.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center mb-3">
        <div className="icon-shape icon-xs rounded-circle bg-success bg-opacity-10 text-success me-2">
          <BsCheckCircleFill size={14} />
        </div>
        <h6 className="mb-0 fw-bold text-success">
          {fileUrls.length > 1 ? `${fileUrls.length} ${t('post.selectedFiles')}` : `1 ${t('post.selectedFile')}`}
        </h6>
      </div>
      <div className="row g-3">
        {fileUrls.map(({ file, url }, index) => (
          <div key={`${file.name}-${index}`} className="col-12">
            <div className="file-preview-card p-3 position-relative">
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-circle position-absolute border-2 border-white"
                style={{
                  top: '-10px',
                  right: '-10px',
                  width: '28px',
                  height: '28px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onClick={() => onRemove(index)}
                aria-label="Remove file"
              >
                <span style={{ fontSize: '18px', lineHeight: '1' }}>×</span>
              </button>

              {file.type.startsWith('video/') && (
                <div className="mb-3 position-relative overflow-hidden rounded-3">
                  <video
                    className="w-100 h-100"
                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                    controls
                    preload="metadata"
                  >
                    <source src={url} type={file.type} />
                    Tarayıcınız video oynatmayı desteklemiyor
                  </video>
                </div>
              )}

              {file.type.startsWith('image/') && (
                <div className="mb-3 position-relative overflow-hidden rounded-3">
                  <img
                    src={url}
                    alt="Preview"
                    className="w-100 h-100"
                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div className="d-flex align-items-center">
                <div className={`icon-shape icon-sm rounded-circle me-3 ${file.type.startsWith('image/') ? 'bg-success-soft text-success' : 'bg-info-soft text-info'}`}>
                  {file.type.startsWith('image/') ? (
                    <BsImageFill size={16} />
                  ) : (
                    <BsCameraReelsFill size={16} />
                  )}
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <h6 className="mb-1 text-truncate fs-6">{file.name}</h6>
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted fw-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                    {file.type.startsWith('video/') && (file.size / (1024 * 1024)) > 50 && (
                      <small className="badge bg-warning-soft text-warning fw-normal">
                        {t('post.largeFileWarning')}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingButton = ({ variant = "success", size = "sm", children, disabled = false, onClick, className = "", loading = false }) => {
  const { t } = useLanguage();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          {t('feed.sharing')}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

const CreatePostCard = () => {
  const { t } = useLanguage();
  const guests = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7];
  const { createPost, uploadFile, loading, error } = useCreatePost();
  const { showNotification } = useNotificationContext();
  const { userInfo, isAuthenticated } = useAuthContext();

  // Post content state
  const [postContent, setPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [privacy, setPrivacy] = useState('public');

  // User profile data state
  const [profileData, setProfileData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0);

  // Memoize file URLs to prevent recreation on every render
  const filePreviewUrls = useMemo(() => {
    return selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
  }, [selectedFiles]);

  // Cleanup URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      filePreviewUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [filePreviewUrls]);

  // Get user's profile picture or use default
  const getUserAvatar = () => {

    // First try to use the actual profile picture from API
    if (profileData?.photoUrl || profileData?.photo_url) {
      const photoUrl = profileData.photoUrl || profileData.photo_url;
      return photoUrl;
    }

    // Fallback to default avatar based on user ID for consistency
    if (userInfo?.id) {
      const userId = parseInt(userInfo.id) || 0;
      const avatarIndex = userId % 7;
      return guests[avatarIndex] || avatar1;
    }

    if (userInfo?.username) {
      const usernameHash = userInfo.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const avatarIndex = usernameHash % 7;
      return guests[avatarIndex] || avatar1;
    }

    return avatar1;
  };

  // Helper function to get proper image URL with cache busting
  const getImageUrl = (photoUrl, bustCache = false) => {

    // If photoUrl is null, undefined, or empty, return default avatar
    if (!photoUrl) {
      return typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
    }

    // If photoUrl is an object (imported image), return its src property
    if (typeof photoUrl === 'object' && photoUrl.src) {
      return photoUrl.src;
    }

    // If photoUrl is not a string, return default avatar
    if (typeof photoUrl !== 'string') {
      return typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
    }

    // If it starts with /uploads/, add API base URL
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${apiBaseUrl}${photoUrl}`;
      // Only add cache busting when explicitly requested (e.g., after upload)
      return bustCache ? `${url}?v=${imageKey}` : url;
    }

    // If it's already a full URL, only add cache busting when explicitly requested
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      if (bustCache) {
        const separator = photoUrl.includes('?') ? '&' : '?';
        return `${photoUrl}${separator}v=${imageKey}`;
      }
      return photoUrl;
    }

    // For any other case, return as is (might be a relative path or imported image path)
    return photoUrl;
  };


  // Fetch user profile data when authenticated
  useEffect(() => {
    let timeoutId = null;

    const fetchUserProfile = async () => {
      if (!isAuthenticated || !userInfo?.id) {
        setImageLoading(false); // Stop loading if not authenticated
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setImageLoading(false);
          return;
        }

        setImageLoading(true); // Start loading

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userInfo.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          // Force image reload with cache busting
          setImageKey(prev => prev + 1);
          // Set a timeout to stop loading if image doesn't load within 3 seconds
          timeoutId = setTimeout(() => {
            setImageLoading(false);
          }, 3000);
        } else {
          console.error('❌ Failed to fetch profile data:', response.status, response.statusText);
          setImageLoading(false); // Stop loading on error
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setImageLoading(false); // Stop loading on error
      }
    };

    fetchUserProfile();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, userInfo?.id]);

  // Listen for profile photo updates
  useEffect(() => {
    const handleProfilePhotoUpdate = async () => {
      if (!isAuthenticated || !userInfo?.id) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setImageLoading(true); // Start loading for updated photo

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userInfo.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          // Force image reload by updating key
          setImageKey(prev => prev + 1);
          // Image loading will be handled by onLoad/onError handlers
        } else {
          setImageLoading(false);
        }
      } catch (error) {
        console.error('Error updating profile photo in CreatePostCard:', error);
        setImageLoading(false);
      }
    };

    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);
    return () => window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate);
  }, [isAuthenticated, userInfo?.id]);

  const {
    isTrue: isOpenPhoto,
    toggle: togglePhotoModel
  } = useToggle();
  const {
    isTrue: isOpenVideo,
    toggle: toggleVideoModel
  } = useToggle();
  const {
    isTrue: isOpenEvent,
    toggle: toggleEvent
  } = useToggle();
  const {
    isTrue: isOpenPost,
    toggle: togglePost
  } = useToggle();

  const eventFormSchema = yup.object({
    title: yup.string().required('Lütfen etkinlik başlığını giriniz'),
    description: yup.string().required('Lütfen etkinlik açıklamasını girin'),
    duration: yup.string().required('Lütfen etkinlik süresini girin'),
    location: yup.string().required('Lütfen etkinlik konumunu girin'),
    guest: yup.string().email('Lütfen geçerli bir e-posta girin').required('Lütfen etkinlik konuğu e-postasını girin')
  });

  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(eventFormSchema)
  });

  // Close all modals
  const closeAllModals = () => {
    if (isOpenPhoto) togglePhotoModel();
    if (isOpenVideo) toggleVideoModel();
    if (isOpenEvent) toggleEvent();
    if (isOpenPost) togglePost();
  };

  // Reset form and close modals
  const resetFormAndCloseModals = () => {
    setPostContent('');
    setSelectedFiles([]);
    setPrivacy('public');
    closeAllModals();
  };

  // Handle post submission
  const handlePostSubmit = async () => {
    try {

      if (!postContent.trim()) {
        showNotification({
          title: 'Uyarı',
          message: 'Lütfen bir içerik girin',
          variant: 'warning'
        });
        return;
      }

      let imageUrl = null;
      let videoUrl = null;

      // Upload files if any
      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          imageUrl = file; // Pass the file directly
        } else if (file.type.startsWith('video/')) {
          videoUrl = file; // Pass the file directly
        }
      }

      //   content: postContent,
      //   imageUrl: imageUrl ? imageUrl.name : null,
      //   videoUrl: videoUrl ? videoUrl.name : null,
      //   privacy
      // });

      // Create post
      const result = await createPost({
        content: postContent,
        imageUrl,
        videoUrl,
        privacy
      });

      // Show success notification
      showNotification({
        title: t('common.success'),
        message: result.status === 'approved' ? t('feed.postSuccess') : t('feed.postPendingApproval'),
        variant: 'success',
        delay: 3000
      });

      // Reset form and close modals
      resetFormAndCloseModals();

      // Create a more detailed event with post data for immediate UI update
      // Use the actual post data from API response
      const postCreatedEvent = new CustomEvent('postCreated', {
        detail: {
          post: {
            id: result.id || Date.now(),
            type: result.type || 'user',
            user_id: result.user_id || userInfo?.id,
            content: result.content || postContent,
            title: result.title || null,
            image_url: result.image_url || (imageUrl ? URL.createObjectURL(imageUrl) : null),
            video_url: result.video_url || (videoUrl ? URL.createObjectURL(videoUrl) : null),
            status: result.status || 'pending', // API'den dönen status
            created_at: result.created_at || new Date().toISOString(),
            timeAgo: 'Şimdi',
            user_name: profileData?.firstName && profileData?.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : profileData?.username || userInfo?.username || 'Sen',
            user_username: profileData?.username || userInfo?.username,
            user_photo_url: profileData?.photoUrl || profileData?.photo_url || getUserAvatar(),
            is_own_post: true
          },
          timestamp: Date.now()
        }
      });

      // Trigger the custom event to refresh posts without full page reload
      window.dispatchEvent(postCreatedEvent);

    } catch (err) {
      // console.error('❌ Error creating post:', err);
      // console.error('❌ Error details:', {
      //   message: err.message,
      //   stack: err.stack,
      //   name: err.name
      // });

      showNotification({
        title: t('common.error'),
        message: err.message || t('feed.postError'),
        variant: 'danger'
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);

    // Validate file sizes
    const validFiles = fileArray.filter(file => {
      const fileSizeMB = file.size / (1024 * 1024);

      if (file.type.startsWith('video/') && fileSizeMB > 5) {
        showNotification({
          title: 'Hata!',
          message: t('post.videoSizeError'),
          variant: 'danger'
        });
        return false;
      }

      if (file.type.startsWith('image/') && fileSizeMB > 10) {
        showNotification({
          title: 'Hata!',
          message: 'Resim dosyası 10MB\'dan büyük olamaz',
          variant: 'danger'
        });
        return false;
      }

      return true;
    });

    setSelectedFiles(validFiles);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };



  return <>
    <Card className="shadow-sm border-0" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div className="d-flex mb-3">
        <div className="me-3" style={{ flexShrink: 0 }}>
          <span role="button">
            {imageLoading && (
              <div
                className="position-absolute top-0 start-0 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#e9ecef',
                  zIndex: 2
                }}
              >
                <div className="spinner-border text-primary" role="status" style={{ width: '16px', height: '16px' }}>
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
              </div>
            )}
            <img
              className="rounded-circle"
              src={getImageUrl(getUserAvatar(), false)}
              alt={userInfo?.username || 'User'}
              key={`create-post-avatar-${imageKey}`}
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'cover',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                opacity: imageLoading ? 0 : 1
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', e.target.src);
                console.error('Error event:', e);
                e.target.src = typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
                setImageLoading(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(181, 231, 160, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </span>
        </div>

        <div className="w-100 d-flex align-items-start gap-2">
          <form className="flex-grow-1">
            <textarea
              className="form-control pe-4 border-0"
              rows={2}
              data-autoresize
              placeholder={t('feed.shareThoughts')}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{ resize: 'none' }}
            />
          </form>


        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <ul className="nav nav-pills nav-stack small fw-normal mb-0">
          <li className="nav-item">
            <a className="nav-link bg-light py-1 px-2 mb-0" onClick={togglePhotoModel} style={{ cursor: 'pointer' }}>
              {' '}
              <BsImageFill size={20} className="text-success pe-2" />
              {t('post.photo')}
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link bg-light py-1 px-2 mb-0" onClick={toggleVideoModel} style={{ cursor: 'pointer' }}>
              {' '}
              <BsCameraReelsFill size={20} className="text-info pe-2" />
              {t('post.video')}
            </a>
          </li>
          {/* <li className="nav-item">
              <a className="nav-link bg-light py-1 px-2 mb-0" onClick={toggleEvent} style={{ cursor: 'pointer' }}>
                {' '}
                <BsCalendar2EventFill size={20} className="text-danger pe-2" />
                {t('post.event')}{' '}
              </a>
            </li> */}
        </ul>

        <div className="d-flex align-items-center gap-2">
          {/* <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <option value="public">{t('post.privacyPublic')}</option>
              <option value="friends">{t('post.privacyFriends')}</option>
              <option value="private">{t('post.privacyPrivate')}</option>
            </select> */}

          <LoadingButton
            onClick={handlePostSubmit}
            disabled={!postContent.trim()}
            className="px-3"
            loading={loading}
          >
            {t('feed.share')}
          </LoadingButton>
        </div>
      </div>
    </Card>

    {/* photo */}
    <Modal
      show={isOpenPhoto}
      onHide={resetFormAndCloseModals}
      centered
      className="modern-modal"
      backdrop="static"
      keyboard={false}
    >
      <div className="modal-content">
        <ModalHeader closeButton className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="icon-shape icon-md rounded-circle bg-success bg-opacity-10 text-success me-3 shadow-sm">
              <BsImageFill size={20} />
            </div>
            <div>
              <h5 className="modal-title mb-0 fw-bold">{t('post.addPhoto')}</h5>
              <small className="text-muted">{t('post.shareWithPhoto')}</small>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2">
          <div className="d-flex align-items-center mb-4 p-2 bg-light bg-opacity-50 rounded-4">
            <div className="avatar avatar-md me-2 flex-shrink-0">
              <img
                className="avatar-img rounded-circle"
                src={getImageUrl(getUserAvatar())}
                alt=""
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
                }}
              />
            </div>
            <div className="flex-grow-1">
              <textarea
                className="form-control border-0 shadow-none bg-transparent px-2 py-3 fs-5"
                rows={3}
                placeholder={t('feed.shareThoughts')}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{
                  resize: 'none',
                  lineHeight: '1.5'
                }}
                autoFocus
              />
            </div>
          </div>

          <div
            className="upload-section p-5 text-center"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            <div className="icon-shape icon-xl rounded-circle bg-white shadow-sm mx-auto mb-3">
              <BsImages size={32} className="text-success" />
            </div>
            <h6 className="fw-bold mb-2">{t('post.uploadPhoto')}</h6>
            <div className="vstack gap-1">
              <small className="text-muted">
                {t('post.maxFileSize')}
              </small>
            </div>
            <input
              id="photo-upload"
              type="file"
              className="d-none"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
            />
          </div>

          {selectedFiles.length > 0 && <FilePreview fileUrls={filePreviewUrls} onRemove={removeFile} />}
        </ModalBody>
        <ModalFooter className="pt-0">
          <div className="d-flex w-100 gap-3">
            <button
              type="button"
              className="btn btn-light flex-grow-1 py-2 fw-medium border-0"
              onClick={resetFormAndCloseModals}
              style={{ borderRadius: '12px' }}
            >
              {t('post.cancel')}
            </button>
            <LoadingButton
              variant="success"
              className="flex-grow-1 py-2 fw-medium"
              onClick={handlePostSubmit}
              style={{ borderRadius: '12px' }}
              loading={loading}
            >
              {t('post.post')}
            </LoadingButton>
          </div>
        </ModalFooter>
      </div>
    </Modal>

    {/* video */}
    <Modal
      show={isOpenVideo}
      onHide={resetFormAndCloseModals}
      centered
      className="modern-modal"
      backdrop="static"
      keyboard={false}
    >
      <div className="modal-content">
        <ModalHeader closeButton className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="icon-shape icon-md rounded-circle bg-info bg-opacity-10 text-info me-3 shadow-sm">
              <BsCameraReelsFill size={20} />
            </div>
            <div>
              <h5 className="modal-title mb-0 fw-bold">{t('post.addVideo')}</h5>
              <small className="text-muted">{t('post.shareWithVideo')}</small>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2">
          <div className="d-flex align-items-center mb-4 p-2 bg-light bg-opacity-50 rounded-4">
            <div className="avatar avatar-md me-2 flex-shrink-0">
              <img
                className="avatar-img rounded-circle"
                src={getImageUrl(getUserAvatar())}
                alt=""
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
                }}
              />
            </div>
            <div className="flex-grow-1">
              <textarea
                className="form-control border-0 shadow-none bg-transparent px-2 py-3 fs-5"
                rows={3}
                placeholder={t('feed.shareThoughts')}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{
                  resize: 'none',
                  lineHeight: '1.5'
                }}
                autoFocus
              />
            </div>
          </div>

          <div
            className="upload-section p-5 text-center"
            onClick={() => document.getElementById('video-upload').click()}
          >
            <div className="icon-shape icon-xl rounded-circle bg-white shadow-sm mx-auto mb-3">
              <BsCameraVideoFill size={32} className="text-info" />
            </div>
            <h6 className="fw-bold mb-2">{t('post.uploadVideo')}</h6>
            <div className="vstack gap-1">
              <small className="text-muted">
                {t('post.maxVideoSize')}
              </small>
            </div>
            <input
              id="video-upload"
              type="file"
              className="d-none"
              accept="video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {selectedFiles.length > 0 && <FilePreview fileUrls={filePreviewUrls} onRemove={removeFile} />}
        </ModalBody>
        <ModalFooter className="pt-0">
          <div className="d-flex w-100 gap-3">
            <button
              type="button"
              className="btn btn-light flex-grow-1 py-2 fw-medium border-0"
              onClick={resetFormAndCloseModals}
              style={{ borderRadius: '12px' }}
            >
              {t('post.cancel')}
            </button>
            <LoadingButton
              variant="info"
              className="flex-grow-1 py-2 fw-medium"
              onClick={handlePostSubmit}
              style={{ borderRadius: '12px' }}
              loading={loading}
            >
              {t('post.post')}
            </LoadingButton>
          </div>
        </ModalFooter>
      </div>
    </Modal>

    {/* event */}
    <Modal show={isOpenEvent} onHide={resetFormAndCloseModals} centered className="fade" id="modalCreateEvents" tabIndex={-1} aria-labelledby="modalLabelCreateEvents" aria-hidden="true">
      <form onSubmit={handleSubmit(() => { })}>
        <ModalHeader closeButton>
          <h5 className="modal-title" id="modalLabelCreateEvents">
            <BsCalendar2EventFill className="text-danger me-2" />
            {t('post.createEvent')}
          </h5>
        </ModalHeader>
        <ModalBody>
          <Row className="g-4">
            <TextFormInput name="title" label={t('post.title')} placeholder={t('post.eventName')} containerClassName="col-12" control={control} />
            <TextAreaFormInput name="description" label={t('post.description')} rows={2} placeholder={t('post.descriptionPlaceholder')} containerClassName="col-12" control={control} />

            <Col sm={4}>
              <label className="form-label">{t('post.date')}</label>
              <DateFormInput options={{
                enableTime: false
              }} type="text" className="form-control" placeholder={t('post.selectDate')} />
            </Col>
            <Col sm={4}>
              <label className="form-label">{t('post.time')}</label>
              <DateFormInput options={{
                enableTime: true,
                noCalendar: true
              }} type="text" className="form-control" placeholder={t('post.selectTime')} />
            </Col>
            <TextFormInput name="duration" label={t('post.duration')} placeholder={t('post.durationPlaceholder')} containerClassName="col-sm-4" control={control} />
            <TextFormInput name="location" label={t('post.location')} placeholder={t('post.locationPlaceholder')} containerClassName="col-12" control={control} />
            <TextFormInput name="guest" type="email" label={t('post.addGuests')} placeholder={t('post.guestEmailPlaceholder')} containerClassName="col-12" control={control} />
            <Col xs={12} className="mt-3">
              <ul className="avatar-group list-unstyled align-items-center mb-0">
                {guests.map((avatar, idx) => <li className="avatar avatar-xs" key={idx}>
                  <Image className="avatar-img rounded-circle" src={avatar} alt="avatar" />
                </li>)}
                <li className="ms-3">
                  <small> +50 </small>
                </li>
              </ul>
            </Col>
            <div className="mb-3">
              <DropzoneFormInput showPreview helpText={t('post.attachmentHelpText')} icon={BsFileEarmarkText} label={t('post.uploadAttachment')} />
            </div>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger-soft" type="button" className="me-2" onClick={resetFormAndCloseModals}>
            {' '}
            {t('post.cancel')}
          </Button>
          <LoadingButton variant="success-soft" onClick={handlePostSubmit} loading={loading}>
            {t('post.create')}
          </LoadingButton>
        </ModalFooter>
      </form>
    </Modal>

    {/* feeling/activity */}
    <Modal show={isOpenPost} onHide={resetFormAndCloseModals} className="fade" centered id="modalCreateFeed" tabIndex={-1}>
      <ModalHeader closeButton>
        <h5 className="modal-title" id="modalLabelCreateFeed">
          <BsPencilSquare className="text-primary me-2" />
          {t('feed.createPost')}
        </h5>
      </ModalHeader>
      <ModalBody>
        <div className="d-flex mb-3">
          <div className="avatar avatar-xs me-2">
            <img
              className="avatar-img rounded-circle"
              src={getImageUrl(getUserAvatar())}
              alt=""
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease-in-out'
              }}
              onError={(e) => {
                e.target.src = typeof avatar1 === 'string' ? avatar1 : (avatar1?.src || '/images/avatar/default.jpg');
              }}
            />
          </div>
          <form className="w-100">
            <textarea
              className="form-control pe-4 fs-3 lh-1 border-0"
              rows={4}
              placeholder={t('feed.shareThoughts')}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{ resize: 'none' }}
            />
          </form>
        </div>
        <div className="hstack gap-2">
          <OverlayTrigger overlay={<Tooltip>{t('post.photo')}</Tooltip>}>
            <Link className="icon-md bg-success bg-opacity-10 text-success rounded-circle" href="">
              {' '}
              <BsImageFill />{' '}
            </Link>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>{t('post.video')}</Tooltip>}>
            <Link className="icon-md bg-info bg-opacity-10 text-info rounded-circle" href="">
              {' '}
              <BsCameraReelsFill />{' '}
            </Link>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>{t('post.event')}</Tooltip>}>
            <Link className="icon-md bg-danger bg-opacity-10 text-danger rounded-circle" href="">
              {' '}
              <BsCalendar2EventFill />{' '}
            </Link>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>{t('post.feeling')}</Tooltip>}>
            <Link className="icon-md bg-warning bg-opacity-10 text-warning rounded-circle" href="">
              {' '}
              <BsEmojiSmileFill />{' '}
            </Link>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Giriş yap</Tooltip>}>
            <Link className="icon-md bg-light text-secondary rounded-circle" href="">
              {' '}
              <BsGeoAltFill />{' '}
            </Link>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Üstteki kişileri etiketleyin</Tooltip>}>
            <Link className="icon-md bg-primary bg-opacity-10 text-primary rounded-circle" href="">
              {' '}
              <BsTagFill />{' '}
            </Link>
          </OverlayTrigger>
        </div>
      </ModalBody>
      <ModalFooter className="row justify-content-between">
        <Col lg={3}>
          <select
            className="form-select"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="public">{t('post.privacyPublic')}</option>
            <option value="friends">{t('post.privacyFriends')}</option>
            <option value="private">{t('post.privacyPrivate')}</option>
          </select>
        </Col>
        <Col lg={8} className="text-sm-end">
          <Button variant="danger-soft" type="button" className="me-2" onClick={resetFormAndCloseModals}>
            {t('post.cancel')}
          </Button>
          <LoadingButton variant="success-soft" onClick={handlePostSubmit} loading={loading}>
            {t('feed.share')}
          </LoadingButton>
        </Col>
      </ModalFooter>
    </Modal>
  </>;
};
export default CreatePostCard;