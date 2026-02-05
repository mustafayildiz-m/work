'use client';

import { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Button, Spinner, Alert, Dropdown, ButtonGroup } from 'react-bootstrap';
import { BsCalendarDate, BsSearch, BsPlayCircle, BsEye, BsHeart, BsGlobe2, BsChevronDown, BsGrid3X3Gap, BsList } from 'react-icons/bs';
import { useScholarStories } from '@/hooks/useScholarStories';
import NewsImage from './NewsImage';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import './IslamicNews.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const StoryCard = ({ story, languages = [] }) => {
  const {
    id,
    title,
    description,
    thumbnail_url,
    video_url,
    duration,
    view_count,
    like_count,
    scholar,
    created_at,
    language,
    is_featured
  } = story;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLanguageLabel = (langCode) => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? lang.name : langCode;
  };

  // Thumbnail URL'i oluştur
  const getThumbnailUrl = () => {
    if (!thumbnail_url) return null;
    return thumbnail_url.startsWith('http') 
      ? thumbnail_url 
      : `${API_BASE_URL}${thumbnail_url}`;
  };

  return (
    <Link href={`/blogs/story/${id}`} className="text-decoration-none">
      <Card className={`h-100 border-0 shadow-sm hover-elevate transition-all ${is_featured ? 'border-warning border-2' : ''}`} style={{ cursor: 'pointer' }}>
        <div className="position-relative">
          {/* Story Thumbnail */}
          <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
                <NewsImage 
                  className="w-100 h-100" 
                  src={getThumbnailUrl() || '/images/book-placeholder.jpg'} 
                  alt={title}
                  width={400}
                  height={180}
                  style={{ 
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
            {/* Play Button */}
            {video_url && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <BsPlayCircle size={48} className="text-white opacity-75" />
              </div>
            )}
            {/* Duration Badge */}
            {duration && (
              <div className="position-absolute bottom-0 end-0 m-2">
                <span className="badge bg-dark bg-opacity-75 text-white">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
            {/* Language Badge */}
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-primary bg-opacity-90 shadow-sm">
                {getLanguageLabel(language)}
              </span>
            </div>
            {/* Featured Badge */}
            {is_featured && (
              <div className="position-absolute top-0 end-0 m-2">
                <span className="badge bg-warning bg-opacity-90 shadow-sm text-dark fw-bold">
                  ⭐ Öne Çıkan
                </span>
              </div>
            )}
          </div>
          
          {/* Card Body */}
          <Card.Body className="p-3">
            {/* Title */}
            <h6 className="mb-2 fw-bold line-clamp-2 text-reset" style={{ 
              minHeight: '2.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'inherit'
            }}>
              {title}
            </h6>
            
            {/* Scholar Name */}
            {scholar && (
              <p className="text-primary small mb-2 fw-semibold">
                {scholar.fullName}
              </p>
            )}
            
            {/* Description */}
            <p className="text-muted small mb-3 line-clamp-3" style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.6rem'
            }}>
              {description}
            </p>
            
            {/* Meta Information */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <BsCalendarDate size={14} className="text-muted" />
                <small className="text-muted">{formatDate(created_at)}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  <BsEye size={12} className="text-muted" />
                  <small className="text-muted">{view_count || 0}</small>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <BsHeart size={12} className="text-muted" />
                  <small className="text-muted">{like_count || 0}</small>
                </div>
              </div>
            </div>
          </Card.Body>
        </div>
      </Card>
    </Link>
  );
};

const ScholarStories = () => {
  const { t } = useLanguage();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    // localStorage'dan görünüm modunu güvenli şekilde oku
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('blogsViewMode');
        if (saved === 'grid' || saved === 'list') {
          return saved;
        }
      }
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
    }
    return 'grid';
  }); // 'grid' veya 'list'
  const { stories, loading, error, pagination, searchQuery, selectedLanguage, searchStories, goToPage, refetch, clearSearch, changeLanguage } = useScholarStories();

  // Hikayeleri doğrudan kullan
  const filteredStories = stories;

  // Görünüm modunu localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('blogsViewMode', viewMode);
      } catch (error) {
        console.error('localStorage yazma hatası:', error);
      }
    }
  }, [viewMode]);

  // Dilleri backend'den yükle
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLanguages(data || []);
        }
      } catch (error) {
        console.error('Diller yüklenirken hata:', error);
      } finally {
        setLanguagesLoading(false);
      }
    };
    
    fetchLanguages();
  }, []);

  // Dil bayrakları mapping
  const languageFlags = {
    'tr': '🇹🇷',
    'en': '🇬🇧',
    'ar': '🇸🇦',
    'de': '🇩🇪',
    'fr': '🇫🇷',
    'ja': '🇯🇵',
    'ru': '🇷🇺',
    'it': '🇮🇹',
    'es': '🇪🇸',
  };

  // Dil seçenekleri - backend'den gelen diller
  const languageOptions = languages.map(lang => ({
    code: lang.code,
    label: lang.name,
    flag: languageFlags[lang.code] || '🌍'
  }));

  // Mevcut dil - "all" veya seçili dil
  const currentLanguage = selectedLanguage === 'all' || !selectedLanguage
    ? { code: 'all', label: 'Tüm Diller', flag: '🌍' }
    : languageOptions.find(lang => lang.code === selectedLanguage) || languageOptions[0] || { code: 'tr', label: 'Türkçe', flag: '🇹🇷' };

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      searchStories(localSearchQuery.trim());
    } else {
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    clearSearch();
  };

  const handlePageChange = (page) => {
    goToPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;
    const maxVisiblePages = 5;
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <li key="prev" className={`page-item ${page === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          {t('blogs.previous')}
        </button>
      </li>
    );

    // First page and ellipsis
    if (startPage > 1) {
      items.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        items.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      items.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    // Next button
    items.push(
      <li key="next" className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          {t('blogs.next')}
        </button>
      </li>
    );

    return items;
  };

  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>{t('common.error')}!</Alert.Heading>
        <p>{t('blogs.errorLoading')}: {error}</p>
        <Button variant="outline-danger" onClick={refetch}>
          {t('blogs.retry')}
        </Button>
      </Alert>
    );
  }

  return (
    <div className="bg-mode p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="h4 mb-0">{t('blogs.title')}</h1>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-primary">{pagination.total} {t('blogs.storiesCount')}</span>
          <div className="btn-group" role="group">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title={t('blogs.gridView')}
            >
              <BsGrid3X3Gap size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('list')}
              title={t('blogs.listView')}
            >
              <BsList size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Language Selector & Search Form */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">
                <BsGlobe2 size={14} className="me-1" />
                {t('blogs.filterByLanguage')}
              </Form.Label>
              <Dropdown className="w-100">
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  id="language-dropdown"
                  className="w-100 d-flex align-items-center justify-content-between"
                  disabled={languagesLoading}
                >
                  <span>
                    {languagesLoading ? (
                      <span>Yükleniyor...</span>
                    ) : (
                      <>
                        <span className="me-2">{currentLanguage?.flag || '🌍'}</span>
                        {currentLanguage?.label || 'Dil Seçin'}
                      </>
                    )}
                  </span>
                  <BsChevronDown size={14} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100 dropdown-menu-end">
                  {/* Tüm Diller Seçeneği */}
                  <Dropdown.Item
                    active={!selectedLanguage || selectedLanguage === 'all'}
                    onClick={() => changeLanguage('all')}
                  >
                    <span className="me-2">🌍</span>
                    Tüm Diller
                    {(!selectedLanguage || selectedLanguage === 'all') && (
                      <span className="ms-2 text-success">✓</span>
                    )}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {languageOptions.map((lang) => (
                    <Dropdown.Item
                      key={lang.code}
                      active={selectedLanguage === lang.code}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <span className="me-2">{lang.flag}</span>
                      {lang.label}
                      {selectedLanguage === lang.code && (
                        <span className="ms-2 text-success">✓</span>
                      )}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">
                <BsSearch size={14} className="me-1" />
                {t('common.search')}
              </Form.Label>
              <div className="input-group">
                <Form.Control
                  type="text"
                  placeholder={t('blogs.searchPlaceholder')}
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  <BsSearch size={16} />
                </Button>
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1 d-none d-md-block">&nbsp;</Form.Label>
              {searchQuery && (
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClearSearch}
                  className="w-100"
                >
                  {t('blogs.clearSearch')}
                </Button>
              )}
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Stories Grid/List */}
      {viewMode === 'grid' ? (
        <Row className="g-4">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <Col key={story.id} xs={12} md={6} lg={4}>
                <StoryCard story={story} languages={languages} />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5">
                {searchQuery ? (
                  <>
                    <h5 className="text-muted mb-3">&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                    <Button variant="outline-primary" onClick={() => window.location.reload()}>
                      {t('blogs.showAll')}
                    </Button>
                  </>
                ) : (
                  <h5 className="text-muted">{t('blogs.noStories')}</h5>
                )}
              </div>
            </Col>
          )}
        </Row>
      ) : (
        <div className="list-view">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => {
              const {
                id,
                title,
                description,
                thumbnail_url,
                video_url,
                duration,
                view_count,
                like_count,
                scholar,
                created_at,
                language,
                is_featured
              } = story;

              const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              };

              const formatDuration = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
              };

              const getLanguageLabel = (langCode) => {
                const lang = languages.find(l => l.code === langCode);
                return lang ? lang.name : langCode;
              };

              const getThumbnailUrl = () => {
                if (!thumbnail_url) return null;
                return thumbnail_url.startsWith('http') 
                  ? thumbnail_url 
                  : `${API_BASE_URL}${thumbnail_url}`;
              };

              return (
                <Link key={id} href={`/blogs/story/${id}`} className="text-decoration-none">
                  <Card className="mb-3 shadow-sm border-0 hover-elevate transition-all" style={{ cursor: 'pointer' }}>
                    <Row className="g-0">
                      <Col xs={12} md={4} lg={3}>
                        <div className="position-relative" style={{ height: '100%', minHeight: '200px' }}>
                          <NewsImage 
                            className="w-100 h-100 rounded-start" 
                            src={getThumbnailUrl() || '/images/book-placeholder.jpg'} 
                            alt={title}
                            width={300}
                            height={200}
                            style={{ 
                              objectFit: 'cover',
                              width: '100%',
                              height: '100%'
                            }}
                          />
                          {video_url && (
                            <div className="position-absolute top-50 start-50 translate-middle">
                              <BsPlayCircle size={40} className="text-white opacity-75" />
                            </div>
                          )}
                          {is_featured && (
                            <div className="position-absolute top-0 end-0 m-2">
                              <span className="badge bg-warning bg-opacity-90 shadow-sm text-dark fw-bold">
                                ⭐ Öne Çıkan
                              </span>
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col xs={12} md={8} lg={9}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h5 className="mb-2 text-reset">{title}</h5>
                              {scholar && (
                                <p className="text-primary small mb-2 fw-semibold">
                                  {scholar.fullName}
                                </p>
                              )}
                            </div>
                            <span className="badge bg-primary ms-2">
                              {getLanguageLabel(language)}
                            </span>
                          </div>
                          
                          <p className="text-muted mb-3" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.6'
                          }}>
                            {description}
                          </p>
                          
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <BsCalendarDate size={14} className="text-muted" />
                              <small className="text-muted">{formatDate(created_at)}</small>
                              {duration && (
                                <>
                                  <span className="text-muted">•</span>
                                  <small className="text-muted">{formatDuration(duration)}</small>
                                </>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <div className="d-flex align-items-center gap-1">
                                <BsEye size={14} className="text-muted" />
                                <small className="text-muted">{view_count || 0}</small>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <BsHeart size={14} className="text-muted" />
                                <small className="text-muted">{like_count || 0}</small>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-5">
              {searchQuery ? (
                <>
                  <h5 className="text-muted mb-3">&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                  <Button variant="outline-primary" onClick={() => window.location.reload()}>
                    {t('blogs.showAll')}
                  </Button>
                </>
              ) : (
                <h5 className="text-muted">{t('blogs.noStories')}</h5>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredStories.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-4">
          <nav aria-label="Hikaye sayfalama">
            <ul className="pagination pagination-light d-inline-block d-md-flex justify-content-center">
              {generatePaginationItems()}
            </ul>
          </nav>
        </div>
      )}

      {/* Pagination Info */}
      {filteredStories.length > 0 && (
        <div className="mt-4 text-center">
          <small className="text-muted">
            {searchQuery ? 
              `"${searchQuery}" ${t('blogs.searchResults')} ${filteredStories.length} ${t('blogs.storiesFound')}` :
              `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} ${t('blogs.paginationInfo')} ${pagination.total} ${t('blogs.storiesCount')}`
            }
          </small>
        </div>
      )}
    </div>
  );
};

export default ScholarStories;
