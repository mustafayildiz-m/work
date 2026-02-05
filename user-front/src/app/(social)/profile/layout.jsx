'use client';

import GlightBox from '@/components/GlightBox';
import { useFetchData } from '@/hooks/useFetchData';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Modal, ModalHeader, ModalBody, ModalFooter } from 'react-bootstrap';
import { BsBookmark, BsBriefcase, BsCalendarDate, BsChatLeftText, BsGear, BsGeoAlt, BsPatchCheckFill, BsPencilFill, BsPersonX, BsThreeDots, BsCamera, BsCheckCircleFill, BsEye, BsImage, BsShare, BsWhatsapp, BsNewspaper } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa6';
import { PROFILE_MENU_ITEMS } from '@/assets/data/menu-items';
import { getUserIdFromToken } from '../../../utils/auth';
import { useNotificationContext } from '@/context/useNotificationContext';
import { generateProfileUrl } from '@/utils/profileEncoder';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/useLanguageContext';

// Menu definitions moved or handled via keys


import { experienceData } from './data';
import avatar7 from '@/assets/images/avatar/07.jpg';
import background5 from '@/assets/images/bg/05.jpg';
import album1 from '@/assets/images/albums/01.jpg';
import album2 from '@/assets/images/albums/02.jpg';
import album3 from '@/assets/images/albums/03.jpg';
import album4 from '@/assets/images/albums/04.jpg';
import album5 from '@/assets/images/albums/05.jpg';
import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
const Experience = () => {
  return <Card>
    <CardHeader className="d-flex justify-content-between border-0">
      <h5 className="card-title">Experience</h5>
      <Button variant="primary-soft" size="sm">
        {' '}
        <FaPlus />{' '}
      </Button>
    </CardHeader>
    <CardBody className="position-relative pt-0">
      {experienceData.map((experience, idx) => <div className="d-flex" key={idx}>
        <div className="avatar me-3">
          <span role="button">
            {' '}
            <Image className="avatar-img rounded-circle" src={experience.logo} alt="" />{' '}
          </span>
        </div>
        <div>
          <h6 className="card-title mb-0">
            <Link href=""> {experience.title} </Link>
          </h6>
          <p className="small">
            {experience.description}{' '}
            <Link className="btn btn-primary-soft btn-xs ms-2" href="">
              Edit{' '}
            </Link>
          </p>
        </div>
      </div>)}
    </CardBody>
  </Card>;
};

const Photos = () => {
  return <Card>
    <CardHeader className="d-sm-flex justify-content-between border-0">
      <CardTitle>Photos</CardTitle>
      <Button variant="primary-soft" size="sm">
        {' '}
        See all photo
      </Button>
    </CardHeader>
    <CardBody className="position-relative pt-0">
      <Row className="g-2">
        <Col xs={6}>
          <GlightBox href={album1.src} data-gallery="image-popup">
            <Image className="rounded img-fluid" src={album1} alt="album-image" />
          </GlightBox>
        </Col>
        <Col xs={6}>
          <GlightBox href={album2.src} data-gallery="image-popup">
            <Image className="rounded img-fluid" src={album2} alt="album-image" />
          </GlightBox>
        </Col>
        <Col xs={4}>
          <GlightBox href={album3.src} data-gallery="image-popup">
            <Image className="rounded img-fluid" src={album3} alt="album-image" />
          </GlightBox>
        </Col>
        <Col xs={4}>
          <GlightBox href={album4.src} data-gallery="image-popup">
            <Image className="rounded img-fluid" src={album4} alt="album-image" />
          </GlightBox>
        </Col>
        <Col xs={4}>
          <GlightBox href={album5.src} data-gallery="image-popup">
            <Image className="rounded img-fluid" src={album5} alt="album-image" />
          </GlightBox>
        </Col>
      </Row>
    </CardBody>
  </Card>;
};

// Friends component will be defined inside ProfileLayout



