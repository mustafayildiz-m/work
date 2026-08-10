'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Spinner,
  Pagination,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { BsSearch, BsArrowLeft, BsArrowRight, BsQuestionCircle } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { getQaLanguageLabels } from '@/utils/uiLanguageDisplay';
import QuestionItem from './QuestionItem';
import '../../../qa/qa-page.css';
import '../../questions.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function QuestionsListClient({ langCode }) {
  const { t } = useLanguage();
  const [language, setLanguage] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

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
          limit: String(limit),
        });
        if (q) params.set('q', q);

        const res = await fetch(`${API_URL}/qa/items/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || data);
          setTotal(data.total || (data.items || data).length);
        }
      } catch {
        setError(t('qa.errorLoading') || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    },
    [limit, t],
  );

  useEffect(() => {
    fetchLanguage();
  }, [fetchLanguage]);

  useEffect(() => {
    if (language) {
      fetchQuestions(language, page, searchQuery);
    }
  }, [page, searchQuery, language, fetchQuestions]);

  const totalPages = Math.ceil(total / limit);

  const languageLabels = language ? getQaLanguageLabels(language, t) : null;

  if (langLoading) {
    return (
      <Col lg={9} className="feed-main-col qa-page-col">
        <div className="d-flex justify-content-center py-5" data-testid="loading">
          <Spinner animation="border" variant="success" />
        </div>
      </Col>
    );
  }

  if (error && !language) {
    return (
      <Col lg={9} className="feed-main-col qa-page-col">
        <div className="text-center py-5" data-testid="error-state">
          <h3>{error}</h3>
          <Link href="/feed/questions" className="btn qa-load-more-btn mt-3">
            {t('qa.backToLanguages')}
          </Link>
        </div>
      </Col>
    );
  }

  return (
    <Col
      lg={9}
      className="feed-main-col qa-page-col questions-list-page"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={langCode}
      data-testid="questions-list-page"
    >
      <Card className="qa-page-card">
        <CardHeader className="qa-page-card__header border-0">
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/feed/questions"
              className="btn btn-sm qa-load-more-btn"
              data-testid="back-btn"
            >
              {isRTL ? <BsArrowRight /> : <BsArrowLeft />}
            </Link>
            <span className="qa-page-card__icon">
              <BsQuestionCircle size={20} />
            </span>
            <div className="flex-grow-1 min-w-0">
              <h1 className="qa-page-card__title mb-0 text-truncate" data-testid="page-title">
                {languageLabels?.primary || langCode}
              </h1>
              {languageLabels?.showSecondary && (
                <p className="qa-page-card__subtitle mb-0" data-testid="english-name">
                  {languageLabels.secondary}
                </p>
              )}
            </div>
            <span className="badge questions-lang-badge" data-testid="question-count">
              {t('qa.qaCount', { count: total })}
            </span>
          </div>
        </CardHeader>

        <CardBody className="qa-page-card__body">
          <InputGroup className="mb-3 qa-search-group">
            <InputGroup.Text className="qa-search-icon">
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('qa.searchPlaceholder') || 'Search questions...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="qa-search-input"
              data-testid="question-search-input"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </InputGroup>

          {loading && (
            <div className="text-center py-4" data-testid="loading">
              <Spinner animation="border" variant="success" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-4" data-testid="empty-state">
              <p className="text-muted mb-0">{t('qa.noResults') || 'No questions found'}</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="qa-accordion-list" data-testid="questions-list">
              {items.map((item, index) => (
                <QuestionItem
                  key={item.id}
                  item={item}
                  index={index}
                  isRTL={isRTL}
                  languageId={language?.id}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4" data-testid="pagination">
              <Pagination>
                <Pagination.Prev
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>
    </Col>
  );
}
