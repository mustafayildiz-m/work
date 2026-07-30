'use client';

import { useState, useEffect } from 'react';
import { Spinner, Alert, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsCalendarDate, BsPlayCircle, BsPlayFill, BsEye, BsHeart, BsHeartFill, BsArrowLeft, BsShare, BsNewspaper, BsWhatsapp, BsClock, BsGlobe, BsLink45Deg, BsPersonCircle, BsInstagram } from 'react-icons/bs';
import NewsImage from '../../components/NewsImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { extractYouTubeId, extractInstagramCode, isInstagramUrl, getDirectThumbnail, resolveStoryThumbnail, getThumbnailImageUrl } from '@/utils/videoThumbnail';
import '../StoryDetail.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getEmbedUrl(videoUrl) {
  if (!videoUrl) return '';
  const ytId = extractYouTubeId(videoUrl);
  if (ytId) return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
  const igCode = extractInstagramCode(videoUrl);
  if (igCode) return `https://www.instagram.com/reel/${igCode}/embed/`;
  return videoUrl;
}

const StoryDetail = ({ params }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [previewThumb, setPreviewThumb] = useState(null);
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated, userInfo } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const h = { 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/languages`, { headers: h });
        if (res.ok) setLanguages(await res.json() || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const userId = userInfo?.id;
    const likedKey = userId ? `likedStories_${userId}` : 'likedStories';
    const viewedKey = userId ? `viewedStories_${userId}` : 'viewedStories';
    const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
    const viewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
    setHasLiked(liked.includes(parseInt(id)));
    setHasViewed(viewed.includes(parseInt(id)));

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/scholar-stories/${id}`, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStory(data);
        setPreviewThumb(getDirectThumbnail(data));

        if (!getDirectThumbnail(data) && data?.video_url) {
          resolveStoryThumbnail(data).then((thumb) => {
            if (thumb) setPreviewThumb(thumb);
          });
        }

        if (isAuthenticated && !viewed.includes(parseInt(id))) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const vr = await fetch(`${API_BASE}/scholar-stories/${id}/view`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
              if (vr.ok) {
                localStorage.setItem(viewedKey, JSON.stringify([...viewed, parseInt(id)]));
                setHasViewed(true);
              }
            }
          } catch {}
        }
      } catch (err) {
        setError(err.message.includes('fetch') ? 'API bağlantısı kurulamadı.' : err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatDuration = (s) => { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, '0')}`; };
  const getLangLabel = (c) => { const l = languages.find((x) => x.code === c); return l ? l.name : c; };

  const handleLike = async () => {
    if (hasLiked || !isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/scholar-stories/${id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setStory((p) => ({ ...p, like_count: (p.like_count || 0) + 1 }));
        const userId = userInfo?.id;
        const key = userId ? `likedStories_${userId}` : 'likedStories';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([...arr, parseInt(id)]));
        setHasLiked(true);
      }
    } catch {}
  };

  const handleShareToFeed = async () => {
    if (!story) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Giriş yapmalısınız'); return; }
      let userId;
      try { const p = JSON.parse(atob(token.split('.')[1])); userId = p.id || p.userId || p.sub; }
      catch { const u = localStorage.getItem('user'); if (u) try { userId = JSON.parse(u).id; } catch {} }
      if (!userId) { toast.error('Kullanıcı bilgisi bulunamadı'); return; }
      const fd = new FormData();
      fd.append('user_id', String(userId));
      fd.append('type', 'shared_story');
      fd.append('title', '');
      fd.append('content', `${story.title} hikayesini paylaştı`);
      fd.append('shared_story_id', String(story.id));
      const res = await fetch(`${API_BASE}/user-posts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { toast.success('Paylaşıldı'); window.dispatchEvent(new CustomEvent('timelineRefreshRequested')); router.push('/feed/home'); }
      else { const e = await res.json().catch(() => ({})); toast.error(e?.message || 'Paylaşım başarısız'); }
    } catch (e) { toast.error(e?.message || 'Bir hata oluştu'); }
  };

  if (loading) return (
    <div className="story-detail-page story-detail-page--loading">
      <Spinner animation="border" style={{ color: 'var(--bs-primary)', width: '3rem', height: '3rem' }} />
      <p style={{ marginTop: 16, opacity: 0.7 }}>Hikaye yükleniyor...</p>
    </div>
  );

  if (error || !story) return (
    <div className="story-detail-page story-detail-page--error">
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Alert variant={error ? 'danger' : 'warning'}>
          <Alert.Heading>{error ? 'Hata!' : 'Bulunamadı'}</Alert.Heading>
          <p>{error || 'Hikaye bulunamadı veya silinmiş olabilir.'}</p>
          {error ? <Button variant="outline-danger" onClick={() => window.location.reload()}>Tekrar Dene</Button> : <Link href="/blogs"><Button variant="outline-primary"><BsArrowLeft className="me-2" />Geri Dön</Button></Link>}
        </Alert>
      </div>
    </div>
  );

  const thumbUrl = previewThumb || getDirectThumbnail(story);
  const ytId = extractYouTubeId(story.video_url);
  const igCode = extractInstagramCode(story.video_url);
  const isIg = isInstagramUrl(story.video_url);
  const embedUrl = getEmbedUrl(story.video_url);
  const fallbackThumb = thumbError && ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : (thumbUrl || (isIg && story.video_url ? getThumbnailImageUrl(story.video_url) : null));
  const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';

  return (
    <div className="story-detail-page">
      <div className="story-detail-layout">
        {/* LEFT: Vertical Video */}
        <div className="story-detail-video-col">
          <div className="story-detail-video-wrapper">
            {story.video_url ? (
              <>
                {videoPlaying || isIg ? (
                  <iframe
                    src={isIg && !videoPlaying ? embedUrl : (videoPlaying ? embedUrl : '')}
                    title={story.title}
                    className="story-detail-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div onClick={() => setVideoPlaying(true)} style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}>
                    {fallbackThumb ? (
                      <img src={fallbackThumb} alt={story.title} referrerPolicy="no-referrer" onError={() => setThumbError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BsPlayCircle size={60} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle,rgba(0,0,0,0.15),rgba(0,0,0,0.45))', pointerEvents: 'none' }} />
                    <div className="story-detail-play-btn">
                      <BsPlayFill size={40} style={{ color: '#fff', marginLeft: 4, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                    </div>
                    <div className="story-detail-play-hint">Oynatmak için tıklayın</div>
                  </div>
                )}

                {!videoPlaying && !isIg && story.duration && (
                  <div className="story-detail-duration-badge">
                    <BsClock style={{ marginRight: 4 }} /> {formatDuration(story.duration)}
                  </div>
                )}
              </>
            ) : thumbUrl ? (
              <img src={thumbUrl} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BsPlayCircle size={60} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </div>
            )}
          </div>

          {isIg && (
            <a href={story.video_url} target="_blank" rel="noopener noreferrer" className="story-detail-ig-link">
              <BsInstagram size={16} /> Instagram&apos;da Aç
            </a>
          )}
        </div>

        {/* RIGHT: Info Panel */}
        <div className="story-detail-info-col">
          <Link href="/blogs" className="story-detail-back-btn">
            <BsArrowLeft /> Geri Dön
          </Link>

          {/* Title & Meta */}
          <div className="story-detail-glass-card story-detail-glass-card--actions">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <span className="story-detail-date"><BsCalendarDate /> {formatDate(story.created_at)}</span>
              <span className="story-detail-lang-badge"><BsGlobe size={11} /> {getLangLabel(story.language)}</span>
            </div>

            <h1 className="story-detail-title">{story.title}</h1>

            {/* Scholar */}
            {story.scholar && (
              <div className="story-detail-scholar">
                <NewsImage
                  src={story.scholar.photoUrl ? `${API_BASE}${story.scholar.photoUrl}` : '/logo/logo.png'}
                  alt={story.scholar.fullName}
                  width={44}
                  height={44}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(102,126,234,0.4)', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="story-detail-scholar-name">{story.scholar.fullName}</p>
                  <p className="story-detail-scholar-sub">{story.scholar.lineage || 'İslam Alimi'}</p>
                </div>
                <Link href={`/profile/scholar/${story.scholar.id}`} className="story-detail-profile-btn">Profil</Link>
              </div>
            )}

            {/* Stats */}
            <div className="story-detail-stats">
              <div className="story-detail-stat">
                <BsEye style={{ color: '#667eea' }} />
                <span className="story-detail-stat-val">{story.view_count || 0}</span>
                <span className="story-detail-stat-lbl">Görüntülenme</span>
              </div>
              <div className="story-detail-stat">
                <BsHeart style={{ color: '#e91e63' }} />
                <span className="story-detail-stat-val">{story.like_count || 0}</span>
                <span className="story-detail-stat-lbl">Beğeni</span>
              </div>
              {story.duration > 0 && (
                <div className="story-detail-stat">
                  <BsClock style={{ color: '#4caf50' }} />
                  <span className="story-detail-stat-val">{formatDuration(story.duration)}</span>
                  <span className="story-detail-stat-lbl">Süre</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="story-detail-actions">
              <button
                className={`story-detail-action-btn ${hasLiked ? 'liked' : ''} ${!isAuthenticated ? 'login' : ''}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/auth-advance/sign-in');
                    return;
                  }
                  handleLike();
                }}
                disabled={isAuthenticated && hasLiked}
              >
                {hasLiked ? <BsHeartFill size={16} /> : <BsHeart size={16} />}
                {!isAuthenticated ? 'Giriş Yapın' : hasLiked ? 'Beğenildi' : 'Beğen'}
              </button>

              {story.video_url && !isIg && (
                <button className="story-detail-action-btn primary" onClick={() => window.open(story.video_url, '_blank')}>
                  <BsPlayCircle size={16} /> Orijinal Video
                </button>
              )}

              <Dropdown popperConfig={{ strategy: 'fixed', modifiers: [{ name: 'preventOverflow', options: { boundary: 'viewport' } }] }}>
                <DropdownToggle as="button" className="story-detail-action-btn" id="share-dd">
                  <BsShare size={14} /> Paylaş
                </DropdownToggle>
                <DropdownMenu align="end" className="story-detail-share-menu">
                  <DropdownItem as="button" onClick={() => { navigator.clipboard.writeText(storyUrl); toast.success('Link kopyalandı'); }}>
                    <BsLink45Deg size={16} className="me-2" style={{ color: '#667eea' }} /> Link Kopyala
                  </DropdownItem>
                  <DropdownItem as="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${story.title} - ${storyUrl}`)}`, '_blank')}>
                    <BsWhatsapp size={16} className="me-2" style={{ color: '#25d366' }} /> WhatsApp
                  </DropdownItem>
                  <DropdownItem as="button" onClick={handleShareToFeed}>
                    <BsNewspaper size={16} className="me-2" style={{ color: '#667eea' }} /> Akışta Paylaş
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Description */}
          {story.description && (
            <div className="story-detail-glass-card">
              <h5 className="story-detail-section-title">Hikaye Hakkında</h5>
              <p className="story-detail-desc">{story.description}</p>
            </div>
          )}

          {/* Scholar Bio */}
          {story.scholar?.biography && (
            <div className="story-detail-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BsPersonCircle style={{ color: '#667eea', fontSize: '1.1rem' }} />
                <h5 className="story-detail-section-title" style={{ marginBottom: 0 }}>Alim Hakkında</h5>
              </div>
              <p className="story-detail-desc" style={{ fontSize: '0.85rem' }}>{story.scholar.biography}</p>
              <Link href={`/profile/scholar/${story.scholar.id}`} className="story-detail-profile-btn" style={{ display: 'inline-flex', marginTop: 10 }}>
                Profili Görüntüle
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StoryDetail;
