'use client';

import { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { BsSearch, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import '../papers.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
};

const formatDate = (dateValue, locale = 'tr-TR') => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function PapersList({ items = [], search = '', loading = false }) {
  const { t, locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const papers = items?.length ? items : [];
  const current = papers[currentIndex];

  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex, current?.imageUrl]);

  const goPrev = () => setCurrentIndex((i) => (i <= 0 ? papers.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i >= papers.length - 1 ? 0 : i + 1));

  return (
    <div className="papers-page">
      <div className="papers-header">
        <h4>{t('feed.papersTitle')}</h4>
        <p>{t('feed.papersSubtitle')}</p>
      </div>

      <div className="papers-search">
        <Form className="d-flex flex-column flex-md-row gap-2" method="get" action="/feed/papers">
          <div className="position-relative flex-grow-1">
            <BsSearch
              className="position-absolute"
              style={{
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--bs-secondary-color)'
              }}
            />
            <Form.Control
              name="search"
              placeholder={t('feed.papersSearchPlaceholder')}
              defaultValue={search}
              className="papers-search-input"
            />
          </div>
          <button type="submit" className="btn btn-outline-secondary">
            {t('feed.papersFilter')}
          </button>
        </Form>
      </div>

      {loading ? (
        <div className="px-4 pb-2 d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" />
          <span>{t('feed.papersLoading')}</span>
        </div>
      ) : papers.length === 0 ? (
        <div className="papers-empty">{t('feed.papersNoItems')}</div>
      ) : (
        <div className="papers-hero-card">
          <div className="papers-hero-image position-relative">
            {imageLoading && current?.imageUrl && (
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: 'var(--bs-tertiary-bg)',
                  zIndex: 1
                }}
              >
                <Spinner animation="border" variant="secondary" />
              </div>
            )}
            {current?.imageUrl && (
              <img
                src={resolveImageUrl(current.imageUrl)}
                alt={current.title}
                style={{
                  opacity: imageLoading ? 0 : 1,
                  transition: 'opacity 0.2s ease'
                }}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            )}
          </div>
          <div className="papers-hero-content">
            <div>
              {current?.tags?.length > 0 && (
                <div className="papers-tags">
                  {current.tags.map((tag) => (
                    <span key={tag} className="papers-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Link href={`/feed/papers/${current?.id}`} className="text-decoration-none">
                <h3 className="papers-hero-title">{current?.title}</h3>
              </Link>
              {(current?.author || current?.publishDate) && (
                <div className="papers-meta">
                  {current?.author && <span>{current.author}</span>}
                  {current?.author && current?.publishDate && <span className="dot">•</span>}
                  {current?.publishDate && <span>{formatDate(current.publishDate, locale)}</span>}
                </div>
              )}
              <p className="papers-description">{current?.intro}</p>
            </div>
            <div className="d-flex justify-content-end align-items-center">
              <div className="papers-nav-buttons">
                <button
                  type="button"
                  className="papers-nav-btn"
                  onClick={goPrev}
                  disabled={papers.length <= 1}
                  aria-label="Previous"
                >
                  <BsChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="papers-nav-btn"
                  onClick={goNext}
                  disabled={papers.length <= 1}
                  aria-label="Next"
                >
                  <BsChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
