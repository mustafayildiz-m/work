'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsCalendarDate, BsPlayCircle, BsEye, BsHeart, BsArrowLeft, BsShare, BsNewspaper, BsWhatsapp } from 'react-icons/bs';
import NewsImage from '../../components/NewsImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

const StoryDetail = ({ params }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [languages, setLanguages] = useState([]);
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated, userInfo } = useAuth();

  // Dilleri yükle
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/languages`, {
          headers: headers
        });


        if (response.ok) {
          const data = await response.json();
          setLanguages(data || []);
        }
      } catch (error) {
        console.error('Diller yüklenirken hata:', error);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    // Kullanıcı bazlı localStorage key'leri oluştur
    const userId = userInfo?.id;
    const likedStoriesKey = userId ? `likedStories_${userId}` : 'likedStories';
    const viewedStoriesKey = userId ? `viewedStories_${userId}` : 'viewedStories';

    // LocalStorage'dan beğeni ve görüntülenme durumlarını kontrol et
    const likedStories = JSON.parse(localStorage.getItem(likedStoriesKey) || '[]');
    const viewedStories = JSON.parse(localStorage.getItem(viewedStoriesKey) || '[]');

    setHasLiked(likedStories.includes(parseInt(id)));
    setHasViewed(viewedStories.includes(parseInt(id)));

    const fetchStoryDetail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/scholar-stories/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStory(data);

        // Kullanıcı bazlı localStorage key'leri oluştur
        const userId = userInfo?.id;
        const viewedStoriesKey = userId ? `viewedStories_${userId}` : 'viewedStories';
        const viewedStories = JSON.parse(localStorage.getItem(viewedStoriesKey) || '[]');

        // Sadece authenticated kullanıcılar ve daha önce görüntülenmemişse view count'u artır
        if (isAuthenticated && !viewedStories.includes(parseInt(id))) {
          try {
            // View count'u artır (authentication token ile)
            const token = localStorage.getItem('token');

            if (token) {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/scholar-stories/${id}/view`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              if (response.ok) {
                // LocalStorage'a ekle (kullanıcı bazlı key ile)
                const updatedViewedStories = [...viewedStories, parseInt(id)];
                localStorage.setItem(viewedStoriesKey, JSON.stringify(updatedViewedStories));
                setHasViewed(true);
              }
            }
          } catch (viewError) {
            console.warn('View count artırılamadı:', viewError);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching story detail:', err);

        // Fallback for API errors
        if (err.message.includes('fetch')) {
          setError('API bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStoryDetail();
    }
  }, [id, isAuthenticated]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLanguageLabel = (langCode) => {
    const language = languages.find(lang => lang.code === langCode);
    return language ? language.name : langCode;
  };

  const handleLike = async () => {
    // Eğer daha önce beğenilmişse veya kullanıcı giriş yapmamışsa işlem yapma
    if (hasLiked || !isAuthenticated) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/scholar-stories/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Beğeni sayısını güncelle
        setStory(prev => ({
          ...prev,
          like_count: (prev.like_count || 0) + 1
        }));

        // LocalStorage'a ekle (kullanıcı bazlı key ile)
        const userId = userInfo?.id;
        const likedStoriesKey = userId ? `likedStories_${userId}` : 'likedStories';
        const likedStories = JSON.parse(localStorage.getItem(likedStoriesKey) || '[]');
        const updatedLikedStories = [...likedStories, parseInt(id)];
        localStorage.setItem(likedStoriesKey, JSON.stringify(updatedLikedStories));
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
  };

  const handleShareToFeed = async () => {
    if (!story) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Giriş yapmalısınız');
        return;
      }
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload.userId || payload.sub;
      } catch {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            userId = JSON.parse(userData).id;
          } catch {}
        }
      }
      if (!userId) {
        toast.error('Kullanıcı bilgisi bulunamadı');
        return;
      }
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const formData = new FormData();
      formData.append('user_id', String(userId));
      formData.append('type', 'shared_story');
      formData.append('title', '');
      formData.append('content', `${story.title} hikayesini paylaştı`);
      formData.append('shared_story_id', String(story.id));

      const res = await fetch(`${API_BASE_URL}/user-posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('Hikaye haber akışında paylaşıldı');
        window.dispatchEvent(new CustomEvent('timelineRefreshRequested'));
        router.push('/feed/home');
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.message || errData?.error || `Paylaşım başarısız (${res.status})`;
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('Error sharing story to feed:', err);
      toast.error(err?.message || 'Haber akışında paylaşımda bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Hikaye yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>Hata!</Alert.Heading>
        <p>Hikaye yüklenirken bir hata oluştu: {error}</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Tekrar Dene
        </Button>
      </Alert>
    );
  }

  if (!story) {
    return (
      <Alert variant="warning" className="mb-4">
        <Alert.Heading>Hikaye Bulunamadı</Alert.Heading>
        <p>Aradığınız hikaye bulunamadı veya silinmiş olabilir.</p>
        <Link href="/blogs">
          <Button variant="outline-primary">
            <BsArrowLeft className="me-2" />
            Geri Dön
          </Button>
        </Link>
      </Alert>
    );
  }

  return (
    <div className="bg-mode p-4" style={{ marginTop: '80px' }}>
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/blogs">
          <Button variant="outline-secondary">
            <BsArrowLeft className="me-2" />
            Geri Dön
          </Button>
        </Link>
      </div>

      <Row className="g-4">
        {/* Main Content */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            {/* Video Section */}
            {story.video_url && (
              <div className="position-relative">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={story.video_url.includes('youtube.com')
                      ? story.video_url.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube-nocookie.com')
                      : story.video_url
                    }
                    title={story.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
                {/* Duration Badge */}
                {story.duration && (
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <Badge bg="dark" className="opacity-75">
                      {formatDuration(story.duration)}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Story Content */}
            <Card.Body className="p-4">
              {/* Title */}
              <h1 className="h3 mb-3 fw-bold">{story.title}</h1>

              {/* Scholar Info */}
              {story.scholar && (
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <NewsImage
                      src={story.scholar.photoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${story.scholar.photoUrl}` : '/logo/logo.png'}
                      alt={story.scholar.fullName}
                      width={24}
                      height={24}
                      className="rounded-circle"
                      style={{
                        objectFit: 'cover',
                        width: '24px',
                        height: '24px'
                      }}
                    />
                  </div>
                  <div>
                    <h6 className="mb-0 text-primary fw-semibold">{story.scholar.fullName}</h6>
                    <small className="text-muted">İslam Alimi</small>
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center">
                  <BsCalendarDate className="me-2 text-muted" />
                  <small className="text-muted">{formatDate(story.created_at)}</small>
                </div>
                <div className="d-flex align-items-center">
                  <BsEye className="me-2 text-muted" />
                  <small className="text-muted">{story.view_count || 0} görüntülenme</small>
                </div>
                <div className="d-flex align-items-center">
                  <BsHeart className="me-2 text-muted" />
                  <small className="text-muted">{story.like_count || 0} beğeni</small>
                </div>
                <Badge bg="primary" className="ms-auto">
                  {getLanguageLabel(story.language)}
                </Badge>
              </div>

              {/* Description */}
              {story.description && (
                <div className="mb-4">
                  <h5 className="mb-3">Hikaye Hakkında</h5>
                  <div
                    className="text-muted"
                    style={{
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6'
                    }}
                  >
                    {story.description}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 flex-wrap align-items-center">
                {story.video_url && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => window.open(story.video_url, '_blank')}
                  >
                    <BsPlayCircle className="me-2" />
                    Videoyu İzle
                  </Button>
                )}
                <Button
                  variant={hasLiked ? "success" : "outline-primary"}
                  size="lg"
                  onClick={handleLike}
                  disabled={hasLiked || !isAuthenticated}
                >
                  <BsHeart className="me-2" />
                  {!isAuthenticated ? 'Giriş Yapın' : hasLiked ? 'Beğenildi' : 'Beğen'} ({story.like_count || 0})
                </Button>
                <Dropdown>
                  <DropdownToggle variant="outline-primary" size="lg" className="d-flex align-items-center">
                    <BsShare className="me-2" />
                    Paylaş
                  </DropdownToggle>
                  <DropdownMenu align="end">
                    <DropdownItem as="button" onSelect={() => {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';
                      if (url) {
                        navigator.clipboard.writeText(url);
                        toast.success('Link kopyalandı');
                      }
                    }}>
                      <BsShare size={16} className="me-2" />
                      Link Kopyala
                    </DropdownItem>
                    <DropdownItem as="button" onSelect={() => {
                      const url = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';
                      if (url) {
                        window.open(`https://wa.me/?text=${encodeURIComponent(`${story.title} - ${url}`)}`, '_blank');
                      }
                    }}>
                      <BsWhatsapp size={16} className="me-2 text-success" />
                      WhatsApp&apos;ta Paylaş
                    </DropdownItem>
                    <DropdownItem as="button" onSelect={handleShareToFeed}>
                      <BsNewspaper size={16} className="me-2 text-primary" />
                      Haber Akışında Paylaş
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Hikaye Bilgileri</h6>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 mb-1 text-primary">{story.view_count || 0}</div>
                    <small className="text-muted">Görüntülenme</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 mb-1 text-danger">{story.like_count || 0}</div>
                    <small className="text-muted">Beğeni</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 mb-1 text-success">{formatDuration(story.duration || 0)}</div>
                    <small className="text-muted">Süre</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 mb-1 text-info">{getLanguageLabel(story.language)}</div>
                    <small className="text-muted">Dil</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Scholar Info Card */}
          {story.scholar && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">Alim Hakkında</h6>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <NewsImage
                    src={story.scholar.photoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${story.scholar.photoUrl}` : '/logo/logo.png'}
                    alt={story.scholar.fullName}
                    width={40}
                    height={40}
                    className="rounded-circle mb-3"
                    style={{
                      objectFit: 'cover',
                      width: '40px',
                      height: '40px'
                    }}
                  />
                  <h6 className="mb-1">{story.scholar.fullName}</h6>
                  <small className="text-muted">{story.scholar.lineage}</small>
                </div>
                {story.scholar.biography && (
                  <p className="small text-muted">
                    {story.scholar.biography.substring(0, 150)}...
                  </p>
                )}
                <Link href={`/profile/scholar/${story.scholar.id}`}>
                  <Button variant="outline-primary" size="sm" className="w-100">
                    Profili Görüntüle
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StoryDetail;
