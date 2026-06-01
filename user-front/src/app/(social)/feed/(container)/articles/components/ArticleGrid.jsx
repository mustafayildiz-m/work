'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Row, Col, Card, Pagination, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { BsEye, BsCalendar, BsPerson, BsFileText } from 'react-icons/bs';
import { useArticles } from '@/hooks/useArticles';
import { useLanguage } from '@/context/useLanguageContext';

const itemsPerPage = 12;

function ArticleCoverFrame({ src, alt, variant = 'grid', onError }) {
  return (
    <div className={`article-cover-frame article-cover-frame--${variant}`}>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        className="article-cover-bg"
        sizes={variant === 'grid' ? '(max-width: 768px) 33vw, 25vw' : '(max-width: 768px) 25vw, 140px'}
        onError={onError}
      />
      <Image
        src={src}
        alt={alt}
        fill
        className="article-cover-fg"
        sizes={variant === 'grid' ? '(max-width: 768px) 33vw, 25vw' : '(max-width: 768px) 25vw, 140px'}
        onError={onError}
      />
      <div className="article-cover-shine" aria-hidden />
    </div>
  );
}

export default function ArticleGrid({
  selectedLanguageId,
  languageCode,
  languageName,
  searchQuery = '',
  selectedBookIds = [],
  currentPage = 1,
  onPageChange,
  viewMode = 'grid'
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { articles, loading, error, pagination } = useArticles(
    selectedLanguageId,
    selectedBookIds.length > 0 ? selectedBookIds : null,
    searchQuery,
    currentPage,
    itemsPerPage
  );

  // Track failed images to show placeholder
  const [failedImages, setFailedImages] = useState(new Set());

  const getBookTitle = (book) => {
    if (!book) return null;
    if (selectedLanguageId) {
      const langId = parseInt(selectedLanguageId, 10);
      const match = book.translations?.find((t) => t.languageId === langId);
      if (match?.title) return match.title;
    }
    return book.translations?.[0]?.title || book.title || null;
  };

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
    // Reset failed images when changing page
    setFailedImages(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getArticleImage = (article) => {
    // If image failed to load, return placeholder
    if (failedImages.has(article.id)) {
      return '/images/book-placeholder.jpg';
    }

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Makale kendi coverImage'ına sahipse onu kullan
    if (article.coverImage && typeof article.coverImage === 'string' && article.coverImage !== 'null' && article.coverImage !== 'undefined') {
      return article.coverImage.startsWith('http') ? article.coverImage : `${apiBaseUrl}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`;
    }

    // Makale coverImage'ı yoksa, kitabın coverImage veya coverUrl'ini kullan
    if (article.book) {
      if (article.book.coverImage && typeof article.book.coverImage === 'string' && article.book.coverImage !== 'null' && article.book.coverImage !== 'undefined') {
        return article.book.coverImage.startsWith('http') ? article.book.coverImage : `${apiBaseUrl}${article.book.coverImage.startsWith('/') ? '' : '/'}${article.book.coverImage}`;
      }
      if (article.book.coverUrl && typeof article.book.coverUrl === 'string' && article.book.coverUrl !== 'null' && article.book.coverUrl !== 'undefined') {
        return article.book.coverUrl.startsWith('http') ? article.book.coverUrl : `${apiBaseUrl}${article.book.coverUrl.startsWith('/') ? '' : '/'}${article.book.coverUrl}`;
      }
    }

    // Default makale resmi
    return '/images/book-placeholder.jpg';
  };

  const handleImageError = (articleId) => {
    setFailedImages(prev => new Set([...prev, articleId]));
  };

  // Makale detay URL'ini oluştur
  const getArticleDetailUrl = (articleId) => {
    if (selectedLanguageId && languageCode && languageName) {
      const params = new URLSearchParams({
        languageId: selectedLanguageId,
        languageCode,
        languageName
      });
      return `/feed/articles/${articleId}?${params.toString()}`;
    }
    return `/feed/articles/${articleId}`;
  };

  const handleCardClick = (articleId) => {
    router.push(getArticleDetailUrl(articleId));
  };

  const paginationItems = [];
  for (let number = 1; number <= pagination.totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">{t('articles.list.loadingArticles')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>{t('articles.list.error')}</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>{t('articles.list.noArticles')}</Alert.Heading>
        <p>{searchQuery ? `"${searchQuery}" ${t('articles.list.noSearchResults')}` : t('articles.list.noLanguageArticles')}</p>
      </Alert>
    );
  }

  return (
    <div>
      {/* Stats Card */}
      <Card className="mb-3 mb-md-4 border-0 shadow-sm">
        <Card.Body className="p-2 p-md-3">
          <Row className="text-center g-0">
            <Col xs={6} md={3}>
              <div className="p-2 p-md-3">
                <h3 className="mb-0 text-primary h5 h3-md">{pagination.totalItems}</h3>
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('articles.list.totalArticles')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-2 p-md-3">
                <h3 className="mb-0 text-success h5 h3-md">{currentPage}</h3>
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('articles.list.currentPage')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-2 p-md-3">
                <h3 className="mb-0 text-info h5 h3-md">{pagination.totalPages}</h3>
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('articles.list.totalPages')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-2 p-md-3">
                <h3 className="mb-0 text-warning h5 h3-md">{articles.length}</h3>
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{t('articles.list.onThisPage')}</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Row className="g-1 g-sm-2 g-md-4 mb-3 mb-md-4 articles-grid">
          {articles.map((article, idx) => {
            // İlk translation'ı al (seçilen dildeki translation)
            const translation = article.translations?.[0];
            const title = translation?.title || article.title || t('articles.detail.title');
            const summary = translation?.summary;

            return (
              <Col key={article.id || idx} xs={4} sm={4} md={6} lg={4}>
                <Card
                  className="h-100 border-0 article-card"
                  onClick={() => handleCardClick(article.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Link
                    href={getArticleDetailUrl(article.id)}
                    className="d-block position-relative article-image-wrapper text-decoration-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArticleCoverFrame
                      src={getArticleImage(article)}
                      alt={title}
                      variant="grid"
                      onError={() => handleImageError(article.id)}
                    />
                  </Link>
                  <Card.Body className="d-flex flex-column p-2 p-sm-2 p-md-3 article-card-body">
                    <div className="text-decoration-none">
                      <Card.Title className="mb-1 mb-md-2 article-title">
                        {title}
                      </Card.Title>
                    </div>

                    {article.book && getBookTitle(article.book) && (
                      <div className="article-book-chip mb-2 d-none d-sm-inline-block">
                        {getBookTitle(article.book)}
                      </div>
                    )}

                    {summary && (
                      <Card.Text className="text-muted small mb-2 mb-md-3 d-none d-md-block article-summary">
                        {summary}
                      </Card.Text>
                    )}

                    <div className="mt-auto">
                      <div className="article-read-hint">
                        <BsEye className="me-1" />
                        <span>{t('articles.list.viewDetails')}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="mb-3 mb-md-4">
          {articles.map((article, idx) => {
            // İlk translation'ı al (seçilen dildeki translation)
            const translation = article.translations?.[0];
            const title = translation?.title || article.title || t('articles.detail.title');
            const summary = translation?.summary;

            return (
              <Card
                key={article.id || idx}
                className="mb-2 mb-md-3 border-0 article-list-card"
                onClick={() => handleCardClick(article.id)}
              >
                <Row className="g-0 align-items-stretch">
                  <Col xs={4} sm={3} md={3} lg={2} className="article-list-cover-col">
                    <Link
                      href={getArticleDetailUrl(article.id)}
                      className="d-block position-relative article-list-image-link text-decoration-none h-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArticleCoverFrame
                        src={getArticleImage(article)}
                        alt={title}
                        variant="list"
                        onError={() => handleImageError(article.id)}
                      />
                    </Link>
                  </Col>
                  <Col xs={8} sm={9} md={9} lg={10}>
                    <Card.Body className="p-3 p-md-4 d-flex flex-column h-100">
                      <div className="flex-grow-1">
                        {article.book && getBookTitle(article.book) && (
                          <div className="article-book-chip mb-2">
                            <BsFileText className="me-1" size={12} />
                            {getBookTitle(article.book)}
                          </div>
                        )}

                        <Card.Title className="mb-2 article-list-title">
                          {title}
                        </Card.Title>

                        {summary && (
                          <p className="text-muted mb-3 article-summary d-none d-md-block">
                            {summary}
                          </p>
                        )}

                        <div className="d-flex flex-wrap gap-2 gap-md-3 article-meta">
                          {article.author && (
                            <span className="article-meta-item">
                              <BsPerson className="me-1" />
                              {article.author}
                            </span>
                          )}
                          {article.publishDate && (
                            <span className="article-meta-item">
                              <BsCalendar className="me-1" />
                              {new Date(article.publishDate).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 d-flex justify-content-end">
                        <Button variant="primary" size="sm" className="article-detail-btn">
                          <BsEye className="me-1" />
                          {t('articles.list.viewDetails')}
                        </Button>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <>
          <div className="d-flex justify-content-center mb-3 mb-md-4">
            <Pagination size="sm" className="pagination-mobile">
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="d-none d-md-inline-flex"
              />
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />

              {/* Smart pagination - show pages around current page */}
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                } else if (
                  pageNumber === currentPage - 3 ||
                  pageNumber === currentPage + 3
                ) {
                  return <Pagination.Ellipsis key={pageNumber} disabled />;
                }
                return null;
              })}

              <Pagination.Next
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
              <Pagination.Last
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.totalPages)}
                className="d-none d-md-inline-flex"
              />
            </Pagination>
          </div>

          {          /* Pagination Info */}
          <div className="text-center text-muted mb-3 mb-md-4">
            <small>
              {t('books.list.showing')}: {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.totalItems)} / {pagination.totalItems} {t('articles.languageSelector.articleCount')}
            </small>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes articleFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .article-image-wrapper {
          padding-top: 135%;
          overflow: hidden;
          border-radius: 10px 10px 0 0;
        }

        .article-cover-frame {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: linear-gradient(145deg, #165a6e 0%, #2193b0 45%, #4db8d6 100%);
        }

        .article-cover-frame--list {
          position: absolute;
          inset: 0;
          border-radius: 12px 0 0 12px;
        }

        .article-list-image-link {
          position: relative;
          overflow: hidden;
        }

        .article-cover-bg {
          object-fit: cover !important;
          object-position: center !important;
          filter: blur(28px) saturate(1.35) brightness(0.72);
          transform: scale(1.35);
          opacity: 0.95;
        }

        .article-cover-fg {
          object-fit: contain !important;
          object-position: center !important;
          z-index: 1;
          padding: 10px 8px;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.35));
        }

        .article-cover-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 38%,
            rgba(0, 0, 0, 0.08) 100%
          );
        }

        .article-book-chip {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.3;
          color: #1a7a94;
          background: rgba(33, 147, 176, 0.12);
          border: 1px solid rgba(33, 147, 176, 0.18);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .article-list-title {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.35;
          color: #2193b0;
        }

        .article-summary {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.55;
          font-size: 0.9rem;
        }

        .article-meta-item {
          display: inline-flex;
          align-items: center;
          font-size: 0.8rem;
          color: var(--bs-secondary-color);
        }

        .article-read-hint {
          display: inline-flex;
          align-items: center;
          font-size: 0.78rem;
          font-weight: 600;
          color: #2193b0;
        }

        .article-detail-btn {
          border: none !important;
          background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%) !important;
          box-shadow: 0 4px 14px rgba(33, 147, 176, 0.28);
          font-weight: 600;
          padding: 0.45rem 0.9rem !important;
        }

        .article-detail-btn:hover {
          box-shadow: 0 6px 18px rgba(33, 147, 176, 0.38);
          filter: brightness(1.03);
        }

        .article-card {
          transition: all 0.3s ease !important;
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid rgba(33, 147, 176, 0.1) !important;
          animation: articleFadeIn 0.35s ease-out;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(33, 147, 176, 0.08);
        }

        .article-list-card {
          transition: all 0.3s ease !important;
          border-radius: 12px !important;
          overflow: hidden;
          border: 1px solid rgba(33, 147, 176, 0.1) !important;
          animation: articleFadeIn 0.35s ease-out;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(33, 147, 176, 0.08);
        }

        .article-title {
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.3;
          min-height: 2.5em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #2193b0;
        }
        
        @media (min-width: 768px) {
          .article-title {
            font-size: 1.05rem;
            min-height: 2.7em;
          }
          .article-card:hover {
            transform: translateY(-6px) !important;
            box-shadow: 0 14px 32px rgba(33, 147, 176, 0.22) !important;
            border-color: rgba(33, 147, 176, 0.25) !important;
          }
          .article-list-card:hover {
            transform: translateX(4px) !important;
            box-shadow: 0 10px 28px rgba(33, 147, 176, 0.18) !important;
          }
          .article-list-title {
            font-size: 1.15rem;
          }
        }
        
        @media (max-width: 767.98px) {
          .article-image-wrapper {
            padding-top: 128% !important;
            border-radius: 8px 8px 0 0;
          }
          .articles-grid .article-card {
            border-radius: 10px !important;
          }
          .article-card-body {
            padding: 0.55rem 0.6rem !important;
          }
          .article-title {
            font-size: 0.72rem !important;
            min-height: 2.2em !important;
          }
          .article-book-chip {
            font-size: 0.62rem;
            max-width: 100%;
          }
          .article-list-cover-col {
            min-height: 120px;
          }
          .article-list-image-link {
            min-height: 120px !important;
          }
          .article-list-title {
            font-size: 0.88rem;
          }
          .article-list-card .card-body {
            padding: 0.75rem !important;
          }
          .article-detail-btn {
            font-size: 0.78rem;
            padding: 0.35rem 0.7rem !important;
          }
        }

        @media (min-width: 768px) {
          .article-list-cover-col {
            min-height: 168px;
            max-width: 148px;
          }
          .article-list-image-link {
            min-height: 168px !important;
          }
        }

        :global([data-bs-theme='dark']) .article-card,
        :global([data-bs-theme='green']) .article-card,
        :global([data-bs-theme='dark']) .article-list-card,
        :global([data-bs-theme='green']) .article-list-card {
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
        }

        :global([data-bs-theme='dark']) .article-book-chip,
        :global([data-bs-theme='green']) .article-book-chip {
          color: #9fdcf0;
          background: rgba(109, 213, 237, 0.12);
          border-color: rgba(109, 213, 237, 0.22);
        }

        :global([data-bs-theme='dark']) .article-list-title,
        :global([data-bs-theme='green']) .article-list-title,
        :global([data-bs-theme='dark']) .article-title,
        :global([data-bs-theme='green']) .article-title {
          color: #9fdcf0;
        }

        :global([data-bs-theme='dark']) .article-read-hint,
        :global([data-bs-theme='green']) .article-read-hint {
          color: #9fdcf0;
        }

        @media (max-width: 767.98px) {
          .pagination-mobile .page-link {
            padding: 0.35rem 0.65rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
