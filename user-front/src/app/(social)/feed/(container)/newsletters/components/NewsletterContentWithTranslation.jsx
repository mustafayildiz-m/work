'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody } from 'react-bootstrap';
import { BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

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
  if (!imageUrl) return '';
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
  canShowOriginal = false
}) {
  const { locale, t } = useLanguage();
  const sourceLang = data?.sourceLanguage || 'tr';
  const [imageLoading, setImageLoading] = useState(true);

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
