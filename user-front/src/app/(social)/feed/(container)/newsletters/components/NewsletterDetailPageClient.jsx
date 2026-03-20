'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Col, Row } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import NewsletterContentWithTranslation from './NewsletterContentWithTranslation';
import NewsletterSidebar from './NewsletterSidebar';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  'http://localhost:3000';

const themeCardStyle = {
  backgroundColor: 'var(--bs-body-bg)',
  color: 'var(--bs-body-color)',
  borderColor: 'var(--bs-border-color)'
};

export default function NewsletterDetailPageClient({ id }) {
  const { locale } = useLanguage();
  const [data, setData] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const lang = locale ? locale.toLowerCase().split('-')[0] : 'tr';
  const sourceLang = data?.sourceLanguage || 'tr';
  const effectiveLang = showOriginal && sourceLang !== lang ? sourceLang : lang;

  // Dil değiştiğinde "Orijinali göster" modunu sıfırla - yeni dilde çeviriyi göster
  useEffect(() => {
    setShowOriginal(false);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFoundState(false);

    const newsletterUrl = new URL(`${API_BASE.replace(/\/$/, '')}/newsletters/${id}`);
    const listUrl = new URL(`${API_BASE.replace(/\/$/, '')}/newsletters`);
    listUrl.searchParams.set('limit', '6');
    newsletterUrl.searchParams.set('lang', effectiveLang);
    listUrl.searchParams.set('lang', effectiveLang);

    Promise.all([
      fetch(newsletterUrl.toString(), { cache: 'no-store' }),
      fetch(listUrl.toString(), { cache: 'no-store' })
    ])
      .then(async ([resNewsletter, resList]) => {
        if (cancelled) return;
        if (!resNewsletter.ok) {
          setNotFoundState(true);
          setData(null);
          setOtherItems([]);
          return;
        }
        const newsletterData = await resNewsletter.json();
        const listData = resList.ok ? await resList.json() : { data: [] };
        const items = Array.isArray(listData?.data) ? listData.data : [];
        const others = items.filter((item) => String(item.id) !== String(id));
        setData(newsletterData);
        setOtherItems(others);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFoundState(true);
          setData(null);
          setOtherItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, effectiveLang, locale]);

  if (loading) {
    return (
      <Col lg={9} className="newsletter-detail-page">
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status" />
        </div>
      </Col>
    );
  }

  if (notFoundState || !data) {
    notFound();
  }

  return (
    <Col lg={9} className="newsletter-detail-page">
      <Row className="g-3">
        <Col lg={8}>
          <NewsletterContentWithTranslation
            data={data}
            themeCardStyle={themeCardStyle}
            showOriginal={showOriginal}
            onToggleOriginal={() => setShowOriginal((v) => !v)}
            canShowOriginal={sourceLang !== lang}
            newsletterId={id}
          />
        </Col>
        <Col lg={4}>
          <NewsletterSidebar otherItems={otherItems} themeCardStyle={themeCardStyle} />
        </Col>
      </Row>
    </Col>
  );
}
