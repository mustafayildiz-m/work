'use client';

import { useState, useEffect, useCallback } from 'react';
import { Col, Form, Spinner } from 'react-bootstrap';
import { BsSearch, BsBook } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/useLanguageContext';
import LanguageSelector from './components/LanguageSelector';
import { getBookCoverUrl } from '@/utils/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getFlagImageUrl = (flagUrl) => {
  if (!flagUrl) return null;
  if (flagUrl.startsWith('http://') || flagUrl.startsWith('https://')) return flagUrl;
  return `${API_BASE_URL}${flagUrl.startsWith('/') ? flagUrl : `/${flagUrl}`}`;
};

const BooksPage = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const pickBestTranslation = useCallback((book, search) => {
    const translations = book.translations || [];
    if (translations.length === 0) return null;
    const searchNorm = (search || '').trim().toLowerCase().normalize('NFC');
    if (searchNorm.length >= 2) {
      const matched = translations.find((t) => {
        if (!t?.title) return false;
        const titleNorm = String(t.title).toLowerCase().normalize('NFC');
        return titleNorm.includes(searchNorm) || searchNorm.includes(titleNorm);
      });
      if (matched) return matched;
    }
    return translations[0];
  }, []);

  const fetchBooks = useCallback(async (search) => {
    if (!search || search.length < 2) {
      setBooks([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/books?search=${encodeURIComponent(search)}&limit=12&page=1`
      );
      const json = await res.json();
      const data = json.data || [];
      setBooks(
        data.map((book) => {
          const trans = pickBestTranslation(book, search);
          const lang = trans?.language;
          return {
            ...book,
            _matchedTranslation: trans,
            title: trans?.title || book.author || t('books.untitledBook'),
            author: book.author,
            languageName: lang?.name,
            languageFlagUrl: lang?.flagUrl,
          };
        })
      );
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [pickBestTranslation, t]);

  useEffect(() => {
    fetchBooks(debouncedQuery);
  }, [debouncedQuery, fetchBooks]);

  const getBookDetailUrl = (book) => {
    const trans = book._matchedTranslation || book.translations?.[0];
    if (trans?.languageId) {
      const params = new URLSearchParams({
        languageId: trans.languageId,
        languageName: trans.language?.name || '',
        languageCode: trans.language?.code || '',
      });
      return `/feed/books/${book.id}?${params.toString()}`;
    }
    return `/feed/books/${book.id}`;
  };

  const showResults = debouncedQuery.length >= 2;

  return (
    <Col lg={9} className="feed-main-col feed-main-col--stacked">
      {/* Live arama - buton yok, yazdıkça listele */}
      <div className="feed-main-col__above mb-4">
        <div
          className="position-relative rounded-4 overflow-hidden books-search-banner"
          style={{
            background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #66bb6a 100%)',
            boxShadow: '0 10px 40px rgba(46, 125, 50, 0.25)',
          }}
        >
          <div className="p-2 p-md-3 p-lg-4">
            <div className="position-relative">
              <BsSearch
                className="position-absolute top-50 translate-middle-y opacity-80"
                style={{ left: '1.1rem', fontSize: '1.15rem', color: '#1b5e20' }}
              />
              <Form.Control
                type="text"
                placeholder={t('books.globalSearchPlaceholder') || 'Kitap adına göre ara...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 rounded-pill ps-5 shadow-sm books-search-input"
                style={{
                  fontSize: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.98)',
                }}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Sonuçlar - yazdıkça altta */}
        {showResults && (
          <div
            className="mt-3 rounded-4 overflow-hidden border-0 shadow-lg animate-fade-in book-search-results"
            style={{
              backgroundColor: 'var(--bs-body-bg, #fff)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <BsBook size={32} className="mb-2 opacity-50" />
                <p className="mb-0">{t('books.noResults') || 'Sonuç bulunamadı'}</p>
              </div>
            ) : (
              <div className="p-2 p-sm-3">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    href={getBookDetailUrl(book)}
                    className="book-search-item book-search-grid p-2 p-md-3 rounded-3 text-decoration-none text-body"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <div
                      className="rounded-2 overflow-hidden position-relative book-search-cover"
                    >
                      <Image
                        src={getBookCoverUrl(book, 'thumb', API_BASE_URL)}
                        alt={book.title}
                        fill
                        sizes="(max-width: 400px) 36px, (max-width: 576px) 40px, 48px"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/images/book-placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0 book-search-text overflow-hidden">
                      <div className="fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                        {book.title}
                      </div>
                      {book.author && (
                        <div className="text-muted small text-truncate">{book.author}</div>
                      )}
                    </div>
                    {book.languageFlagUrl ? (
                      <div
                        className="d-flex align-items-center justify-content-end overflow-hidden book-flag-badge"
                        title={book.languageName}
                      >
                        <img
                          src={getFlagImageUrl(book.languageFlagUrl)}
                          alt={book.languageName || ''}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="book-flag-spacer" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="feed-main-col__fill">
        <LanguageSelector />
      </div>

      <style jsx global>{`
        .book-search-grid {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 0.75rem;
          align-items: center;
        }
        .book-search-text {
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
        }
        .book-search-text .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .book-search-cover {
          width: 48px;
          height: 72px;
        }
        .book-flag-spacer {
          width: 96px;
          min-width: 96px;
        }
        .book-flag-badge {
          width: 96px;
          height: 72px;
          min-width: 96px;
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          border: 2px solid rgba(255,255,255,0.4);
          transition: all 0.25s ease;
        }
        .book-search-item:hover {
          background: rgba(46, 125, 50, 0.1) !important;
        }
        .book-search-item:hover .book-flag-badge {
          box-shadow: 0 6px 20px rgba(46, 125, 50, 0.25) !important;
          transform: scale(1.02);
        }
        [data-bs-theme="dark"] .book-search-item:hover {
          background: rgba(102, 187, 106, 0.15) !important;
        }
        .animate-fade-in {
          animation: bookSearchFadeIn 0.3s ease-out;
        }
        @keyframes bookSearchFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Mobile */
        @media (max-width: 575.98px) {
          .book-search-grid {
            gap: 0.5rem;
          }
          .book-search-cover {
            width: 40px;
            height: 60px;
          }
          .book-flag-badge {
            width: 56px;
            height: 42px;
            min-width: 56px;
            border-radius: 12px;
          }
          .book-flag-spacer {
            width: 56px;
            min-width: 56px;
          }
          .book-search-item .fw-semibold {
            font-size: 0.9rem !important;
          }
          .book-search-results {
            max-height: 60vh !important;
          }
        }
        /* Small mobile */
        @media (max-width: 399.98px) {
          .book-search-cover {
            width: 32px;
            height: 48px;
          }
          .book-flag-badge {
            width: 40px;
            height: 30px;
            min-width: 40px;
            border-radius: 8px;
          }
          .book-flag-spacer {
            width: 40px;
            min-width: 40px;
          }
          .book-search-item {
            padding: 0.35rem 0.5rem !important;
          }
          .book-search-item .fw-semibold {
            font-size: 0.75rem !important;
          }
        }
        /* Search bar mobile */
        @media (max-width: 767.98px) {
          .books-search-banner .p-2 {
            padding: 0.5rem 0.75rem !important;
          }
          .books-search-input {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </Col>
  );
};

export default BooksPage;
