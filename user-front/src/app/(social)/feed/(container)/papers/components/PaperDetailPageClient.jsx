'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Col, Row } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import PaperContent from './PaperContent';
import PaperSidebar from './PaperSidebar';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  'http://localhost:3000';

const themeCardStyle = {
  backgroundColor: 'var(--bs-body-bg)',
  color: 'var(--bs-body-color)',
  borderColor: 'var(--bs-border-color)'
};

export default function PaperDetailPageClient({ id }) {
  const { locale } = useLanguage();
  const [data, setData] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const lang = locale ? locale.toLowerCase().split('-')[0] : 'tr';
  const sourceLang = data?.sourceLanguage || 'tr';
  const effectiveLang = showOriginal && sourceLang !== lang ? sourceLang : lang;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const paperUrl = new URL(`${API_BASE.replace(/\/$/, '')}/papers/${id}`);
    const listUrl = new URL(`${API_BASE.replace(/\/$/, '')}/papers`);
    listUrl.searchParams.set('limit', '6');
    paperUrl.searchParams.set('lang', effectiveLang);
    listUrl.searchParams.set('lang', effectiveLang);

    Promise.all([
      fetch(paperUrl.toString(), { cache: 'no-store' }),
      fetch(listUrl.toString(), { cache: 'no-store' })
    ])
      .then(async ([resPaper, resList]) => {
        if (cancelled) return;
        if (!resPaper.ok) {
          setNotFound(true);
          setData(null);
          setOtherItems([]);
          return;
        }
        const paperData = await resPaper.json();
        const listData = resList.ok ? await resList.json() : { data: [] };
        const items = Array.isArray(listData?.data) ? listData.data : [];
        const others = items.filter((item) => String(item.id) !== String(id));
        setData(paperData);
        setOtherItems(others);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setData(null);
          setOtherItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, effectiveLang]);

  if (loading) {
    return (
      <Col lg={9}>
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status" />
        </div>
      </Col>
    );
  }

  if (notFound || !data) {
    notFound();
  }

  return (
    <Col lg={9}>
      <Row className="g-3">
        <Col lg={8}>
          <PaperContent
            data={data}
            themeCardStyle={themeCardStyle}
            showOriginal={showOriginal}
            onToggleOriginal={() => setShowOriginal((v) => !v)}
            canShowOriginal={sourceLang !== lang}
          />
        </Col>
        <Col lg={4}>
          <PaperSidebar otherItems={otherItems} themeCardStyle={themeCardStyle} />
        </Col>
      </Row>
    </Col>
  );
}
