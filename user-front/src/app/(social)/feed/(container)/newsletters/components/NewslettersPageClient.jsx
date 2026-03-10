'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Col } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import NewsletterListWithTranslation from './NewsletterListWithTranslation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  'http://localhost:3000';

const ITEMS_PER_PAGE = 12;

export default function NewslettersPageClient({ initialSearch = '', initialPage = 1 }) {
  const { locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: ITEMS_PER_PAGE
  });

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const lang = locale ? locale.toLowerCase().split('-')[0] : 'tr';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = new URL(`${API_BASE.replace(/\/$/, '')}/newsletters`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(ITEMS_PER_PAGE));
    if (search) url.searchParams.set('search', search);
    url.searchParams.set('lang', lang);

    fetch(url.toString(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { data: [], total: 0, totalPages: 0 }))
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data?.data) ? data.data : []);
          setPagination({
            total: data?.total ?? 0,
            totalPages: data?.totalPages ?? 0,
            page: data?.page ?? page,
            limit: data?.limit ?? ITEMS_PER_PAGE
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setPagination({ total: 0, totalPages: 0, page: 1, limit: ITEMS_PER_PAGE });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [search, lang, page, locale]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (newPage > 1) params.set('page', String(newPage));
    router.replace(params.toString() ? `${pathname}?${params}` : pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const themeCardStyle = {
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)',
    borderColor: 'var(--bs-border-color)'
  };

  return (
    <Col lg={9}>
      <NewsletterListWithTranslation
        items={items}
        search={search}
        loading={loading}
        themeCardStyle={themeCardStyle}
        pagination={pagination}
        currentPage={page}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </Col>
  );
}
