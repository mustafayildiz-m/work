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
            const title = translation?.title || article.title || 'Makale';
            const summary = translation?.summary;

            return (
              <Col key={article.id || idx} xs={4} sm={4} md={6} lg={4}>
                <Card
                  className="h-100 border-0 article-card"
                  onClick={() => handleCardClick(article.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Link href={getArticleDetailUrl(article.id)} className="d-block position-relative article-image-wrapper text-decoration-none" style={{ paddingTop: '62%', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                    <Image
                      src={getArticleImage(article)}
                      alt={title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-top"
                      onError={() => handleImageError(article.id)}
                    />
                  </Link>
                  <Card.Body className="d-flex flex-column p-1 p-sm-2 p-md-3 article-card-body">
                    <div className="text-decoration-none">
                      <Card.Title className="mb-1 mb-md-3 article-title" style={{ fontSize: '1.1rem', minHeight: '50px' }}>
                        {title}
                      </Card.Title>
                    </div>

                    {summary && (
                      <Card.Text className="text-muted small mb-1 mb-md-3 d-none d-sm-block" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {summary}
                      </Card.Text>
                    )}

                    <div className="mt-auto">
                      {article.author && (
                        <div className="d-flex align-items-center mb-1 mb-md-2 text-muted small d-none d-md-flex">
                          <BsPerson className="me-1" />
                          <span>{article.author}</span>
                        </div>
                      )}

                      {article.publishDate && (
                        <div className="d-flex align-items-center mb-1 mb-md-2 text-muted small d-none d-md-flex">
                          <BsCalendar className="me-1" />
                          <span>{new Date(article.publishDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}

                      <div className="text-decoration-none">
                        <div className="d-flex align-items-center text-primary small mt-1 mt-md-3">
                          <BsEye className="me-1" />
                          <span>{t('books.detail.readPdf')}</span>
                        </div>
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
            const title = translation?.title || article.title || 'Makale';
            const summary = translation?.summary;

            return (
              <Card
                key={article.id || idx}
                className="mb-2 mb-md-3 border-0 article-list-card"
                onClick={() => handleCardClick(article.id)}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Row className="g-0">
                  <Col xs={3} md={3} lg={2} className="article-list-cover-col">
                    <Link href={getArticleDetailUrl(article.id)} className="d-block position-relative article-list-image-link" style={{ height: '100%' }} onClick={(e) => e.stopPropagation()}>
                      <Image
                        src={getArticleImage(article)}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-start"
                        onError={() => handleImageError(article.id)}
                      />
                    </Link>
                  </Col>
                  <Col xs={9} md={9} lg={10}>
                    <Card.Body className="p-2 p-md-4">
                      <Row>
                        <Col xs={12} lg={8}>
                          <div className="text-decoration-none">
                            <Card.Title className="mb-2 h5" style={{ color: '#2193b0' }}>
                              {title}
                            </Card.Title>
                          </div>

                          {summary && (
                            <p className="text-muted mb-3" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.6'
                            }}>
                              {summary}
                            </p>
                          )}

                          <div className="d-flex flex-wrap gap-3 mb-3">
                            {article.author && (
                              <div className="d-flex align-items-center text-muted small">
                                <BsPerson className="me-1" />
                                <strong>{t('articles.list.author')}:</strong>&nbsp;{article.author}
                              </div>
                            )}

                            {article.publishDate && (
                              <div className="d-flex align-items-center text-muted small">
                                <BsCalendar className="me-1" />
                                <strong>{t('articles.list.publishDate')}:</strong>&nbsp;{new Date(article.publishDate).toLocaleDateString('tr-TR')}
                              </div>
                            )}

                            {article.book && (
                              <div className="d-flex align-items-center text-muted small">
                                <BsFileText className="me-1" />
                                <strong>{t('articles.list.book')}:</strong>&nbsp;{article.book.title || 'N/A'}
                              </div>
                            )}
                          </div>
                        </Col>
                        <Col xs={12} lg={4} className="d-flex flex-column justify-content-between align-items-end">
                          <div className="mb-3">
                            {/* Boş alan veya gelecekte başka bilgiler */}
                          </div>
                          <div>
                            <Button variant="primary" size="sm">
                              <BsEye className="me-1" />
                              {t('articles.list.viewDetails')}
                            </Button>
                          </div>
                        </Col>
                      </Row>
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
        .article-card {
          transition: all 0.3s ease !important;
          border-radius: 10px !important;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        .article-list-card {
          transition: all 0.3s ease !important;
          border-radius: 10px !important;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        
        @media (min-width: 768px) {
          .article-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 30px rgba(33, 147, 176, 0.2) !important;
            border-color: rgba(33, 147, 176, 0.2) !important;
          }
          .article-list-card:hover {
            transform: translateX(5px) !important;
            box-shadow: 0 5px 20px rgba(33, 147, 176, 0.15) !important;
          }
        }
        
        /* Mobile - compact */
        @media (max-width: 767.98px) {
          .articles-grid .article-card {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
            border-radius: 8px !important;
          }
          .article-image-wrapper {
            padding-top: 70% !important;
            border-radius: 8px 8px 0 0;
          }
          .article-card-body {
            padding: 0.4rem 0.5rem !important;
          }
          .article-title {
            font-size: 0.68rem !important;
            font-weight: 600;
            min-height: 2em !important;
            line-height: 1.15 !important;
          }
          .article-list-cover-col {
            min-height: 95px;
          }
          .article-list-image-link {
            min-height: 95px !important;
          }
          .article-list-card .card-body {
            padding: 0.5rem !important;
          }
          .article-list-card .card-title {
            font-size: 0.8rem !important;
            line-height: 1.2;
          }
        }
        @media (min-width: 768px) {
          .article-list-cover-col {
            min-height: 140px;
          }
          .article-list-image-link {
            min-height: 140px !important;
          }
        }
        @media (max-width: 575.98px) {
          .article-title {
            font-size: 0.62rem !important;
          }
        }
        :global([data-bs-theme='dark']) .article-card,
        :global([data-bs-theme='green']) .article-card,
        :global([data-bs-theme='dark']) .article-list-card,
        :global([data-bs-theme='green']) .article-list-card {
          border-color: rgba(255, 255, 255, 0.1) !important;
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