const ProfileLayout = ({
  children
}) => {
  const pathName = usePathname();
  const params = useParams();
  const { data: session, update } = useSession();
  const { t, locale } = useLanguage();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Friends component state
  const [allScholars, setAllScholars] = useState([]);
  const [displayedScholars, setDisplayedScholars] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 8; // Show 8 scholars per page

  // Tarih formatını düzenle
  const formatDate = (dateString) => {
    if (!dateString) return t('userProfile.notSpecified');

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
      return date.toLocaleDateString(localeMap[locale] || 'tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Tarih ve saat formatını düzenle (daha okunaklı)
  const formatDateTime = (dateString) => {
    if (!dateString) return t('userProfile.notSpecified');

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

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      // Çok yakın zamanda (1 dakikadan az)
      if (diffInSeconds < 60) {
        return t('common.justNow');
      }
      // 1 saatten az
      else if (diffInMinutes < 60) {
        return t('common.minutesAgo', { count: diffInMinutes });
      }
      // 1 günden az
      else if (diffInHours < 24) {
        return t('common.hoursAgo', { count: diffInHours });
      }
      // 1 haftadan az
      else if (diffInDays < 7) {
        return t('common.daysAgo', { count: diffInDays });
      }
      // 1 aydan az
      else if (diffInDays < 30) {
        return t('common.weeksAgo', { count: diffInWeeks });
      }
      // 1 yıldan az
      else if (diffInDays < 365) {
        return t('common.monthsAgo', { count: diffInMonths });
      }
      // 1 yıldan fazla
      else {
        return t('common.yearsAgo', { count: diffInYears });
      }
    } catch (error) {
      return dateString;
    }
  };

  const [followLoading, setFollowLoading] = useState(false);
  const [profileType, setProfileType] = useState(null); // 'scholar' or 'user'
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoViewModal, setShowPhotoViewModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { showNotification } = useNotificationContext();
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0
  });

  // Reusable: fetch follow statistics for current context (scholar/user)
  const fetchFollowStatsForContext = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Scholar profile: only followersCount
      if (profileType === 'scholar' && params?.id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars/${params.id}/follow-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFollowStats({
            followersCount: data.followersCount || 0,
            followingCount: 0
          });
        }
        return;
      }

      // Specific user profile or own profile
      let targetUserId = params?.id;
      if (!targetUserId) {
        targetUserId = getUserIdFromToken();
      }
      if (!targetUserId) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${targetUserId}/follow-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFollowStats({
          followersCount: data.followersCount || 0,
          followingCount: data.followingUsersCount || 0
        });
      }
    } catch (error) {
      // console.error('Error fetching follow stats:', error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Determine profile type from URL
        const isScholarProfile = pathName.includes('/profile/scholar/');
        const isUserProfile = pathName.includes('/profile/user/');
        const isGeneralProfile = pathName === '/profile/feed' || pathName === '/profile/about';

        if (isScholarProfile) {
          setProfileType('scholar');
          await fetchScholarData();
        } else if (isUserProfile) {
          setProfileType('user');
          await fetchUserData();
        } else if (isGeneralProfile) {
          // For general profile routes, treat as current user profile
          setProfileType('user');
          await fetchCurrentUserData();
        } else {
          // Default to current user profile if no specific pattern matches
          setProfileType('user');
          await fetchCurrentUserData();
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchScholarData = async () => {
      try {
        const scholarId = params.id;
        if (scholarId) {
          const token = localStorage.getItem('token');
          const userId = getUserIdFromToken();

          // Add userId as query parameter to get follow status
          const url = userId
            ? `${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}?userId=${userId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/scholars/${scholarId}`;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData(data);

            if (data.isFollowing !== undefined) {
              setIsFollowing(data.isFollowing);
            }
          } else if (response.status === 404) {
            // Scholar not found - will be handled by child page
            setProfileData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching scholar data:', error);
      }
    };

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
            setProfileData(data);

            if (data.isFollowing !== undefined) {
              setIsFollowing(data.isFollowing);
            }
          } else {
            // console.error('User not found');
          }
        }
      } catch (error) {
        // console.error('Error fetching user data:', error);
      }
    };

    const fetchCurrentUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // console.error('No token found');
          return;
        }

        // Get current user ID from token
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const userId = decodedPayload.sub;

        if (userId) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
            // Current user can't follow themselves
            setIsFollowing(false);
          } else {
            // console.error('Current user not found');
          }
        }
      } catch (error) {
        // console.error('Error fetching current user data:', error);
      }
    };

    fetchProfileData();
  }, [params.id, pathName]);

  // Fetch follow statistics (context aware)
  useEffect(() => {
    fetchFollowStatsForContext();
  }, [profileType, params?.id]);

  // Friends component functions
  useEffect(() => {
    const fetchScholars = async () => {
      try {
        setFriendsLoading(true);
        const token = localStorage.getItem('token');

        // Fetch all scholars first
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/scholars`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const scholars = data.scholars || data;
          setAllScholars(scholars);
          setTotalCount(scholars.length);

          // Show first page
          const firstPage = scholars.slice(0, ITEMS_PER_PAGE);
          setDisplayedScholars(firstPage);
          setHasMore(scholars.length > ITEMS_PER_PAGE);
          setCurrentPage(1);
        }
      } catch (error) {
        // console.error('Error fetching scholars:', error);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchScholars();
  }, []);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newScholars = allScholars.slice(startIndex, endIndex);

      setDisplayedScholars(prev => [...prev, ...newScholars]);
      setHasMore(endIndex < allScholars.length);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 500);
  };

  // Helper function to get proper image URL - Memoized to prevent flickering
  const getScholarImageUrl = useCallback((photoUrl) => {
    // Type checking - if not a string, return default avatar
    if (!photoUrl || typeof photoUrl !== 'string') {
      console.warn('Invalid photoUrl:', photoUrl);
      return avatar7.src;
    }

    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    // If it's already a full URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    return avatar7.src;
  }, []);

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      // Ensure the path starts with a slash
      const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return photoUrl;
  };



  // Follow/Unfollow functions
  // Profil resmi seçme
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü
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

  // Profil resmi yükleme
  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem('token');
      const currentUserId = getUserIdFromToken();

      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUserId}/photo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Profil verilerini güncelle
        setProfileData(prev => ({
          ...prev,
          photoUrl: updatedUser.photoUrl,
          photo_url: updatedUser.photoUrl
        }));

        // Update session if using NextAuth
        if (session?.user) {
          await update({
            ...session,
            user: {
              ...session.user,
              photoUrl: updatedUser.photoUrl
            }
          });
        }

        showNotification({
          title: 'Başarılı',
          message: 'Profil resminiz güncellendi',
          variant: 'success'
        });

        // Modalı kapat ve state'leri temizle
        setShowPhotoModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);

        // Trigger event to update all components
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

  // Mevcut profil resminin sahibi mi kontrolü
  const isOwnProfile = () => {
    const currentUserId = getUserIdFromToken();
    return currentUserId && profileData && (currentUserId === profileData.id);
  };

  // Profil URL'sini oluştur (encoded)
  const getProfileUrl = () => {
    const baseUrl = window.location.origin;
    const currentLang = locale || 'tr'; // Mevcut dil

    if (profileType === 'scholar' && params?.id) {
      return generateProfileUrl('scholar', params.id, baseUrl, currentLang);
    } else if (profileType === 'user' && params?.id) {
      return generateProfileUrl('user', params.id, baseUrl, currentLang);
    } else {
      // Kendi profilimiz için
      const currentUserId = getUserIdFromToken();
      if (currentUserId) {
        return generateProfileUrl('user', currentUserId, baseUrl, currentLang);
      }
    }

    return '';
  };

  // Profil paylaşma fonksiyonu
  const handleShareProfile = async () => {
    try {
      const profileUrl = getProfileUrl();
      const profileName = getProfileDisplayName();
      const shareData = {
        title: `${profileName} - ${profileType === 'scholar' ? t('profileStatus.scholar') : t('profileStatus.user')}`,
        text: `${profileName} profilini görüntüle`,
        url: profileUrl
      };

      // Web Share API destekleniyor mu kontrol et
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: URL'yi panoya kopyala
        await navigator.clipboard.writeText(profileUrl);
        showNotification({
          title: t('profileActions.profileLinkCopied'),
          message: t('profileActions.profileLinkCopiedDesc'),
          variant: 'success'
        });
      }
    } catch (error) {
      // Kullanıcı paylaşımı iptal ettiyse veya hata olduysa
      if (error.name !== 'AbortError') {
        console.error('Error sharing profile:', error);
        showNotification({
          title: t('profileActions.shareError'),
          message: t('profileActions.shareErrorDesc'),
          variant: 'danger'
        });
      }
    }
  };

  // WhatsApp'ta paylaş
  const handleShareOnWhatsApp = () => {
    try {
      const profileUrl = getProfileUrl();
      const profileName = getProfileDisplayName();

      // Dile göre mesaj şablonu
      const messageTemplates = {
        tr: `${profileName} profilini görüntüle: ${profileUrl}`,
        en: `View ${profileName}'s profile: ${profileUrl}`,
        ar: `عرض ملف ${profileName} الشخصي: ${profileUrl}`,
        de: `${profileName}s Profil ansehen: ${profileUrl}`,
        fr: `Voir le profil de ${profileName}: ${profileUrl}`,
        ja: `${profileName}のプロフィールを見る: ${profileUrl}`
      };

      const currentLang = locale || 'tr';
      const message = messageTemplates[currentLang] || messageTemplates['tr'];
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing on WhatsApp:', error);
      showNotification({
        title: t('profileActions.shareError'),
        message: t('profileActions.shareErrorDesc'),
        variant: 'danger'
      });
    }
  };

  // Haber akışında paylaş
  const handleShareToFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!token || !userId) {
        showNotification({
          title: 'Hata',
          message: 'Giriş yapmalısınız',
          variant: 'danger'
        });
        return;
      }

      const profileName = getProfileDisplayName();
      const profileUrl = getProfileUrl();

      // Profil ID'sini al
      const sharedProfileId = params?.id || userId;

      // Post oluştur
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('type', 'shared_profile');
      formData.append('title', ''); // Empty title for shared profile posts
      formData.append('content', `${profileName} profilini paylaştı`);
      formData.append('shared_profile_type', profileType);
      formData.append('shared_profile_id', sharedProfileId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        showNotification({
          title: 'Başarılı',
          message: 'Profil haber akışında paylaşıldı',
          variant: 'success'
        });
      } else {
        throw new Error('Paylaşım başarısız');
      }
    } catch (error) {
      console.error('Error sharing to feed:', error);
      showNotification({
        title: t('profileActions.shareError'),
        message: t('profileActions.shareErrorDesc'),
        variant: 'danger'
      });
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      //   profileType,
      //   profileId: params.id,
      //   userId,
      //   token: token ? 'Token exists' : 'No token'
      // });

      if (!userId) {
        // console.error('User ID not found');
        return;
      }

      let response;
      if (profileType === 'scholar') {
        const requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(params.id)
        };

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-scholar-follow/follow`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else if (profileType === 'user') {
        const requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(params.id)
        };

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/follow`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      //   status: response.status,
      //   ok: response.ok
      // });

      if (response.ok) {
        setIsFollowing(true);
        // Keep profile data in sync to avoid stale UI
        setProfileData(prev => prev ? { ...prev, isFollowing: true } : prev);
        // Refresh follow stats immediately
        fetchFollowStatsForContext();
      } else {
        // console.error('Follow failed');
      }
    } catch (error) {
      // console.error('Error following:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setFollowLoading(true);
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      //   profileType,
      //   profileId: params.id,
      //   userId,
      //   token: token ? 'Token exists' : 'No token'
      // });

      if (!userId) {
        // console.error('User ID not found');
        return;
      }

      let response;
      if (profileType === 'scholar') {
        const requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(params.id)
        };

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-scholar-follow/unfollow`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else if (profileType === 'user') {
        const requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(params.id)
        };

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/unfollow`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      //   status: response.status,
      //   ok: response.ok
      // });

      if (response.ok) {
        setIsFollowing(false);
        // Keep profile data in sync to avoid stale UI
        setProfileData(prev => prev ? { ...prev, isFollowing: false } : prev);
        // Refresh follow stats immediately
        fetchFollowStatsForContext();
      } else {
        // console.error('Unfollow failed');
      }
    } catch (error) {
      // console.error('Error unfollowing:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Get profile display name
  const getProfileDisplayName = () => {
    if (!profileData) return profileType === 'scholar' ? t('profileStatus.scholar') : t('profileStatus.user');

    if (profileType === 'scholar') {
      return profileData.fullName || t('profileStatus.scholar');
    } else {
      return profileData.firstName && profileData.lastName
        ? `${profileData.firstName} ${profileData.lastName}`
        : profileData.name || profileData.fullName || t('profileStatus.user');
    }
  };

  // Get profile location
  const getProfileLocation = () => {
    if (!profileData) return profileType === 'scholar' ? 'Türkiye' : t('userProfile.notSpecified');

    if (profileType === 'scholar') {
      return profileData.locationName || 'Türkiye';
    } else {
      return profileData.location || profileData.locationName || t('userProfile.notSpecified');
    }
  };

  // Get profile date info
  const getProfileDateInfo = () => {
    if (!profileData) return profileType === 'scholar' ? t('userProfile.notSpecified') : t('userProfile.notSpecified');

    if (profileType === 'scholar') {
      return profileData.birthDate ? `${profileData.birthDate} - ${profileData.deathDate || t('profileStatus.today')}` : t('userProfile.notSpecified');
    } else {
      return profileData.joinDate || profileData.createdAt || profileData.created_at || t('userProfile.notSpecified');
    }
  };

  // Get profile bio
  const getProfileBio = () => {
    if (!profileData) return profileType === 'scholar' ? t('sidebar.noScholarBiography') : t('sidebar.noBiography');

    if (profileType === 'scholar') {
      return profileData.biography || t('sidebar.noScholarBiography');
    } else {
      return profileData.biography || profileData.description || t('sidebar.noBiography');
    }
  };

  // Get menu items based on profile type
  // Get menu items based on profile type
  const getMenuItems = () => {
    let items = [];
    if (profileType === 'user') {
      items = [
        {
          key: 'profile-feed',
          label: t('profileMenu.feed'),
          url: `/profile/user/${params.id}/feed`
        },
        {
          key: 'profile-about',
          label: t('profileMenu.about'),
          url: `/profile/user/${params.id}`
        }
      ];
    } else if (profileType === 'scholar') {
      items = [
        {
          key: 'profile-feed',
          label: t('profileMenu.feed'),
          url: `/profile/scholar/${params.id}/feed`
        },
        {
          key: 'profile-about',
          label: t('profileMenu.about'),
          url: `/profile/scholar/${params.id}`
        },
        {
          key: 'profile-activity',
          label: t('profileMenu.activity'),
          url: `/profile/scholar/${params.id}/activity`
        },
        {
          key: 'profile-connections',
          label: t('profileMenu.books'),
          url: `/profile/scholar/${params.id}/connections`
        }
      ];
    } else {
      // Fallback for general profile or others
      items = PROFILE_MENU_ITEMS.map(item => ({
        ...item,
        label: t(item.label)
      }));
    }
    return items;
  };

  // Build dynamic URLs based on profile type
  const buildDynamicUrl = (item) => {
    const profileId = params.id;
    let dynamicUrl = item.url;

    // Safety check for undefined or null profileId
    if (!profileId || profileId === 'undefined') {
      // Fallback logic if we don't have a valid ID
      if (item.key === 'profile-feed') return '/profile/feed';
      if (item.key === 'profile-about') return '/profile/about';
      return '/profile';
    }

    if (profileType === 'scholar') {
      if (item.key === 'profile-feed') {
        dynamicUrl = `/profile/scholar/${profileId}/feed`;
      } else if (item.key === 'profile-about') {
        dynamicUrl = `/profile/scholar/${profileId}`;
      } else if (item.key === 'profile-activity') {
        dynamicUrl = `/profile/scholar/${profileId}/activity`;
      } else if (item.key === 'profile-connections') {
        dynamicUrl = `/profile/scholar/${profileId}/connections`;
      }
    } else if (profileType === 'user') {
      // Specific user profile
      if (item.key === 'profile-feed') {
        dynamicUrl = `/profile/user/${profileId}/feed`;
      } else if (item.key === 'profile-about') {
        dynamicUrl = `/profile/user/${profileId}`;
      }
    }

    return dynamicUrl;
  };

  return <>
    <main>
      <Container>
        <Row className="g-4">
          <Col lg={pathName.includes('/profile/scholar/') || pathName.includes('/profile/user/') ? 12 : 8} className="vstack gap-4">
            <Card className="shadow-sm border-0 profile-cover-card" style={{
              borderRadius: '24px',
              overflow: 'visible'
            }}>
              <div className="h-200px rounded-top" style={{
                backgroundImage: `url(${profileData?.coverImage ? getImageUrl(profileData.coverImage) : background5.src})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                borderRadius: '24px 24px 0 0'
              }} />


              <CardBody className="py-0" style={{ overflow: 'visible' }}>
                <div className="d-sm-flex align-items-start text-center text-sm-start">
                  <div>
                    <div className="position-relative d-inline-block">
                      <div
                        className="avatar avatar-xxl mt-n5 mb-3 position-relative"
                        style={{
                          cursor: isOwnProfile() ? 'pointer' : 'default',
                          border: 'none',
                          background: 'transparent',
                          boxShadow: 'none'
                        }}
                        onClick={() => isOwnProfile() && setShowAvatarMenu(!showAvatarMenu)}
                      >
                        <img
                          className="avatar-img rounded-circle"
                          src={getImageUrl(profileData?.photoUrl || profileData?.photo_url)}
                          alt="avatar"
                          width={120}
                          height={120}
                          style={{
                            objectFit: 'cover',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                            border: 'none'
                          }}
                          onError={(e) => {
                            e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                          }}
                        />
                        {isOwnProfile() && (
                          <div
                            className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              bottom: 0,
                              right: 0,
                              width: '36px',
                              height: '36px',
                              background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                              boxShadow: '0 2px 8px rgba(102, 187, 106, 0.4)'
                            }}
                          >
                            <BsCamera className="text-white" size={16} />
                          </div>
                        )}
                      </div>

                      {isOwnProfile() && showAvatarMenu && (
                        <>
                          <div
                            className="position-fixed top-0 start-0 w-100 h-100"
                            style={{ zIndex: 1040 }}
                            onClick={() => setShowAvatarMenu(false)}
                          />
                          <div className="profile-avatar-menu" style={{ left: '0', top: 'calc(100% + 5px)' }}>
                            <button
                              className="avatar-menu-item"
                              onClick={() => {
                                setShowAvatarMenu(false);
                                setShowPhotoViewModal(true);
                              }}
                            >
                              <BsEye size={18} className="text-primary" />
                              <span>{t('profileActions.viewPhoto')}</span>
                            </button>
                            <div className="dropdown-divider"></div>
                            <button
                              className="avatar-menu-item"
                              onClick={() => {
                                setShowAvatarMenu(false);
                                setShowPhotoModal(true);
                              }}
                            >
                              <BsImage size={18} className="text-success" />
                              <span>{t('profileActions.selectPhoto')}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ms-sm-4 mt-sm-3">
                    <h1 className="mb-0 fw-bold" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">{t('common.loading')}</span>
                        </div>
                      ) : (
                        <>
                          {getProfileDisplayName()}
                          <BsPatchCheckFill className="text-success ms-2" style={{ fontSize: '1.25rem' }} />
                        </>
                      )}
                    </h1>
                  </div>
                  <div className="d-flex mt-3 justify-content-center ms-sm-auto">
                    {/* Follow Button - Only show for other users, not current user */}
                    {(() => {
                      // Check if this is the current user's profile
                      try {
                        const token = localStorage.getItem('token');
                        if (token) {
                          const payload = token.split('.')[1];
                          const decodedPayload = JSON.parse(atob(payload));
                          const currentUserId = decodedPayload.sub;


                          // If no params.id (general profile) or params.id matches current user
                          if (!params.id || params.id === currentUserId || params.id === currentUserId.toString()) {
                            return (
                              <Button
                                as={Link}
                                href="/settings/account"
                                variant="outline-primary"
                                size="sm"
                                className="me-2 px-4"
                                style={{
                                  borderRadius: '50px',
                                  fontWeight: '500',
                                  borderWidth: '2px'
                                }}
                              >
                                {t('profileActions.editProfile')}
                              </Button>
                            );
                          }
                        }
                      } catch (error) {
                        // console.error('Error checking current user:', error);
                      }

                      // Show follow button for other users
                      return (
                        <>
                          {isFollowing ? (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-2 px-4"
                              onClick={handleUnfollow}
                              disabled={followLoading}
                              style={{
                                borderRadius: '50px',
                                fontWeight: '500',
                                borderWidth: '2px'
                              }}
                            >
                              {followLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  {t('profileActions.following')}
                                </>
                              ) : (
                                t('profileActions.unfollow')
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="me-2 px-4"
                              onClick={handleFollow}
                              disabled={followLoading}
                              style={{
                                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                                border: 'none',
                                borderRadius: '50px',
                                fontWeight: '500',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)'
                              }}
                            >
                              {followLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  {t('profileActions.followLoading')}
                                </>
                              ) : (
                                t('profileActions.follow')
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}

                    <Dropdown drop="down" align="end">
                      <DropdownToggle
                        variant="secondary-soft"
                        className="border-0 rounded-circle p-0"
                        bsPrefix="btn"
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <BsThreeDots size={20} />
                      </DropdownToggle>
                      <DropdownMenu
                        style={{
                          position: 'absolute',
                          zIndex: 9999,
                          minWidth: '200px'
                        }}
                      >
                        <DropdownItem onClick={handleShareProfile}>
                          <BsShare size={20} className="me-2" />
                          {t('profileActions.shareProfile')}
                        </DropdownItem>
                        <DropdownItem onClick={handleShareOnWhatsApp}>
                          <BsWhatsapp size={20} className="me-2 text-success" />
                          {t('profileActions.shareOnWhatsApp')}
                        </DropdownItem>
                        <DropdownItem onClick={handleShareToFeed}>
                          <BsNewspaper size={20} className="me-2 text-primary" />
                          {t('profileActions.shareToFeed')}
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                <ul className="list-inline mb-0 text-center text-sm-start mt-3 mt-sm-0" style={{ fontSize: '0.9rem' }}>
                  <li className="list-inline-item me-3">
                    <BsBriefcase className="me-2" style={{ color: '#66BB6A' }} />
                    <span className="text-muted">
                      {profileType === 'scholar'
                        ? t('profileStatus.scholar')
                        : (profileData?.role ? t(`userProfile.${profileData.role}`, profileData.role) : t('profileStatus.user'))}
                    </span>
                  </li>
                  <li className="list-inline-item me-3">
                    <BsGeoAlt className="me-2" style={{ color: '#66BB6A' }} />
                    <span className="text-muted">{getProfileLocation()}</span>
                  </li>
                  <li className="list-inline-item">
                    <BsCalendarDate className="me-2" style={{ color: '#66BB6A' }} />
                    <span className="text-muted">{formatDateTime(profileData?.createdAt || profileData?.created_at || profileData?.joinDate)}</span>
                  </li>
                </ul>

                {/* Takipçi ve Takip Edilen Sayıları */}
                <div className="d-flex gap-4 justify-content-center mt-3">
                  <Link href={(() => {
                    try {
                      const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
                      if (token) {
                        const payload = token.split('.')[1];
                        const decodedPayload = JSON.parse(atob(payload));
                        const currentUserId = decodedPayload.sub?.toString();
                        if (profileType === 'user' && params?.id && params.id.toString() !== currentUserId) {
                          return `/profile/user/${params.id}/followers`;
                        }
                        if (profileType === 'scholar' && params?.id) {
                          return `/profile/scholar/${params.id}/followers`;
                        }
                      }
                    } catch (e) { }
                    return '/feed/followers';
                  })()} className="text-decoration-none text-center">
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#2C3E50' }}>{followStats.followersCount}</h6>
                    <small className="text-muted" style={{ fontSize: '0.85rem' }}>{t('profileHeader.followers')}</small>
                  </Link>
                  {profileType !== 'scholar' && (
                    <>
                      <div className="vr" style={{ opacity: 0.2 }} />
                      <Link href={(() => {
                        try {
                          const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
                          if (token) {
                            const payload = token.split('.')[1];
                            const decodedPayload = JSON.parse(atob(payload));
                            const currentUserId = decodedPayload.sub?.toString();
                            if (profileType === 'user' && params?.id && params.id.toString() !== currentUserId) {
                              return `/profile/user/${params.id}/following`;
                            }
                          }
                        } catch (e) { }
                        return '/feed/following';
                      })()} className="text-decoration-none text-center">
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '1.25rem', color: '#2C3E50' }}>{followStats.followingCount}</h6>
                        <small className="text-muted" style={{ fontSize: '0.85rem' }}>{t('profileHeader.following')}</small>
                      </Link>
                    </>
                  )}
                </div>
              </CardBody>
              <CardFooter className="card-footer mt-3 pt-0 pb-0 border-0" style={{ background: 'transparent' }}>
                <ul className="nav nav-bottom-line align-items-center justify-content-center justify-content-md-start mb-0 border-0">
                  {getMenuItems().map((item, idx) => {
                    const dynamicUrl = buildDynamicUrl(item);
                    const isActive = pathName === dynamicUrl;

                    // Calculate book count for the Kitaplar tab (only for scholars)
                    const bookCount = profileType === 'scholar' && profileData ? (profileData.ownBooks?.length || 0) + (profileData.relatedBooks?.length || 0) : 0;

                    return (
                      <li className="nav-item" key={idx}>
                        <Link
                          className="nav-link"
                          href={dynamicUrl}
                          style={{
                            borderBottom: isActive ? '3px solid #66BB6A' : '3px solid transparent',
                            color: isActive ? '#66BB6A' : '#6c757d',
                            fontWeight: isActive ? '600' : '500',
                            padding: '1rem 1.25rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {item.label}
                          {item.key === 'profile-connections' && bookCount > 0 && (
                            <span
                              className="badge ms-2"
                              style={{
                                background: 'rgba(102, 187, 106, 0.1)',
                                color: '#66BB6A',
                                fontWeight: '500',
                                fontSize: '0.75rem'
                              }}
                            > {bookCount}</span>
                          )}
                          {item.badge && item.key !== 'profile-connections' && (
                            <span
                              className="badge ms-2"
                              style={{
                                background: 'rgba(102, 187, 106, 0.1)',
                                color: '#66BB6A',
                                fontWeight: '500',
                                fontSize: '0.75rem'
                              }}
                            > {item.badge.text}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardFooter>
            </Card>

            {/* Profil Resmini Görüntüleme Modalı */}
            <Modal
              show={showPhotoViewModal}
              onHide={() => {
                setShowPhotoViewModal(false)
              }
              }
              centered
              size="lg"
              contentClassName="border-0 shadow-lg bg-mode"
            >
              <ModalHeader closeButton closeVariant="white" className="border-0 bg-transparent text-white">
                <h5 className="modal-title mb-0 fw-bold text-reset">Profil Resmi</h5>
              </ModalHeader>
              <ModalBody className="p-4 bg-transparent">
                <div className="text-center">
                  <img
                    src={getImageUrl(profileData?.photoUrl || profileData?.photo_url)}
                    alt="Profile"
                    width={500}
                    height={500}
                    className="rounded-3 w-100"
                    style={{ maxHeight: '500px', objectFit: 'contain', width: '100%' }}
                    onError={(e) => {
                      e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-0 bg-transparent">
                <button
                  type="button"
                  className="btn btn-secondary-soft w-100"
                  onClick={() => setShowPhotoViewModal(false)}
                >
                  Kapat
                </button>
              </ModalFooter>
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
              contentClassName="border-0 shadow-lg bg-mode"
            >
              <ModalHeader closeButton closeVariant="white" className="border-0 pb-0 bg-transparent">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-shape icon-md rounded-circle bg-success bg-opacity-10 text-success me-3">
                    <BsCamera size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold text-reset">Profil Resmini Güncelle</h5>
                    <small className="text-secondary">Yeni profil resmi seç</small>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="pt-2">
                <div className="text-center mb-4">
                  <div className="avatar avatar-xxl mx-auto mb-3">
                    <img
                      className="avatar-img rounded-circle border border-3 border-secondary shadow"
                      src={photoPreview || getImageUrl(profileData?.photoUrl || profileData?.photo_url)}
                      alt="Preview"
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                      }}
                    />
                  </div>
                </div>

                <div className="upload-section p-4 rounded-3 bg-mode border border-2 border-dashed position-relative">
                  <label
                    htmlFor="profile-photo-upload"
                    className="d-block text-center mb-0"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="icon-shape icon-xl rounded-circle bg-mode shadow-sm mx-auto mb-3">
                      <BsCamera size={32} className="text-success" />
                    </div>
                    <h6 className="fw-bold mb-2">Fotoğraf Seç</h6>
                    <small className="text-secondary d-block mb-2">
                      Maksimum dosya boyutu: 10MB
                    </small>
                    <small className="text-secondary">
                      Desteklenen formatlar: JPG, PNG, GIF, WebP
                    </small>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                </div>

                {selectedPhoto && (
                  <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3">
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
              <ModalFooter className="border-0 pt-0 bg-transparent">
                <div className="d-flex w-100 gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary-soft flex-grow-1 py-2"
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
                        {t('profileStatus.loading')}
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </button>
                </div>
              </ModalFooter>
            </Modal>

            {children}
          </Col>
          {!pathName.includes('/profile/scholar/') && !pathName.includes('/profile/user/') && (
            <Col lg={4}>
              <Row className="g-4">
                <Col md={6} lg={12}>
                  <Card>
                    <CardHeader className="border-0 pb-0">
                      <CardTitle>{t('sidebar.about')}</CardTitle>
                    </CardHeader>
                    <CardBody className="position-relative pt-0">
                      <div dangerouslySetInnerHTML={{ __html: getProfileBio() }} />
                    </CardBody>
                  </Card>
                </Col>
                <Col md={6} lg={12}>
                  <Card>
                    <CardHeader className="d-sm-flex justify-content-between align-items-center border-0">
                      <CardTitle>
                        {t('sidebar.otherScholars')} <span className="badge bg-danger bg-opacity-10 text-danger">{totalCount}</span>
                      </CardTitle>
                      {hasMore && (
                        <Button variant="primary-soft" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                          {loadingMore ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              {t('profileStatus.loading')}
                            </>
                          ) : (
                            t('sidebar.loadMore')
                          )}
                        </Button>
                      )}
                    </CardHeader>
                    <CardBody className="position-relative pt-0">
                      {friendsLoading ? (
                        <div className="text-center py-4">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Row className="g-3">
                            {displayedScholars.map((scholar) => {
                              // Ensure scholar.photoUrl is a string
                              const photoUrl = typeof scholar.photoUrl === 'string'
                                ? scholar.photoUrl
                                : (scholar.photoUrl?.url || scholar.photoUrl?.src || '');

                              return (
                                <Col xs={6} key={`scholar-${scholar.id}`}>
                                  <Card className="shadow-none text-center h-100">
                                    <CardBody className="p-2 pb-0">
                                      <div className="avatar avatar-xl">
                                        <span role="button">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            className="avatar-img rounded-circle"
                                            src={getScholarImageUrl(photoUrl)}
                                            alt={scholar.fullName || 'Scholar'}
                                            width={48}
                                            height={48}
                                            loading="lazy"
                                            onError={(e) => {
                                              e.target.onerror = null; // Prevent infinite loop
                                              e.target.src = avatar7.src;
                                            }}
                                            style={{ objectFit: 'cover' }}
                                          />
                                        </span>
                                      </div>
                                      <h6 className="card-title mb-1 mt-3">
                                        <Link href={`/profile/scholar/${scholar.id}`}> {scholar.fullName} </Link>
                                      </h6>
                                      <p className="small text-muted mb-2">
                                        {scholar.birthDate} - {scholar.deathDate || t('profileStatus.today')}
                                      </p>
                                    </CardBody>
                                    <div className="card-footer p-2 border-0">
                                      <Link href={`/profile/scholar/${scholar.id}`} className="btn btn-sm btn-primary me-1">
                                        <BsChatLeftText /> {t('followers.viewProfile')}
                                      </Link>
                                    </div>
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>

                          {hasMore && (
                            <div className="text-center mt-3">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                              >
                                {loadingMore ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    {t('profileStatus.loading')}
                                  </>
                                ) : (
                                  t('sidebar.loadMore')
                                )}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </Container>
    </main >
  </>;
};

export default ProfileLayout;