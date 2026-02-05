'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Row, Col, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { BsDownload, BsHeart, BsEye } from 'react-icons/bs';
import { useBooks } from '@/hooks/useBooks';

const itemsPerPage = 12;

export default function BookGrid({ selectedLanguageId, languageCode, languageName }) {
  const { books, loading, error, pagination, goToPage } = useBooks(selectedLanguageId);
  const [page, setPage] = useState(1);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    goToPage(newPage);
  };

  const getBookImage = (book) => {
    // Backend'den gelen coverImage veya coverUrl'i kullan
    if (book.coverImage) {
      return book.coverImage.startsWith('http') ? book.coverImage : `${process.env.NEXT_PUBLIC_API_URL}${book.coverImage}`;
    }
    if (book.coverUrl) {
      return book.coverUrl.startsWith('http') ? book.coverUrl : `${process.env.NEXT_PUBLIC_API_URL}${book.coverUrl}`;
    }
    // Default kitap resmi
    return '/images/book-placeholder.jpg';
  };

  // Kitap detay URL'ini oluştur
  const getBookDetailUrl = (bookId) => {
    if (selectedLanguageId && languageCode && languageName) {
      const params = new URLSearchParams({
        languageId: selectedLanguageId,
        languageCode,
        languageName
      });
      return `/feed/books/${bookId}?${params.toString()}`;
    }
    return `/feed/books/${bookId}`;
  };

  const paginationItems = [];
  for (let number = 1; number <= pagination.totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === page} 
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
        <p className="mt-3">Kitaplar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Hata!</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>Kitap Bulunamadı</Alert.Heading>
        <p>Henüz hiç kitap eklenmemiş.</p>
      </Alert>
    );
  }

  return (
    <div className="my-5">
      <Row>
        {books.map((book, idx) => (
          <Col key={book.id || idx} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <div className="book-card-wrapper position-relative overflow-hidden">
              <Card className="h-100 shadow-sm border-0">
                <div className="img-container position-relative">
                  <Image
                    src={getBookImage(book)}
                    alt={book.title || 'Kitap Resmi'}
                    width={250}
                    height={350}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                    className="card-img-top"
                    onError={(e) => {
                      e.target.src = '/images/book-placeholder.jpg';
                    }}
                  />
                  <div className="hover-icons d-flex flex-column gap-2">
                    <div className="icon-btn bg-white shadow rounded p-2">
                      <BsHeart />
                    </div>
                    <div className="icon-btn bg-white shadow rounded p-2">
                      <BsDownload />
                    </div>
                    <div className="icon-btn bg-white shadow rounded p-2">
                      <BsEye />
                    </div>
                  </div>
                </div>
                <Card.Body>
                  <Link href={getBookDetailUrl(book.id)} className="text-decoration-none">
                    <Card.Title className="text-center" style={{ fontSize: '1rem' }}>
                      {book.title}
                    </Card.Title>
                  </Link>
                  {book.author && (
                    <p className="text-muted small text-center mb-2">
                      {book.author}
                    </p>
                  )}
                  {book.categories && book.categories.length > 0 && (
                    <div className="text-center">
                      {book.categories.slice(0, 2).map((category, catIdx) => (
                        <span 
                          key={catIdx}
                          className="badge bg-primary bg-opacity-10 text-primary me-1"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        ))}
      </Row>

      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.Prev 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            />
            {paginationItems}
            <Pagination.Next 
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}
