'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Card, CardBody, CardFooter, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import avatar7 from '@/assets/images/avatar/07.jpg';
import bgBannerImg from '@/assets/images/bg/01.jpg';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { useLayoutContext } from '@/context/useLayoutContext';
import { BsCamera, BsCheckCircleFill, BsEye, BsImage } from 'react-icons/bs';
import clsx from 'clsx';

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

      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token || !session.user.id) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${session.user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
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

      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    }
  }, [session, status]);

  useEffect(() => {
    const fetchFollowStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFollowStats({
            followersCount: data.followersCount || 0,
            followingCount: data.totalFollowingCount || 0
          });
        }
      } catch (error) {
        // Silent fail
      }
    };

    fetchFollowStats();
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
            const userData = await response.json();

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
              if (currentStoredUser) {
                const parsedUser = JSON.parse(currentStoredUser);
                localStorage.setItem('user', JSON.stringify({
                  ...parsedUser,
                  ...userData
                }));
              }
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
          title: 'Hata',
          message: 'Dosya boyutu 10MB\'dan büyük olamaz',
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
          title: 'Başarılı',
          message: 'Profil resminiz güncellendi',
          variant: 'success'
        });

        setShowPhotoModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);

        window.dispatchEvent(new Event('profilePhotoUpdated'));
      } else {
        throw new Error('Profil resmi güncellenemedi');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification({
        title: 'Hata',
        message: 'Profil resmi yüklenirken bir hata oluştu',
        variant: 'danger'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Get theme-aware colors
  const isDarkMode = theme === 'dark';
  const cardBg = isDarkMode ? '#141519' : '#ffffff';
  const textColor = isDarkMode ? '#a1a1a8' : '#2C3E50';
  const headingColor = isDarkMode ? '#fff' : '#000';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(181, 231, 160, 0.3)';
  const hoverBg = isDarkMode ? 'rgba(129, 199, 132, 0.15)' : 'rgba(129, 199, 132, 0.08)';

  if (status === 'loading') {
    return (
      <div style={{
        background: cardBg,
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="text-muted mt-3 mb-0">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: cardBg,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isDarkMode
          ? '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
          : '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        border: 'none'
      }}>
        {/* Cover Image */}
        <div style={{
          height: '80px',
          backgroundImage: `url(${bgBannerImg.src})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }} />

        {/* Profile Content */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div className="text-center">
            {/* Avatar */}
            <div className="position-relative d-inline-block" style={{ marginTop: '-50px' }}>
              <div
                className="position-relative"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                style={{ cursor: 'pointer' }}
              >
                {imageLoading && (
                  <div
                    className="position-absolute top-0 start-0 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: isDarkMode ? '#464950' : '#f5f5f5',
                      zIndex: 2,
                      border: `5px solid ${cardBg}`
                    }}
                  >
                    <div className="spinner-border spinner-border-sm text-success" role="status">
                      <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                  </div>
                )}
                <img
                  src={getImageUrl(user?.photoUrl, false)}
                  alt="avatar"
                  className="rounded-circle"
                  key={imageKey}
                  style={{
                    width: '100px',
                    height: '100px',
                    transition: 'transform 0.3s ease',
                    opacity: imageLoading ? 0 : 1,
                    border: `5px solid ${cardBg}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    objectFit: 'cover'
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                    setImageLoading(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div
                  className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '36px',
                    height: '36px',
                    bottom: '5px',
                    right: '5px',
                    background: '#66BB6A',
                    boxShadow: '0 4px 16px rgba(102, 187, 106, 0.5)',
                    border: `3px solid ${cardBg}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.background = '#4CAF50';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = '#66BB6A';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 187, 106, 0.5)';
                  }}
                >
                  <BsCamera className="text-white" size={18} />
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
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bs-gray-100, #f8f9fa)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <BsEye size={18} className="me-2 text-primary flex-shrink-0" />
                      <span>Profil resmini gör</span>
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
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = hoverBg;
                        e.currentTarget.style.backgroundColor = hoverBg;
                      }}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <BsImage size={18} className="me-2 text-success flex-shrink-0" />
                      <span>Profil resmi seç</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Info */}
            <h5 className="mb-1 mt-3 fw-bold">
              {user?.id && user?.id !== 'undefined' ? (
                <Link
                  href={`/profile/user/${user.id}`}
                  className="text-decoration-none"
                  style={{
                    color: headingColor,
                    transition: 'color 0.3s ease'
                  }}
                  onClick={() => onLinkClick && onLinkClick()}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#66BB6A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = headingColor}
                >
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : (user.name || t('profile.user'))
                  }
                </Link>
              ) : (
                <span style={{ color: headingColor }}>
                  {user ? (
                    (user.firstName || user.lastName)
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : (user.name || t('profile.user'))
                  ) : t('profile.user')}
                </span>
              )}
            </h5>
            <small className="text-muted">@{user?.username || user?.email || t('profile.user')}</small>

            {user?.bio && (
              <div className="mt-2 mb-2">
                <p className="mb-1 text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {bioExpanded || user.bio.length <= 100
                    ? user.bio
                    : `${user.bio.slice(0, 100)}...`}
                </p>
                {user.bio.length > 100 && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="btn btn-link p-0 text-decoration-none"
                    style={{
                      fontSize: '0.8rem',
                      color: '#66BB6A',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4CAF50'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#66BB6A'}
                  >
                    {bioExpanded ? 'Daha Az Göster' : 'Daha Fazla Göster'}
                  </button>
                )}
              </div>
            )}

            {/* Stats - Pill Design */}
            <div className="d-flex gap-1 justify-content-center mt-3 flex-nowrap">
              <Link
                href="/feed/followers"
                className="text-decoration-none"
                onClick={() => onLinkClick && onLinkClick()}
              >
                <div style={{
                  padding: '0.4rem 0.5rem',
                  borderRadius: '50px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(102,187,106,0.15)' : 'rgba(102,187,106,0.1)';
                    e.currentTarget.style.borderColor = '#66BB6A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  <span style={{ fontWeight: 700, color: headingColor, marginRight: '4px' }}>{followStats.followersCount}</span>
                  <span style={{ fontSize: '0.8rem', color: isDarkMode ? '#999' : '#666' }}>{t('profile.followers')}</span>
                </div>
              </Link>

              <Link
                href="/feed/following"
                className="text-decoration-none"
                onClick={() => onLinkClick && onLinkClick()}
              >
                <div style={{
                  padding: '0.4rem 0.5rem',
                  borderRadius: '50px',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(102,187,106,0.15)' : 'rgba(102,187,106,0.1)';
                    e.currentTarget.style.borderColor = '#66BB6A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  <span style={{ fontWeight: 700, color: headingColor, marginRight: '4px' }}>{followStats.followingCount}</span>
                  <span style={{ fontSize: '0.8rem', color: isDarkMode ? '#999' : '#666' }}>{t('profile.following')}</span>
                </div>
              </Link>
            </div>
          </div>

          <hr style={{ margin: '0.75rem 0', opacity: 0.1 }} />

          {/* Navigation - Clean & Minimal */}
          <ul className="nav flex-column" style={{ gap: '2px', padding: 0, margin: 0, listStyle: 'none' }}>
            {links.map((item, idx) => (
              <li key={item.nameKey + idx}>
                <Link
                  className="d-flex align-items-center text-decoration-none"
                  href={item.link}
                  onClick={() => onLinkClick && onLinkClick()}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    transition: 'all 0.2s',
                    background: (pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link)))
                      ? '#66BB6A'
                      : 'transparent',
                    color: (pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link)))
                      ? 'white'
                      : textColor,
                    fontWeight: (pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link))) ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!(pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link)))) {
                      e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link)))) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <img
                    src={item.image}
                    alt="icon"
                    height={18}
                    width={18}
                    style={{
                      marginRight: '12px',
                      opacity: (pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link))) ? 1 : 0.7,
                      filter: (pathname === item.link || (item.link !== '/' && pathname?.startsWith(item.link)))
                        ? 'brightness(0) invert(1)'
                        : 'none'
                    }}
                  />
                  <span>{t(item.nameKey)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <hr style={{ margin: '0.75rem 0', opacity: 0.1 }} />

          {/* View Profile - Elegant CTA */}
          <Link
            href={user?.id && user?.id !== 'undefined' ? `/profile/user/${user.id}/feed` : '/profile/feed'}
            className="d-block text-center text-decoration-none"
            onClick={() => onLinkClick && onLinkClick()}
            style={{
              padding: '0.75rem',
              background: isDarkMode ? 'rgba(102,187,106,0.1)' : 'rgba(102,187,106,0.08)',
              color: '#66BB6A',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? 'rgba(102,187,106,0.2)' : 'rgba(102,187,106,0.15)'}`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#66BB6A';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(102,187,106,0.1)' : 'rgba(102,187,106,0.08)';
              e.currentTarget.style.color = '#66BB6A';
            }}
          >
            {t('profile.viewProfile')}
          </Link>
        </div>
      </div>

      {/* Profil Resmini Görüntüleme Modalı */}
      <Modal
        show={showPhotoViewModal}
        onHide={() => setShowPhotoViewModal(false)}
        centered
        size="lg"
        className="modern-modal"
      >
        <div className="modal-content border-0 shadow-lg bg-dark">
          <ModalHeader closeButton className="border-0 bg-dark text-white">
            <h5 className="modal-title mb-0 fw-bold">Profil Resmi</h5>
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
              Kapat
            </button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Profil Resmi Güncelleme Modalı */}
      <Modal
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
                <h5 className="modal-title mb-0 fw-bold" style={{ color: headingColor }}>Profil Resmini Güncelle</h5>
                <small className="text-muted">Yeni profil resmi seç</small>
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
              backgroundColor: isDarkMode ? '#202227' : '#f8f9fa',
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
                <h6 className="fw-bold mb-2" style={{ color: headingColor }}>Fotoğraf Seç</h6>
                <small className="text-muted d-block mb-2">
                  Maksimum dosya boyutu: 10MB
                </small>
                <small className="text-muted">
                  Desteklenen formatlar: JPG, PNG, GIF, WebP
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
                İptal
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
                    Yükleniyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePanel;