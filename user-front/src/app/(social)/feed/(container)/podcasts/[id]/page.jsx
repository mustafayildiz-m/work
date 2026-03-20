'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Badge, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsMicFill, BsArrowLeft, BsShare, BsWhatsapp, BsNewspaper, BsPlayFill, BsPauseFill, BsClock, BsPerson, BsSkipBackward, BsSkipForward } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import styles from './styles.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAudioUrl = (audioUrl) => {
  if (!audioUrl) return '';
  if (audioUrl.startsWith('http')) return audioUrl;
  return `${API_URL}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
};

const getCoverUrl = (coverImage) => {
  if (!coverImage) return '/images/podcast-placeholder.jpg';
  if (coverImage.startsWith('http')) return coverImage;
  return `${API_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { showNotification } = useNotificationContext();

  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const languageId = searchParams?.get('languageId');
  const languageNameRaw = searchParams?.get('languageName');
  const languageCode = searchParams?.get('languageCode');
  const languageName = languageNameRaw ? decodeURIComponent(languageNameRaw) : null;

  const getBackUrl = () => {
    if (languageId && languageName && languageCode) {
      const p = new URLSearchParams({ languageId, languageName, languageCode });
      return `/feed/podcasts/list?${p.toString()}`;
    }
    return '/feed/podcasts';
  };

  const getPodcastUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/podcasts/${params.id}`);
        if (!res.ok) throw new Error('Podcast bulunamadı');
        const data = await res.json();
        setPodcast(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchPodcast();
  }, [params.id]);

  useEffect(() => {
    if (podcast?.audioUrl && audioRef.current) {
      audioRef.current.src = getAudioUrl(podcast.audioUrl);
    }
  }, [podcast?.audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      fetch(`${API_URL}/podcasts/${params.id}/listen`, { method: 'POST' }).catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const handleSeekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    }
  };

  const handleShareToFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({ title: 'Hata', message: 'Giriş yapmalısınız', variant: 'danger' });
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
        showNotification({ title: 'Hata', message: 'Kullanıcı bilgisi bulunamadı', variant: 'danger' });
        return;
      }
      const title = podcast?.title || 'Podcast';
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('type', 'shared_podcast');
      formData.append('title', '');
      formData.append('content', `${title} podcastini paylaştı`);
      formData.append('shared_podcast_id', params.id);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showNotification({ title: 'Başarılı', message: 'Podcast haber akışında paylaşıldı', variant: 'success' });
      } else {
        throw new Error('Paylaşım başarısız');
      }
    } catch (err) {
      console.error('Error sharing to feed:', err);
      showNotification({ title: 'Hata', message: 'Haber akışında paylaşımda bir hata oluştu', variant: 'danger' });
    }
  };

  if (loading) {
    return (
      <Col lg={9}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('podcasts.list.loadingPodcasts') || 'Podcast yükleniyor...'}</p>
        </div>
      </Col>
    );
  }

  if (error || !podcast) {
    return (
      <Col lg={9}>
        <Alert variant="danger">
          <Alert.Heading>{t('podcasts.list.error') || 'Hata'}</Alert.Heading>
          <p>{error || 'Podcast bulunamadı'}</p>
          <Link href={getBackUrl()}>
            <Button variant="primary">{t('podcasts.list.back') || 'Geri'}</Button>
          </Link>
        </Alert>
      </Col>
    );
  }

  return (
    <Col lg={9}>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => showNotification({ title: 'Hata', message: 'Ses yüklenemedi', variant: 'danger' })}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <Card className={`mb-4 border-0 shadow-sm ${styles.pageHeaderCard}`}>
        <CardHeader className="bg-gradient text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row className="align-items-center g-3">
            <Col xs={12}>
              <div className="d-flex align-items-center">
                <Link href={getBackUrl()}>
                  <Button variant="light" size="sm" className="me-3">
                    <BsArrowLeft className="me-1" />
                    {languageName ? `${t(`books.languages.${languageName}`) || languageName} Podcastlerine Dön` : 'Podcastlere Dön'}
                  </Button>
                </Link>
                <CardTitle className="mb-0 h4">
                  <BsMicFill className="me-2" />
                  {podcast.title}
                </CardTitle>
              </div>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Podcast Detayları */}
      <Card className={`border-0 shadow-sm ${styles.detailCard}`} style={{ position: 'relative' }}>
        <div className={styles.shareButtonWrapper} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 9999, overflow: 'visible' }}>
          <Dropdown className="d-inline-block">
            <DropdownToggle variant="outline-secondary" size="sm" className={`d-flex align-items-center ${styles.shareToggleButton}`}>
              <BsShare className="me-1" />
              {t('podcasts.share') || 'Podcast Paylaş'}
            </DropdownToggle>
            <DropdownMenu align="end">
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const url = getPodcastUrl();
                  if (url) {
                    navigator.clipboard.writeText(url);
                    showNotification({ title: 'Başarılı', message: 'Podcast linki kopyalandı', variant: 'success' });
                  }
                }}
              >
                <BsShare size={16} className="me-2" />
                {t('podcasts.share') || 'Podcast Paylaş'}
              </DropdownItem>
              <DropdownItem
                as="button"
                className="d-flex align-items-center py-2"
                onClick={() => {
                  const url = getPodcastUrl();
                  const msg = `${podcast.title} podcastini dinle: ${url}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              >
                <BsWhatsapp size={16} className="me-2 text-success" />
                {t('podcasts.shareOnWhatsApp') || "WhatsApp'ta Paylaş"}
              </DropdownItem>
              <DropdownItem as="button" className="d-flex align-items-center py-2" onClick={handleShareToFeed}>
                <BsNewspaper size={16} className="me-2 text-primary" />
                {t('podcasts.shareToFeed') || 'Haber Akışında Paylaş'}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <CardBody>
          <div className="text-center mb-4">
            <div className="position-relative d-inline-block" style={{ maxWidth: '220px' }}>
              <Image
                src={getCoverUrl(podcast.coverImage)}
                alt={podcast.title}
                width={220}
                height={220}
                className={`rounded shadow ${styles.coverImage}`}
                style={{ objectFit: 'cover' }}
                onError={(e) => { e.target.src = '/images/podcast-placeholder.jpg'; }}
              />
            </div>
          </div>

          {podcast.author && (
            <div className="d-flex align-items-center mb-3">
              <BsPerson className="me-2 text-primary" />
              <strong>{t('podcasts.list.author') || 'Yazar'}:</strong>
              <span className="ms-2">{podcast.author}</span>
            </div>
          )}

          {podcast.duration && (
            <div className="d-flex align-items-center mb-3">
              <BsClock className="me-2 text-primary" />
              <strong>{t('podcasts.list.duration') || 'Süre'}:</strong>
              <span className="ms-2">{formatDuration(podcast.duration)}</span>
            </div>
          )}

          {podcast.category && (
            <div className="mb-4">
              <Badge bg="primary" className="me-2">
                {podcast.category}
              </Badge>
            </div>
          )}

          {podcast.description && (
            <div className="mb-4">
              <h6>{t('podcasts.list.description') || 'Açıklama'}</h6>
              <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{podcast.description}</p>
            </div>
          )}

          {/* Oynatıcı */}
          <div className="d-flex flex-column align-items-center gap-3 p-4 rounded-3" style={{ background: 'rgba(102, 126, 234, 0.08)' }}>
            <div className="d-flex align-items-center gap-3">
              <Button variant="link" className="p-0" onClick={handleSeekBackward} title="10 saniye geri">
                <BsSkipBackward size={24} />
              </Button>
              <Button
                className="rounded-circle d-flex align-items-center justify-content-center"
                onClick={togglePlay}
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                {isPlaying ? <BsPauseFill size={28} className="text-white" /> : <BsPlayFill size={28} className="text-white" style={{ marginLeft: '4px' }} />}
              </Button>
              <Button variant="link" className="p-0" onClick={handleSeekForward} title="10 saniye ileri">
                <BsSkipForward size={24} />
              </Button>
            </div>
            <div className="text-muted small">
              {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
}
