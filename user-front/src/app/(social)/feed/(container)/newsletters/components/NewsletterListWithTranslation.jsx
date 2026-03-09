'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Card, CardBody, Form, Spinner } from 'react-bootstrap';
import { BsArrowRight, BsSearch } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SOURCE_LOCALE = 'tr'; // Bulten icerigi varsayilan olarak Turkce

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

function translatePlain(text, translateFn) {
  if (!text || !text.trim()) return Promise.resolve(text);
  return translateFn(text);
}

export default function NewsletterListWithTranslation({ items, search, themeCardStyle }) {
  const { locale, t } = useLanguage();
  const [translatedItems, setTranslatedItems] = useState({});
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translateApi = useCallback(async (text, targetCode) => {
    if (!targetCode) return text || '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        text: text || '',
        targetLangCode: targetCode,
        sourceLangCode: undefined
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || t('feed.newslettersTranslationFailed'));
    }
    const json = await res.json();
    return json.translatedText || '';
  }, []);

  useEffect(() => {
    if (!items?.length || locale === SOURCE_LOCALE) {
      setTranslatedItems({});
      setTranslating(false);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    setError(null);
    const api = (text) => translateApi(text, locale);
    (async () => {
      try {
        const next = {};
        for (let i = 0; i < items.length; i++) {
          if (cancelled) return;
          const item = items[i];
          const [titleRes, introRes] = await Promise.all([
            translatePlain(item.title, api),
            translatePlain(item.intro || '', api)
          ]);
          next[item.id] = { title: titleRes, intro: introRes };
          setTranslatedItems((prev) => ({ ...prev, ...next }));
          if (i < items.length - 1) await new Promise((r) => setTimeout(r, 200));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || t('feed.newslettersTranslationError'));
          setTranslatedItems({});
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [items, locale, translateApi]);

  const getDisplayItem = (item) => {
    if (locale === SOURCE_LOCALE || !translatedItems[item.id]) return item;
    const t = translatedItems[item.id];
    return {
      ...item,
      title: t.title || item.title,
      intro: t.intro ?? item.intro
    };
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden" style={themeCardStyle}>
      <div
        className="p-4 p-md-5 border-bottom"
        style={{
          backgroundColor: 'var(--bs-tertiary-bg)',
          borderColor: 'var(--bs-border-color)'
        }}
      >
        <div className="mb-2">
          <h4 className="mb-1 fw-bold">{t('feed.newslettersTitle')}</h4>
          <p className="mb-0 text-muted">{t('feed.newslettersSubtitle')}</p>
        </div>
      </div>

      <CardBody>
        <Form className="d-flex flex-column flex-md-row gap-2 mb-4" method="get">
          <div className="position-relative flex-grow-1">
            <BsSearch
              className="position-absolute text-muted"
              style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <Form.Control
              name="search"
              placeholder={t('feed.newslettersSearchPlaceholder')}
              defaultValue={search}
              style={{
                paddingLeft: 36,
                backgroundColor: 'var(--bs-body-bg)',
                color: 'var(--bs-body-color)',
                borderColor: 'var(--bs-border-color)'
              }}
            />
          </div>
          <Button variant="outline-secondary" type="submit">
            {t('feed.newslettersFilter')}
          </Button>
        </Form>

        {error && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {translating && (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t('feed.newslettersTranslating')}</span>
          </div>
        )}

        <div className="d-grid gap-2">
          {items.map((item) => {
            const display = getDisplayItem(item);
            return (
              <Card key={item.id} className="border-0 border-bottom rounded-0" style={{ ...themeCardStyle, borderColor: 'var(--bs-border-color)' }}>
                <CardBody className="px-0 py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
                    {item.imageUrl && (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={display.title}
                        className="rounded-3 border flex-shrink-0"
                        style={{ width: 88, height: 88, objectFit: 'cover' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">{formatDate(item.publishDate || item.publishedAt, locale)}</small>
                      <h6 className="fw-bold mb-1">{display.title}</h6>
                      <p className="text-muted mb-2">{display.intro || '-'}</p>
                    </div>
                    <Button
                      as={Link}
                      href={`/feed/newsletters/${item.id}`}
                      variant="outline-success"
                      size="sm"
                      className="d-flex align-items-center gap-1 mt-1"
                    >
                      {t('feed.newslettersRead')} <BsArrowRight />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          {items.length === 0 && (
            <p className="text-muted mb-0">{t('feed.newslettersNoItems')}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
