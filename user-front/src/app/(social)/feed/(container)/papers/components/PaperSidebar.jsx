'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardBody } from 'react-bootstrap';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SOURCE_LOCALE = 'tr';

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

function translatePlain(text, translateFn) {
  if (!text || !text.trim()) return Promise.resolve(text);
  return translateFn(text);
}

export default function PaperSidebar({ otherItems, themeCardStyle }) {
  const { locale, t } = useLanguage();
  const [translatedTitles, setTranslatedTitles] = useState({});

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
      throw new Error(err.message || t('feed.papersTranslationFailed'));
    }
    const json = await res.json();
    return json.translatedText || '';
  }, [t]);

  useEffect(() => {
    if (!otherItems?.length || locale === SOURCE_LOCALE) {
      setTranslatedTitles({});
      return;
    }
    let cancelled = false;
    const api = (text) => translateApi(text, locale);
    (async () => {
      const next = {};
      for (let i = 0; i < otherItems.length; i++) {
        if (cancelled) return;
        const item = otherItems[i];
        const titleRes = await translatePlain(item.title, api);
        next[item.id] = titleRes;
        setTranslatedTitles((prev) => ({ ...prev, ...next }));
        if (i < otherItems.length - 1) await new Promise((r) => setTimeout(r, 150));
      }
    })();
    return () => { cancelled = true; };
  }, [otherItems, locale, translateApi]);

  const getDisplayTitle = (item) => {
    if (locale === SOURCE_LOCALE || !translatedTitles[item.id]) return item.title;
    return translatedTitles[item.id] || item.title;
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-3" style={themeCardStyle}>
        <CardBody>
          <small className="text-muted d-block mb-1">{t('feed.papersPublishInfo')}</small>
          <h6 className="fw-bold mb-1">{t('menu.papers')}</h6>
          <p className="text-muted small mb-0">{t('feed.papersPublishInfoDesc')}</p>
        </CardBody>
      </Card>

      <Card className="border-0 shadow-sm" style={themeCardStyle}>
        <CardBody>
          <h6 className="fw-bold mb-3">{t('feed.papersOtherEditions')}</h6>
          {otherItems.map((item) => (
            <div key={item.id} className="mb-3 pb-3 border-bottom">
              <Link href={`/feed/papers/${item.id}`} className="text-decoration-none">
                <small className="text-muted d-block">{formatDate(item.publishDate || item.publishedAt, locale)}</small>
                <strong className="d-block">{getDisplayTitle(item)}</strong>
              </Link>
            </div>
          ))}
          {otherItems.length === 0 && (
            <p className="text-muted small mb-0">{t('feed.papersNoOtherEditions')}</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}
