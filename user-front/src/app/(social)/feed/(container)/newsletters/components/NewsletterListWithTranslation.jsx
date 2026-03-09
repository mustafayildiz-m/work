'use client';

import { Card, CardBody, Form, Spinner, Pagination } from 'react-bootstrap';
import { BsSearch, BsArrowRight } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

const getLangName = (t, code) => t(`feed.papersLang_${code}`) || code;

export default function NewsletterListWithTranslation({
  items = [],
  search = '',
  loading = false,
  themeCardStyle,
  pagination = { total: 0, totalPages: 0, page: 1, limit: 12 },
  currentPage = 1,
  onPageChange,
  itemsPerPage = 12
}) {
  const { locale, t } = useLanguage();
  const totalPages = pagination.totalPages || 0;
  const total = pagination.total || 0;

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
        <Form className="d-flex flex-column flex-md-row gap-2 mb-4" method="get" action="/feed/newsletters">
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
          <button type="submit" className="btn btn-outline-secondary">
            {t('feed.newslettersFilter')}
          </button>
        </Form>

        {loading ? (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t('feed.newslettersTranslating')}</span>
          </div>
        ) : null}

        <div className="d-grid gap-2">
          {items.map((item) => {
            const sourceLang = item.sourceLanguage || 'tr';
            return (
              <Card key={item.id} className="border-0 border-bottom rounded-0" style={{ ...themeCardStyle, borderColor: 'var(--bs-border-color)' }}>
                <CardBody className="px-0 py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
                    {item.imageUrl && (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="rounded-3 border flex-shrink-0"
                        style={{ width: 88, height: 88, objectFit: 'cover' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <small className="text-muted">{formatDate(item.publishDate || item.publishedAt, locale)}</small>
                        <span className="badge bg-secondary bg-opacity-25 text-body small">
                          {t('feed.newslettersPublishedIn', { language: getLangName(t, sourceLang) })}
                        </span>
                      </div>
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <p className="text-muted mb-2">{item.intro || '-'}</p>
                    </div>
                    <Link
                      href={`/feed/newsletters/${item.id}`}
                      className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 mt-1"
                    >
                      {t('feed.newslettersRead')} <BsArrowRight />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          {items.length === 0 && !loading && (
            <p className="text-muted mb-0">{t('feed.newslettersNoItems')}</p>
          )}
        </div>

        {totalPages > 1 && (
          <>
            <div className="d-flex justify-content-center my-4">
              <Pagination>
                <Pagination.First
                  disabled={currentPage === 1}
                  onClick={() => onPageChange?.(1)}
                />
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => onPageChange?.(currentPage - 1)}
                />
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => onPageChange?.(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  }
                  if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                    return <Pagination.Ellipsis key={pageNumber} disabled />;
                  }
                  return null;
                })}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange?.(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange?.(totalPages)}
                />
              </Pagination>
            </div>
            <div className="text-center text-muted mb-3">
              <small>
                {t('feed.newslettersPaginationShowing', {
                  start: total ? (currentPage - 1) * itemsPerPage + 1 : 0,
                  end: total ? Math.min(currentPage * itemsPerPage, total) : 0,
                  total
                })}
              </small>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
