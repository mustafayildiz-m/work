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
    if (article.coverImage && article.coverImage !== 'null' && article.coverImage !== 'undefined') {
      return article.coverImage.startsWith('http') ? article.coverImage : `${apiBaseUrl}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`;
    }

    // Makale coverImage'ı yoksa, kitabın coverImage veya coverUrl'ini kullan
    if (article.book) {
      if (article.book.coverImage && article.book.coverImage !== 'null' && article.book.coverImage !== 'undefined') {
        return article.book.coverImage.startsWith('http') ? article.book.coverImage : `${apiBaseUrl}${article.book.coverImage.startsWith('/') ? '' : '/'}${article.book.coverImage}`;
      }
      if (article.book.coverUrl && article.book.coverUrl !== 'null' && article.book.coverUrl !== 'undefined') {
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
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="text-center">
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-primary">{pagination.totalItems}</h3>
                <small className="text-muted">{t('articles.list.totalArticles')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-success">{currentPage}</h3>
                <small className="text-muted">{t('articles.list.currentPage')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-info">{pagination.totalPages}</h3>
                <small className="text-muted">{t('articles.list.totalPages')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-warning">{articles.length}</h3>
                <small className="text-muted">{t('articles.list.onThisPage')}</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Row>
          {articles.map((article, idx) => {
            // İlk translation'ı al (seçilen dildeki translation)
            const translation = article.translations?.[0];
            const title = translation?.title || article.title || 'Makale';
            const summary = translation?.summary;

            return (
              <Col key={article.id || idx} xs={12} md={6} lg={4} className="mb-4">
                <Card
                  className="h-100 shadow-sm border-0 article-card"
                  onClick={() => handleCardClick(article.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="img-container position-relative">
                    <Image
                      src={getArticleImage(article)}
                      alt={title}
                      width={400}
                      height={250}
                      style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                      className="card-img-top"
                      onError={() => handleImageError(article.id)}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="text-decoration-none">
                      <Card.Title className="mb-3" style={{ fontSize: '1.1rem', minHeight: '50px' }}>
                        {title}
                      </Card.Title>
                    </div>

                    {summary && (
                      <Card.Text className="text-muted small mb-3" style={{
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
                        <div className="d-flex align-items-center mb-2 text-muted small">
                          <BsPerson className="me-1" />
                          <span>{article.author}</span>
                        </div>
                      )}

                      {article.publishDate && (
                        <div className="d-flex align-items-center mb-2 text-muted small">
                          <BsCalendar className="me-1" />
                          <span>{new Date(article.publishDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}

                      <div className="text-decoration-none">
                        <div className="d-flex align-items-center text-primary small mt-3">
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
        <div className="mb-4">
          {articles.map((article, idx) => {
            // İlk translation'ı al (seçilen dildeki translation)
            const translation = article.translations?.[0];
            const title = translation?.title || article.title || 'Makale';
            const summary = translation?.summary;

            return (
              <Card
                key={article.id || idx}
                className="mb-3 shadow-sm border-0 article-list-card"
                onClick={() => handleCardClick(article.id)}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Row className="g-0">
                  <Col xs={12} md={3} lg={2}>
                    <div className="position-relative" style={{ height: '100%', minHeight: '200px' }}>
                      <Image
                        src={getArticleImage(article)}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-start"
                        onError={() => handleImageError(article.id)}
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={9} lg={10}>
                    <Card.Body className="p-4">
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
          <div className="d-flex justify-content-center mb-4">
            <Pagination>
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
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
              />
            </Pagination>
          </div>

          {/* Pagination Info */}
          <div className="text-center text-muted mb-4">
            <small>
              {t('books.list.showing')}: {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.totalItems)} / {pagination.totalItems} {t('articles.languageSelector.articleCount')}
            </small>
          </div>
        </>
      )}

      <style jsx global>{`
        .article-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .article-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }

        .article-card .img-container {
          overflow: hidden;
        }

        .article-card .img-container img {
          transition: transform 0.3s ease;
        }

        .article-card:hover .img-container img {
          transform: scale(1.05);
        }

        .article-list-card {
          transition: all 0.3s ease !important;
        }

        .article-list-card:hover {
          transform: translateX(5px) !important;
          box-shadow: 0 5px 20px rgba(33, 147, 176, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
