'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'react-bootstrap';
import avatar7 from '@/assets/images/avatar/07.jpg';
import bgBannerImg from '@/assets/images/bg/01.jpg';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { getProfilePath } from '@/utils/profileEncoder';
import { getToken } from '@/utils/auth';
import { BsCamera, BsCheckCircleFill, BsEye, BsImage, BsShieldLock } from 'react-icons/bs';
import { fetchUserProfile, invalidateProfileCache } from '@/utils/profileCache';


const ProfilePanel = ({ links, onLinkClick }) => {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const { showNotification } = useNotificationContext();
  const { theme } = useLayoutContext();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoViewModal, setShowPhotoViewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0);

  const [bioExpanded, setBioExpanded] = useState(false);

  const handleLinkClick = (e, link) => {
    if (onLinkClick) onLinkClick();
  };

  useEffect(() => {
    if (session?.user) {
      // Sadece kullanıcı değiştiyse veya henüz veri yoksa session'dan al
      // Bu sayede sekme değişiminde mevcut (zengin) veri kaybolmaz
      setUser(prev => {
        // Sadece kullanıcı değiştiyse veya henüz veri yoksa session'dan al
        if (!prev || (prev.id && session.user.id && prev.id !== session.user.id)) {
          return session.user;
        }
        return prev;
      });

      const fetchUserProfile_panel = async () => {
        try {
          const token = getToken();
          if (!token || !session.user.id) return;

          const userData = await fetchUserProfile(session.user.id);
          if (userData) {
            setUser(prev => ({
              ...prev,
              photoUrl: userData.photoUrl,
              firstName: userData.firstName,
              lastName: userData.lastName,
              username: userData.username,
              bio: userData.biography
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };

      fetchUserProfile_panel();
    } else if (status === 'unauthenticated') {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined' && userData !== 'null') {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
      }
    }
  }, [session, status]);

  const fetchFollowStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseText = await response.text();
        if (responseText) {
          try {
            const data = JSON.parse(responseText);
            setFollowStats({
              followersCount: data.followersCount || 0,
              followingCount: data.totalFollowingCount || 0
            });
          } catch (e) {
            console.error('Error parsing follow stats:', e);
          }
        }
      }
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchFollowStats();
  }, [status]);

  useEffect(() => {
    window.addEventListener('followStatusChanged', fetchFollowStats);
    return () => {
      window.removeEventListener('followStatusChanged', fetchFollowStats);
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Profil veya fotoğraf güncellendiğinde verileri yenile
      if (session?.user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const responseText = await response.text();
            if (!responseText) return;

            try {
              const userData = JSON.parse(responseText);

              // Eğer fotoğraf değiştiyse key'i artır
              if (user?.photoUrl !== userData.photoUrl) {
                setImageLoading(true);
                setImageKey(prev => prev + 1);
              }

              setUser(prev => ({
                ...prev,
                ...userData,
                bio: userData.biography // biography -> bio eşleştirmesi
              }));

              // LocalStorage'daki user verisini de güncelle
              if (typeof window !== 'undefined') {
                const currentStoredUser = localStorage.getItem('user');
                if (currentStoredUser && currentStoredUser !== 'undefined' && currentStoredUser !== 'null') {
                  try {
                    const parsedUser = JSON.parse(currentStoredUser);
                    localStorage.setItem('user', JSON.stringify({
                      ...parsedUser,
                      ...userData
                    }));
                  } catch (e) {
                    console.error('Error parsing stored user:', e);
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing profile update JSON:', e);
            }
          }
        } catch (error) {
          console.error('Error updating profile information:', error);
        }
      }
    };

    window.addEventListener('profilePhotoUpdated', handleProfileUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfileUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [session?.user?.id, user?.photoUrl]);

  const getImageUrl = (photoUrl, bustCache = false) => {
    const defaultAvatar = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');

    // If photoUrl is null, undefined, or empty, return default avatar
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined' || photoUrl === '') {
      return defaultAvatar;
    }

    // If photoUrl is an object (imported image), return its src property
    if (typeof photoUrl === 'object') {
      return photoUrl.src || defaultAvatar;
    }

    // If photoUrl is not a string, return default avatar
    if (typeof photoUrl !== 'string') {
      return defaultAvatar;
    }

    // Trim whitespace
    photoUrl = photoUrl.trim();

    // If it starts with /uploads/, add API base URL
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Remove trailing slash from API base URL if present
      const cleanApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
      const url = `${cleanApiBaseUrl}${photoUrl}`;
      // Only add cache busting when explicitly requested (e.g., after upload)
      return bustCache ? `${url}?v=${imageKey}` : url;
    }

    // If it starts with uploads/ (without leading slash), add API base URL and leading slash
    if (photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const cleanApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
      const url = `${cleanApiBaseUrl}/${photoUrl}`;
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

    // For any other case, try to construct URL with API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const cleanApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    const url = photoUrl.startsWith('/') ? `${cleanApiBaseUrl}${photoUrl}` : `${cleanApiBaseUrl}/${photoUrl}`;
    // Only add cache busting when explicitly requested (e.g., after upload)
    return bustCache ? `${url}?v=${imageKey}` : url;
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification({
          title: t('profile.error'),
          message: t('profile.fileSizeError'),
          variant: 'danger'
        });
        return;
      }

      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto || !user?.id) return;

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/photo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const updatedUser = await response.json();

        setUser(prev => ({
          ...prev,
          photoUrl: updatedUser.photoUrl
        }));

        showNotification({
          title: t('profile.success'),
          message: t('profile.profilePictureUpdated'),
          variant: 'success'
        });

        setShowPhotoModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);

        window.dispatchEvent(new Event('profilePhotoUpdated'));
        invalidateProfileCache(session.user.id);
      } else {
        throw new Error(t('profile.profilePictureUpdateFailed'));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification({
        title: t('profile.error'),
        message: t('profile.profilePictureUploadError'),
        variant: 'danger'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get theme-aware colors
  // Giriş yapmamış kullanıcılar için her zaman açık tema (ilk ziyarette tutarlı görünüm)
  const isDarkMode = status === 'unauthenticated' ? false : (theme === 'dark' || theme === 'green');
  const isGreenTheme = theme === 'green';
  const cardBg = isGreenTheme ? '#234d2a' : (isDarkMode ? '#151a22' : '#ffffff');
  const textColor = isGreenTheme ? '#c0e0c0' : (isDarkMode ? '#b3bcc8' : '#536471');
  const headingColor = isGreenTheme ? '#e8f5e9' : (isDarkMode ? '#f5f7fa' : '#0f1419');
  const borderColor = isGreenTheme ? 'rgba(67, 160, 71, 0.35)' : (isDarkMode ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 20, 25, 0.08)');
  const accentColor = '#66BB6A';
  const cardShadow = isGreenTheme
    ? '0 14px 36px -20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(46, 125, 50, 0.15)'
    : (isDarkMode ? '0 14px 36px -20px rgba(0, 0, 0, 0.9)' : '0 14px 36px -24px rgba(15, 20, 25, 0.3)');

  if (status === 'loading') {
    return (
      <div className="feed-profile-panel">
        <div className="feed-profile-card feed-loading-inline">
          <div className="spinner-border spinner-border-sm text-success" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-profile-panel">
      {/* Section 1: Profile Card */}
      <div className="feed-profile-card">
        <div
          className="feed-profile-cover"
          style={{
            backgroundImage: `url(${bgBannerImg.src})`,
          }}
        />

        <div className="feed-profile-body">
          <div className="text-center">
            {status === 'unauthenticated' ? (
              <div className="py-2">
                <div className="mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto feed-profile-login-icon"
                    style={{
                      width: '60px',
                      height: '60px',
                      marginTop: '20px',
                    }}
                  >
                    <BsShieldLock className="text-success" size={24} />
                  </div>
                </div>
                <h6 className="fw-bold mb-2">{t('profile.loginRequired')}</h6>
                <p className="text-muted mb-3 small">{t('profile.loginDescription')}</p>
                <Link href="/auth-advance/sign-in" className="feed-profile-view-btn">
                  {t('profile.loginAction')}
                </Link>
              </div>
            ) : (
              <>
                <div className="position-relative d-inline-block feed-profile-avatar-wrap">
                  <div
                    className="position-relative"
                    onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                    style={{ cursor: 'pointer' }}
                  >
                    {imageLoading && (
                      <div
                        className="position-absolute top-0 start-0 rounded-circle d-flex align-items-center justify-content-center feed-profile-avatar-skeleton"
                        style={{ zIndex: 2 }}
                      >
                        <div className="spinner-border spinner-border-sm text-success" role="status">
                          <span className="visually-hidden">{t('common.loading')}</span>
                        </div>
                      </div>
                    )}
                    <img
                      src={getImageUrl(user?.photoUrl, false)}
                      alt="avatar"
                      className="rounded-circle feed-profile-avatar"
                      key={imageKey}
                      style={{ opacity: imageLoading ? 0 : 1 }}
                      onLoad={() => setImageLoading(false)}
                      onError={(e) => {
                        e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                        setImageLoading(false);
                      }}
                    />
                    <div className="position-absolute rounded-circle d-flex align-items-center justify-content-center feed-profile-camera-badge">
                      <BsCamera className="text-white" size={16} />
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {showAvatarMenu && (
                    <>
                      <div
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1040 }}
                        onClick={() => setShowAvatarMenu(false)}
                      />
                      <div
                        className="rounded-3 shadow-lg border"
                        style={{
                          position: 'absolute',
                          zIndex: 1050,
                          top: 'calc(100% + 10px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '200px',
                          padding: '0.5rem 0',
                          overflow: 'hidden',
                          background: cardBg,
                          borderColor: borderColor
                        }}
                      >
                        <button
                          className="w-100 d-flex align-items-center py-2 px-3 bg-transparent border-0 text-start"
                          onClick={() => {
                            setShowAvatarMenu(false);
                            setShowPhotoViewModal(true);
                          }}
                          style={{
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                            color: 'var(--bs-body-color, #000)'
                          }}
                        >
                          <BsEye size={18} className="me-2 text-primary flex-shrink-0" />
                          <span>{t('profile.viewProfilePicture')}</span>
                        </button>
                        <button
                          className="w-100 d-flex align-items-center py-2 px-3 bg-transparent border-0 text-start"
                          onClick={() => {
                            setShowAvatarMenu(false);
                            setShowPhotoModal(true);
                          }}
                          style={{
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                            color: textColor
                          }}
                        >
                          <BsImage size={18} className="me-2 text-success flex-shrink-0" />
                          <span>{t('profile.selectProfilePicture')}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* User Info */}
                <h5 className="mb-1 feed-profile-name fw-bold">
                  {user?.id && user?.id !== 'undefined' ? (
                    <Link
                      href={getProfilePath('user', user.id) || '#'}
                      className="feed-profile-name-link"
                      onClick={() => onLinkClick && onLinkClick()}
                    >
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : (user.name || t('profile.user'))
                      }
                    </Link>
                  ) : (
                    <span>
                      {user ? (
                        (user.firstName || user.lastName)
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : (user.name || t('profile.user'))
                      ) : t('profile.user')}
                    </span>
                  )}
                </h5>
                <small className="feed-profile-handle d-block">
                  @{user?.username || user?.email || t('profile.user')}
                </small>

                {user?.bio && (
                  <div className="mt-1 mb-1">
                    <p className={`mb-0 feed-profile-bio ${bioExpanded ? 'is-expanded' : ''}`}>
                      {bioExpanded || user.bio.length <= 70
                        ? user.bio
                        : `${user.bio.slice(0, 70)}...`}
                    </p>
                    {user.bio.length > 70 && (
                      <button
                        onClick={() => setBioExpanded(!bioExpanded)}
                        className="btn btn-link p-0 text-decoration-none text-success small fw-medium"
                      >
                        {bioExpanded ? t('profile.showLess') : t('profile.showMore')}
                      </button>
                    )}
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-center mt-2 flex-nowrap">
                  <Link
                    href="/feed/followers"
                    className="text-decoration-none"
                    onClick={() => onLinkClick && onLinkClick()}
                  >
                    <div className="feed-profile-stat-pill">
                      <span className="stat-value">{followStats.followersCount}</span>
                      <span className="stat-label">{t('profile.followers')}</span>
                    </div>
                  </Link>

                  <Link
                    href="/feed/following"
                    className="text-decoration-none"
                    onClick={() => onLinkClick && onLinkClick()}
                  >
                    <div className="feed-profile-stat-pill">
                      <span className="stat-value">{followStats.followingCount}</span>
                      <span className="stat-label">{t('profile.following')}</span>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Navigation Card */}
      <div className="feed-profile-nav-card">
        <Link
          href={user?.id && user?.id !== 'undefined' ? getProfilePath('user', user.id, 'feed') : '/profile/feed'}
          className="feed-profile-view-btn"
          onClick={(e) => handleLinkClick(e, '/profile/feed')}
        >
          {t('profile.viewProfile')}
        </Link>

        <ul className="nav flex-column p-0 m-0 list-unstyled">
          {links.map((item, idx) => {
            const isActive = pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link));
            const iconFilter = item.preserveIconColor
              ? 'none'
              : (isActive
                ? 'brightness(0) invert(1)'
                : (isDarkMode ? 'invert(1)' : 'none'));
            const iconStyle = item.preserveIconColor
              ? {
                  marginRight: '12px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                  flexShrink: 0
                }
              : {
                  marginRight: '12px',
                  opacity: isActive ? 1 : 0.85,
                  filter: iconFilter
                };
            const content = (
              <>
                <img
                  src={item.image}
                  alt="icon"
                  height={18}
                  width={18}
                  style={iconStyle}
                />
                <span>{item.name || t(item.nameKey)}</span>
              </>
            );
            return (
              <li key={(item.nameKey || item.name || item.link) + idx}>
                {item.external ? (
                  <a
                    className={`feed-profile-nav-link d-flex align-items-center text-decoration-none ${isActive ? 'is-active' : ''}`}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleLinkClick(e, item.link)}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    className={`feed-profile-nav-link d-flex align-items-center text-decoration-none ${isActive ? 'is-active' : ''}`}
                    href={item.link}
                    onClick={(e) => handleLinkClick(e, item.link)}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Profil Resmini Görüntüleme Modalı */}
      < Modal
        show={showPhotoViewModal}
        onHide={() => setShowPhotoViewModal(false)}
        centered
        size="lg"
        className="modern-modal"
      >
        <div className="modal-content border-0 shadow-lg bg-dark">
          <ModalHeader closeButton className="border-0 bg-dark text-white">
            <h5 className="modal-title mb-0 fw-bold">{t('profile.profilePicture')}</h5>
          </ModalHeader>
          <ModalBody className="p-4 bg-dark">
            <div className="text-center">
              <img
                src={getImageUrl(user?.photoUrl)}
                alt="Profile"
                className="rounded-3 w-100"
                style={{ maxHeight: '500px', objectFit: 'contain', width: '100%' }}
                onError={(e) => {
                  e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-0 bg-dark">
            <button
              type="button"
              className="btn btn-light w-100"
              onClick={() => setShowPhotoViewModal(false)}
            >
              {t('common.close')}
            </button>
          </ModalFooter>
        </div>
      </Modal >

      {/* Profil Resmi Güncelleme Modalı */}
      < Modal
        show={showPhotoModal}
        onHide={() => {
          setShowPhotoModal(false);
          setSelectedPhoto(null);
          setPhotoPreview(null);
        }}
        centered
        className="modern-modal"
      >
        <div className="modal-content border-0 shadow-lg" style={{
          backgroundColor: cardBg,
          color: textColor
        }}>
          <ModalHeader closeButton className="border-0 pb-0" style={{
            backgroundColor: cardBg
          }}>
            <div className="d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{
                width: '48px',
                height: '48px',
                background: 'rgba(129, 199, 132, 0.1)'
              }}>
                <BsCamera size={20} className="text-success" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold" style={{ color: headingColor }}>{t('profile.updateProfilePicture')}</h5>
                <small className="text-muted">{t('profile.newProfilePicture')}</small>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="pt-2" style={{
            backgroundColor: cardBg
          }}>
            <div className="text-center mb-4">
              <img
                className="rounded-circle border border-3 shadow"
                src={photoPreview || getImageUrl(user?.photoUrl)}
                alt="Preview"
                width={120}
                height={120}
                style={{
                  objectFit: 'cover',
                  borderColor: borderColor
                }}
                onError={(e) => {
                  e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                }}
              />
            </div>

            <div className="p-4 rounded-3 border border-2 border-dashed position-relative" style={{
              backgroundColor: isGreenTheme ? '#1e4620' : (isDarkMode ? '#202227' : '#f8f9fa'),
              borderColor: borderColor
            }}>
              <label
                htmlFor="profile-photo-upload-panel"
                className="d-block text-center mb-0"
                style={{ cursor: 'pointer' }}
              >
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{
                  width: '64px',
                  height: '64px',
                  background: cardBg,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <BsCamera size={28} className="text-success" />
                </div>
                <h6 className="fw-bold mb-2" style={{ color: headingColor }}>{t('profile.selectPhoto')}</h6>
                <small className="text-muted d-block mb-2">
                  {t('profile.maxFileSize')}
                </small>
                <small className="text-muted">
                  {t('profile.supportedFormats')}
                </small>
                <input
                  id="profile-photo-upload-panel"
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
              </label>
            </div>

            {selectedPhoto && (
              <div className="mt-3 p-3 rounded-3" style={{
                background: 'rgba(129, 199, 132, 0.1)',
                color: textColor
              }}>
                <div className="d-flex align-items-center">
                  <BsCheckCircleFill className="text-success me-2" size={20} />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 text-success">{selectedPhoto.name}</h6>
                    <small className="text-muted">
                      {(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-0 pt-0" style={{
            backgroundColor: cardBg
          }}>
            <div className="d-flex w-100 gap-2">
              <button
                type="button"
                className="btn btn-light flex-grow-1 py-2"
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                  setPhotoPreview(null);
                }}
                disabled={uploadingPhoto}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-success flex-grow-1 py-2"
                onClick={handlePhotoUpload}
                disabled={!selectedPhoto || uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </button>
            </div>
          </ModalFooter>
        </div>
      </Modal >
    </div>
  );
};

export default ProfilePanel;