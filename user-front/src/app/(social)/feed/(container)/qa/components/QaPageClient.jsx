'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap';
import { BsQuestionCircle } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import QaSearchBar from './QaSearchBar';
import QaCategoryFilter from './QaCategoryFilter';
import QaAccordionList from './QaAccordionList';
import { resolveLanguageId } from '../qa-utils';
import '../qa-page.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function flattenCategoryTree(categories) {
  const result = [];
  const walk = (items, depth = 0) => {
    for (const item of items || []) {
      result.push({ ...item, depth });
      if (item.children?.length) walk(item.children, depth + 1);
    }
  };
  walk(categories);
  return result;
}

export default function QaPageClient() {
  const { locale, t, isRTL } = useLanguage();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [languageId, setLanguageId] = useState(null);
  const [fallbackLanguageId, setFallbackLanguageId] = useState(null);
  const [filters, setFilters] = useState({
    q: '',
    categoryId: '',
    page: 1,
    limit: 20,
  });

  const flatCategories = useMemo(() => flattenCategoryTree(categories), [categories]);

  useEffect(() => {
    let cancelled = false;

    const resolveLanguages = async () => {
      const langRes = await fetch(`${API_URL}/languages`);
      if (!langRes.ok) throw new Error('languages_fetch_failed');
      const langs = await langRes.json();
      const activeLangs = langs.filter((l) => l.isActive);
      const resolvedLanguageId = resolveLanguageId(activeLangs, locale);
      const enId = resolveLanguageId(activeLangs, 'en');
      return { resolvedLanguageId, enId };
    };

    const loadCategories = async (resolvedLanguageId) => {
      const catParams = resolvedLanguageId ? `?languageId=${resolvedLanguageId}` : '';
      const catRes = await fetch(`${API_URL}/qa/categories${catParams}`);
      if (catRes.ok) {
        const data = await catRes.json();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } else if (!cancelled) {
        setCategories([]);
      }
    };

    const loadItems = async (resolvedLanguageId, page, append) => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (resolvedLanguageId) params.set('languageId', resolvedLanguageId);
      params.set('page', String(page));
      params.set('limit', String(filters.limit));

      const itemsRes = await fetch(`${API_URL}/qa/items/search?${params}`);
      if (!itemsRes.ok) throw new Error('items_fetch_failed');
      const data = await itemsRes.json();
      if (cancelled) return;

      const newItems = Array.isArray(data.items) ? data.items : [];
      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
      setTotal(data.total || 0);
    };

    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const { resolvedLanguageId, enId } = await resolveLanguages();
        if (cancelled) return;
        setLanguageId(resolvedLanguageId);
        setFallbackLanguageId(enId);

        await loadCategories(resolvedLanguageId);
        await loadItems(resolvedLanguageId, filters.page, filters.page > 1);
      } catch {
        if (!cancelled) {
          if (filters.page === 1) {
            setItems([]);
            setTotal(0);
          }
          setError(t('qa.errorLoading'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [locale, filters.q, filters.categoryId, filters.page, filters.limit]);

  const handleSearch = useCallback((q) => {
    setFilters((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 1 }));
  }, []);

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <Col lg={9} className="feed-main-col qa-page-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="qa-page-card">
        <CardHeader className="qa-page-card__header border-0">
          <div className="d-flex align-items-center gap-2">
            <span className="qa-page-card__icon">
              <BsQuestionCircle size={20} />
            </span>
            <div>
              <h1 className="qa-page-card__title">{t('qa.title')}</h1>
              <p className="qa-page-card__subtitle">{t('qa.subtitle')}</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="qa-page-card__body">
          <QaSearchBar onSearch={handleSearch} isRTL={isRTL} t={t} />

          <QaCategoryFilter
            categories={flatCategories}
            activeCategory={filters.categoryId}
            onChange={handleCategoryChange}
            languageId={languageId}
            fallbackLanguageId={fallbackLanguageId}
            isRTL={isRTL}
            t={t}
          />

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          <QaAccordionList
            items={items}
            loading={loading}
            total={total}
            page={filters.page}
            limit={filters.limit}
            onLoadMore={handleLoadMore}
            languageId={languageId}
            fallbackLanguageId={fallbackLanguageId}
            isRTL={isRTL}
            t={t}
          />
        </CardBody>
      </Card>
    </Col>
  );
}
