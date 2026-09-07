'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Col, Form } from 'react-bootstrap';
import {
  BsSearch,
  BsArrowLeft,
  BsArrowRight,
  BsQuestionCircle,
  BsChevronLeft,
  BsChevronRight,
  BsXLg,
  BsInboxes,
} from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { getQaLanguageLabels } from '@/utils/uiLanguageDisplay';
import QuestionItem from './QuestionItem';
import '../../../qa/qa-page.css';
import '../../questions.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Page numbers to render, always the same width: first, last, a window around
 * the current page, and '…' where numbers were skipped.
 */
function buildPageWindow(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current]);
  for (let offset = 1; offset <= 1; offset += 1) {
    if (current - offset > 1) pages.add(current - offset);
    if (current + offset < totalPages) pages.add(current + offset);
  }
  // Keep the row a stable width when the current page sits near either end.
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= totalPages - 2)
    [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push('gap');
    withGaps.push(p);
  });
  return withGaps;
}

export default function QuestionsListClient({ langCode }) {
  const { t } = useLanguage();
  const [language, setLanguage] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef(null);
  const listTopRef = useRef(null);

  const isRTL = language?.direction === 'rtl';

  const fetchLanguage = useCallback(async () => {
    setLangLoading(true);
    try {
      const res = await fetch(`${API_URL}/languages/qa/search?q=${langCode}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setLanguage(data[0]);
          return data[0];
        }
      }
      setError(t('qa.languageNotFound'));
    } catch {
      setError(t('qa.failedToLoadLanguage'));
    } finally {
      setLangLoading(false);
    }
    return null;
  }, [langCode, t]);

  const fetchQuestions = useCallback(
    async (lang, pageNum = 1, q = '') => {
      if (!lang) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          languageId: String(lang.id),
          page: String(pageNum),
          limit: String(LIMIT),
        });
        if (q) params.set('q', q);

        const res = await fetch(`${API_URL}/qa/items/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || data);
          setTotal(data.total ?? (data.items || data).length);
        }
      } catch {
        setError(t('qa.errorLoading') || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchLanguage();
  }, [fetchLanguage]);

  useEffect(() => {
    if (language) {
      fetchQuestions(language, page, searchQuery);
    }
  }, [page, searchQuery, language, fetchQuestions]);

  // Debounce the typed query so a fetch fires per pause, not per keystroke.
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearchQuery(val);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const handleClearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  }, []);

  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  const goToPage = useCallback((next) => {
    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const pageWindow = useMemo(() => buildPageWindow(page, totalPages), [page, totalPages]);
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  const languageLabels = language ? getQaLanguageLabels(language, t) : null;

  if (langLoading) {
    return (
      <Col lg={9} className="feed-main-col questions-page">
        <div className="questions-shell">
          <div className="questions-hero">
            <div className="d-flex align-items-center gap-3">
              <span className="questions-hero__icon">
                <BsQuestionCircle size={22} />
              </span>
              <div className="questions-skeleton" style={{ width: '11rem', height: '1.9rem' }} />
            </div>
          </div>
          <div className="questions-body" data-testid="loading">
            <div className="questions-skeleton" style={{ height: '3.25rem', marginBottom: '1.25rem' }} />
            <div className="questions-list">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="questions-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </Col>
    );
  }

  if (error && !language) {
    return (
      <Col lg={9} className="feed-main-col questions-page">
        <div className="questions-shell">
          <div className="questions-body">
            <div className="questions-empty" data-testid="error-state">
              <span className="questions-empty__icon">
                <BsInboxes size={24} />
              </span>
              <h3 className="questions-empty__title">{error}</h3>
              <Link href="/feed/questions" className="questions-btn mt-3">
                {t('qa.backToLanguages')}
              </Link>
            </div>
          </div>
        </div>
      </Col>
    );
  }

  return (
    <Col
      lg={9}
      className="feed-main-col questions-page questions-list-page"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={langCode}
      data-testid="questions-list-page"
    >
      <div className="questions-shell">
        <header className="questions-hero">
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/feed/questions"
              className="questions-hero__back"
              aria-label={t('qa.backToLanguages')}
              data-testid="back-btn"
            >
              {isRTL ? <BsArrowRight size={16} /> : <BsArrowLeft size={16} />}
            </Link>

            {language?.flagUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={language.flagUrl}
                alt=""
                aria-hidden="true"
                className="questions-hero__flag"
              />
            ) : (
              <span className="questions-hero__icon">
                <BsQuestionCircle size={22} />
              </span>
            )}

            <div className="flex-grow-1 min-w-0">
              <span className="questions-hero__eyebrow">
                {t('qa.title') || 'Questions & Answers'}
              </span>
              <h1 className="questions-hero__title text-truncate" data-testid="page-title">
                {languageLabels?.primary || langCode}
              </h1>
              {languageLabels?.showSecondary && (
                <p className="questions-hero__subtitle mb-0" data-testid="english-name">
                  {languageLabels.secondary}
                </p>
              )}
            </div>

            <span className="questions-hero__count" data-testid="question-count">
              {t('qa.qaCount', { count: total })}
            </span>
          </div>
        </header>

        <div className="questions-body">
          <div className="questions-search" ref={listTopRef}>
            <BsSearch size={16} className="questions-search__icon" aria-hidden="true" />
            <Form.Control
              type="text"
              placeholder={t('qa.searchPlaceholder') || 'Search questions...'}
              value={searchInput}
              onChange={handleSearchChange}
              className="questions-search__input"
              data-testid="question-search-input"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {searchInput && (
              <button
                type="button"
                className="questions-search__clear"
                onClick={handleClearSearch}
                aria-label={t('qa.clear') || 'Clear'}
              >
                <BsXLg size={11} />
              </button>
            )}
          </div>

          {loading && (
            <div className="questions-list" data-testid="loading">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="questions-skeleton" />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="questions-empty" data-testid="empty-state">
              <span className="questions-empty__icon">
                <BsInboxes size={24} />
              </span>
              <p className="questions-empty__title">
                {t('qa.noResults') || 'No questions found'}
              </p>
              {searchQuery && (
                <button type="button" className="questions-btn mt-3" onClick={handleClearSearch}>
                  {t('qa.clear') || 'Clear'}
                </button>
              )}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="questions-list qa-accordion-list" data-testid="questions-list">
              {items.map((item, index) => (
                <QuestionItem
                  key={item.id}
                  item={item}
                  index={(page - 1) * LIMIT + index}
                  isRTL={isRTL}
                  languageId={language?.id}
                />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <nav
              className="questions-pager"
              aria-label={t('qa.title') || 'Pagination'}
              data-testid="pagination"
            >
              <span className="questions-pager__info">
                {rangeStart}–{rangeEnd} / {total.toLocaleString()}
              </span>

              <div className="questions-pager__controls">
                <button
                  type="button"
                  className="questions-pager__btn"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Previous page"
                >
                  <BsChevronLeft size={13} />
                </button>

                {pageWindow.map((entry, i) =>
                  entry === 'gap' ? (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={`gap-${i}`} className="questions-pager__gap" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <button
                      key={entry}
                      type="button"
                      className={`questions-pager__btn${page === entry ? ' questions-pager__btn--active' : ''}`}
                      onClick={() => goToPage(entry)}
                      aria-current={page === entry ? 'page' : undefined}
                    >
                      {entry}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="questions-pager__btn"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Next page"
                >
                  <BsChevronRight size={13} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </Col>
  );
}
