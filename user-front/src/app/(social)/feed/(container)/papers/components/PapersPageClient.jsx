'use client';

import { useState, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import PapersList from './PapersList';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  'http://localhost:3000';

export default function PapersPageClient({ initialSearch = '' }) {
  const { locale } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = new URL('/papers', API_BASE);
    url.searchParams.set('limit', '100');
    if (search) url.searchParams.set('search', search);
    if (locale && locale !== 'tr') {
      url.searchParams.set('lang', locale);
    }

    fetch(url.toString(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data?.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [search, locale]);

  return (
    <Col lg={9}>
      <PapersList
        items={items}
        search={search}
        loading={loading}
      />
    </Col>
  );
}
