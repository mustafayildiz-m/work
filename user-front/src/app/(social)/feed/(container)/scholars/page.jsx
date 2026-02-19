'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Badge } from 'react-bootstrap';
import { BsSearch, BsPerson, BsMortarboard, BsPeople, BsPlus, BsEye } from 'react-icons/bs';
import Link from 'next/link';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { useLanguage } from '@/context/useLanguageContext';

const ScholarsPage = () => {
  const { t } = useLanguage();
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredScholars, setFilteredScholars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchScholars = async () => {
      // Don't fetch if we're in search mode
      if (isSearching) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scholars?page=${currentPage}&limit=${itemsPerPage}`, {
          method: 'GET',
          headers: headers
        });


        if (response.ok) {
          const data = await response.json();

          if (data.scholars && Array.isArray(data.scholars)) {
            setScholars(data.scholars);
            setFilteredScholars(data.scholars);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
          }
        } else {
          setError('Alimler yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Error fetching scholars:', error);
        setError('Alimler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchScholars();
  }, [currentPage, isSearching]);

  // Debounced search effect
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setSearchLoading(true);

        try {
          const token = localStorage.getItem('token');
          const headers = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/scholars?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${itemsPerPage}`,
            {
              method: 'GET',
              headers: headers
            }
          );


          if (response.ok) {
            const data = await response.json();
            setFilteredScholars(data.scholars || []);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
          } else {
            console.error('Search failed:', response.status);
            setFilteredScholars([]);
          }
        } catch (error) {
          console.error('Error performing search:', error);
          setFilteredScholars([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, currentPage]);

  // Update filtered scholars when scholars change and not searching
  useEffect(() => {
    if (!isSearching && !searchQuery.trim()) {
      setFilteredScholars(scholars);
    }
  }, [scholars, isSearching, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Button
          key="first"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(1)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500'
          }}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        items.push(
          <span key="ellipsis1" style={{
            padding: '0 0.25rem',
            color: '#64748b',
            fontWeight: '600'
          }}>...</span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={i === currentPage ? "primary" : "outline-primary"}
          size="sm"
          onClick={() => handlePageChange(i)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="ellipsis2" style={{
            padding: '0 0.25rem',
            color: '#64748b',
            fontWeight: '600'
          }}>...</span>
        );
      }
      items.push(
        <Button
          key="last"
          variant="outline-primary"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          style={{
            borderRadius: '8px',
            minWidth: '40px',
            padding: '0.5rem',
            fontWeight: '500'
          }}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  const getImageUrl = (photoUrl) => {
    const defaultAvatar = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');

    // If photoUrl is null, undefined, or empty, return default avatar
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined' || photoUrl === '') {
      return defaultAvatar;
    }

    // If photoUrl is an object (imported image), return its src property or the default avatar
    if (typeof photoUrl === 'object') {
      return photoUrl.src || defaultAvatar;
    }

    // Ensure photoUrl is a string before using string methods
    if (typeof photoUrl !== 'string') {
      return defaultAvatar;
    }

    // If it's already an absolute URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:image/')) {
      return photoUrl;
    }

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Ensure we don't have double slashes if photoUrl starts with /
    const cleanPhotoUrl = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
    return `${apiBaseUrl}${cleanPhotoUrl}`;
  };

  const renderScholarCard = (scholar) => (
    <Col lg={4} md={6} sm={6} xs={12} className="mb-4" key={scholar.id}>
      <Card className="h-100 border-0 scholar-card" style={{
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        backgroundColor: '#fff',
        position: 'relative'
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
        }}
      >
        {/* Modern Header Gradient */}
        <div style={{
          height: '110px',
          background: 'linear-gradient(135deg, #66BB6A 0%, #2E7D32 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Dekoratif Arka Plan Deseni (Opsiyonel: Opacity ile) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 20%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.8) 0%, transparent 20%)'
          }} />

          {/* Büyütülmüş ve Şık Badge */}
          <div className="position-absolute" style={{
            top: '15px',
            right: '15px',
            width: '42px',
            height: '42px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2,
            transition: 'transform 0.3s ease'
          }}>
            <BsMortarboard size={20} style={{ color: '#2E7D32' }} />
          </div>
        </div>

        <div className="d-flex flex-column flex-grow-1 px-4 pb-4 pt-0 text-center position-relative">
          {/* Avatar Container - Header'ın üzerine taşacak */}
          <div className="mx-auto" style={{ marginTop: '-55px', marginBottom: '1rem' }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              padding: '5px',
              background: '#fff',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Image
                  src={getImageUrl(scholar.photoUrl)}
                  alt={scholar.fullName}
                  width={100}
                  height={100}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const target = e.target;
                    target.src = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');
                    target.srcset = "";
                  }}
                />
              </div>
            </div>
          </div>

          <CardTitle className="h5 mb-2 fw-bold" style={{ color: '#2c3e50', fontSize: '1.2rem' }}>
            {scholar.fullName || 'İsimsiz Alim'}
          </CardTitle>

          {scholar.biography && (
            <p className="text-muted mb-4 flex-grow-1" style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              color: '#6c757d'
            }}>
              {scholar.biography}
            </p>
          )}

          <div className="mt-auto pt-2">
            {scholar.id ? (
              <Link
                href={`/profile/scholar/${scholar.id}`}
                className="btn btn-outline-success w-100 rounded-pill fw-bold shadow-sm"
                style={{
                  padding: '0.7rem 1.5rem',
                  borderWidth: '2px',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem'
                }}
              >
                {t('scholars.viewProfile')}
              </Link>
            ) : (
              <Button
                variant="outline-secondary"
                className="w-100 rounded-pill fw-bold"
                disabled
              >
                {t('scholars.viewProfile')}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div className="col-lg-9 scholars-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">{t('scholars.loadingScholars')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9 scholars-page" style={{ marginBottom: '2rem' }}>
      <Card className="mb-3 mb-md-4 border-0 shadow-sm" style={{
        borderRadius: '18px',
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        <CardHeader style={{
          background: 'linear-gradient(135deg, rgba(181, 231, 160, 0.05) 0%, rgba(181, 231, 160, 0.1) 100%)',
          borderBottom: '1px solid rgba(181, 231, 160, 0.2)',
          padding: '1.25rem'
        }}>
          <CardTitle className="mb-0 d-flex align-items-center flex-wrap" style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            <BsMortarboard className="me-2 text-primary" size={24} />
            <span className="flex-grow-1">{t('scholars.title')}</span>
            <div
              className="ms-2 d-flex align-items-center"
              style={{
                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                color: '#1b5e20',
                padding: '0.5rem 1rem',
                borderRadius: '50rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: '1px solid #a5d6a7',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <BsMortarboard size={16} className="me-2" style={{ opacity: 0.8 }} />
              <span>{totalCount} {t('scholars.totalScholars') || 'Alim'}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardBody style={{
          padding: '1.5rem',
          paddingBottom: '2rem'
        }}>
          <Form.Group className="mb-4">
            <div className="input-group input-group-lg" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <span className="input-group-text" style={{
                background: 'var(--bs-light)',
                border: '1px solid rgba(181, 231, 160, 0.3)',
                borderRight: 'none',
                padding: '0.875rem 1rem'
              }}>
                {searchLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <BsSearch size={20} className="text-primary" />
                )}
              </span>
              <Form.Control
                type="text"
                placeholder={t('scholars.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  border: '1px solid rgba(181, 231, 160, 0.3)',
                  borderLeft: 'none',
                  fontSize: '1rem',
                  padding: '0.875rem 1rem'
                }}
              />
            </div>
            {isSearching && (
              <small className="text-muted mt-2 d-block" style={{
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                "{searchQuery}" {t('whoToFollow.searchInDatabase')} <strong>{totalCount}</strong> {t('whoToFollow.resultsFound')}
              </small>
            )}
          </Form.Group>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {filteredScholars.length === 0 ? (
            <div className="text-center py-5" style={{
              padding: '3rem 1rem'
            }}>
              <div className="mb-4" style={{
                width: '80px',
                height: '80px',
                margin: '0 auto',
                borderRadius: '50%',
                background: 'rgba(181, 231, 160, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BsMortarboard size={40} className="text-primary" />
              </div>
              <h5 className="mb-2" style={{
                color: '#64748b',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}>
                {t('scholars.noScholarsFound')}
              </h5>
              <p className="text-muted mb-0" style={{
                fontSize: '0.95rem',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                {searchQuery ? t('scholars.noScholarsDescription') : t('scholars.noScholarsFound')}
              </p>
            </div>
          ) : (
            <>
              <Row className="g-3">
                {filteredScholars.map(renderScholarCard)}
              </Row>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 pt-3 pb-3 scholars-pagination" style={{
                  borderTop: '1px solid rgba(181, 231, 160, 0.2)',
                  marginBottom: '1rem'
                }}>
                  <div className="d-flex align-items-center flex-wrap justify-content-center pagination-wrapper" style={{
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0 0.5rem'
                  }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                      style={{
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        minWidth: '80px'
                      }}
                    >
                      {t('pagination.previous')}
                    </Button>

                    <div className="d-flex align-items-center flex-wrap justify-content-center" style={{ gap: '0.5rem' }}>
                      {generatePaginationItems()}
                    </div>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                      style={{
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        minWidth: '80px'
                      }}
                    >
                      {t('pagination.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ScholarsPage;

