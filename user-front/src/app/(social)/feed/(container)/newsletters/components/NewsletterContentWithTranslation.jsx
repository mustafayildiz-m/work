'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsArrowLeft, BsShare, BsWhatsapp, BsNewspaper } from 'react-icons/bs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const formatDate = (dateValue, locale = 'tr-TR') => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : (locale === 'en' ? 'en-US' : locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
};

function contentSections(data) {
  const secs = (data?.sections || []).filter((s) => s && typeof s.content === 'string');
  if (secs.length > 0) return secs;
  const raw = data?.content;
  if (raw && typeof raw === 'string') {
    return [{ title: 'Detay', content: raw }];
  }
  return [];
}

const getLangName = (t, code) => t(`feed.papersLang_${code}`) || code;

export default function NewsletterContentWithTranslation({
  data,
  themeCardStyle,
  showOriginal = false,
  onToggleOriginal,
  canShowOriginal = false,
  newsletterId
}) {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const sourceLang = data?.sourceLanguage || 'tr';
  const [imageLoading, setImageLoading] = useState(true);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  const newsletterUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed/newsletters/${newsletterId}` : '';

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
      const formData = new FormData();
      formData.append('user_id', String(userId));
      formData.append('type', 'shared_newsletter');
      formData.append('title', '');
      formData.append('content', `${data?.title || 'Gazete'} gazetesini paylaştı`);
      formData.append('shared_newsletter_id', String(newsletterId));

      const res = await fetch(`${API_BASE_URL}/user-posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showNotification({ title: 'Başarılı', message: 'Gazete haber akışında paylaşıldı', variant: 'success' });
        window.dispatchEvent(new CustomEvent('timelineRefreshRequested'));
        router.push('/feed/home');
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.message || errData?.error || 'Paylaşım başarısız';
        showNotification({ title: 'Hata', message: errMsg, variant: 'danger' });
      }
    } catch (err) {
      console.error('Error sharing newsletter to feed:', err);
      showNotification({ title: 'Hata', message: 'Haber akışında paylaşımda bir hata oluştu', variant: 'danger' });
    }
  };

  useEffect(() => {
    setImageLoading(true);
  }, [data?.imageUrl]);

  const sections = contentSections(data);

  return (
    <Card className="border-0 shadow-sm" style={themeCardStyle}>
      <CardBody className="p-4 p-md-5">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Button
            as={Link}
            href="/feed/newsletters"
            variant="light"
            className="d-inline-flex align-items-center gap-2 border"
            style={{
              backgroundColor: 'var(--bs-tertiary-bg)',
              color: 'var(--bs-body-color)',
              borderColor: 'var(--bs-border-color)'
            }}
          >
            <BsArrowLeft />
            {t('feed.newslettersBackToAll')}
          </Button>
          <span className="badge bg-secondary bg-opacity-25 text-body small">
            {t('feed.newslettersPublishedIn', { language: getLangName(t, sourceLang) })}
          </span>
          <Dropdown show={shareDropdownOpen} onToggle={(open) => setShareDropdownOpen(open)} className="ms-auto">
            <DropdownToggle variant="outline-primary" size="sm" className="d-flex align-items-center dropdown-toggle-no-caret">
              <BsShare className="me-1" />
              {t('post.share') || 'Paylaş'}
            </DropdownToggle>
            <DropdownMenu align="end">
              <DropdownItem as="button" onSelect={() => { if (newsletterUrl) navigator.clipboard.writeText(newsletterUrl); setShareDropdownOpen(false); showNotification({ title: 'Başarılı', message: 'Link kopyalandı', variant: 'success' }); }}>
                <BsShare size={14} className="me-2" />
                {t('post.copyLink') || 'Link Kopyala'}
              </DropdownItem>
              <DropdownItem as="button" onSelect={() => { if (newsletterUrl) window.open(`https://wa.me/?text=${encodeURIComponent(`${data?.title || 'Gazete'} - ${newsletterUrl}`)}`, '_blank'); setShareDropdownOpen(false); }}>
                <BsWhatsapp size={14} className="me-2 text-success" />
                WhatsApp&apos;ta Paylaş
              </DropdownItem>
              <DropdownItem as="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareDropdownOpen(false); handleShareToFeed(); }}>
                <BsNewspaper size={14} className="me-2 text-primary" />
                Haber Akışında Paylaş
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {canShowOriginal && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={onToggleOriginal}
            >
              {showOriginal ? t('feed.newslettersShowTranslation') : t('feed.newslettersShowOriginal')}
            </button>
          )}
        </div>

        <h3 className="fw-bold mb-3">{data?.title}</h3>

        <small className="text-muted d-block mb-3">{formatDate(data?.publishDate || data?.publishedAt, locale)}</small>

        <p className="mb-4">{data?.intro}</p>

        {data?.imageUrl && (
          <figure className="mb-4 position-relative" style={{ minHeight: 200 }}>
            {imageLoading && (
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center rounded-3 border"
                style={{
                  backgroundColor: 'var(--bs-tertiary-bg)',
                  zIndex: 1
                }}
              >
                <div className="spinner-border text-secondary" role="status" />
              </div>
            )}
            <img
              src={resolveImageUrl(data.imageUrl)}
              alt={data.title}
              className="w-100 rounded-3 border"
              style={{
                maxHeight: 380,
                objectFit: 'cover'
              }}
              onLoad={() => setImageLoading(false)}
            />
          </figure>
        )}

        <div className="d-grid gap-4">
          {sections.map((section) => (
            <div key={section.title}>
              <div
                className="mb-0 text-muted newsletter-content"
                dangerouslySetInnerHTML={{ __html: section.content || '' }}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
