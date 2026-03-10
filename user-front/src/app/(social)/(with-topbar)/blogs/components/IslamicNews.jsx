'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Card, Col, Row, Form, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { BsCalendarDate, BsPlayCircle, BsEye, BsHeart, BsGlobe2, BsGrid3X3Gap, BsList } from 'react-icons/bs';
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      <Card className={`story-video-card border-0 shadow-sm ${is_featured ? 'border-warning border-2' : ''}`}>
        {/* Thumbnail - 16:9 video oranı */}
        <div className="story-video-card__thumb position-relative overflow-hidden">
          <NewsImage
            className="w-100 h-100"
            src={getThumbnailUrl() || '/images/book-placeholder.jpg'}
            alt={title}
            width={400}
            height={225}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
          {video_url && (
            <div className="position-absolute top-50 start-50 translate-middle">
              <BsPlayCircle size={56} className="text-white opacity-90 drop-shadow" />
            </div>
          )}
          {duration && (
            <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-80 text-white">
              {formatDuration(duration)}
            </span>
          )}
          <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
            {getLanguageLabel(language)}
          </span>
          {is_featured && (
            <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark fw-bold">
              ⭐ Öne Çıkan
            </span>
          )}
        </div>

        {/* Sabit yükseklikte içerik alanı - tüm kartlar aynı */}
        <Card.Body className="story-video-card__body p-3">
          <h6 className="story-video-card__title mb-1 fw-semibold text-reset">
            {title}
          </h6>
          {scholar && (
            <p className="text-primary small mb-2 fw-medium opacity-90">
              {scholar.fullName}
            </p>
          )}
          <div className="story-video-card__meta d-flex align-items-center gap-1 flex-nowrap">
            <small className="text-muted d-flex align-items-center gap-1 text-nowrap">
              <BsCalendarDate size={11} />
              {formatDate(created_at)}
            </small>
            <span className="text-muted flex-shrink-0">•</span>
            <small className="text-muted d-flex align-items-center gap-1 flex-shrink-0">
              <BsEye size={11} />
              {view_count || 0}
            </small>
            <small className="text-muted d-flex align-items-center gap-1 flex-shrink-0">
              <BsHeart size={11} />
              {like_count || 0}
            </small>
          </div>
        </Card.Body>
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

  // Yazarken debounced arama (Enter'a basmadan)
  useEffect(() => {
    const trimmed = localSearchQuery.trim();
    const timer = setTimeout(() => {
      if (trimmed) {
        searchStories(trimmed);
      } else if (searchQuery) {
        clearSearch();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearchQuery, searchStories, clearSearch]);

  // Dilleri backend'den yükle (sessionStorage cache ile hızlı yenileme)
  useEffect(() => {
    const CACHE_KEY = 'languages-cache';
    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

    const getCached = () => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) return null;
        return data;
      } catch {
        return null;
      }
    };

    const setCached = (data) => {
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch {}
    };

    const fetchLanguages = async () => {
      const cached = getCached();
      if (cached) {
        setLanguages(cached);
        setLanguagesLoading(false);
      } else {
        setLanguagesLoading(true);
      }

      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/languages`, {
          headers: headers
        });

        if (response.ok) {
          const data = await response.json();
          const activeLangs = (data || []).filter(l => l.isActive !== false);
          const sorted = activeLangs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setCached(sorted);
          setLanguages(sorted);
        }
      } catch (error) {
        console.error('Diller yüklenirken hata:', error);
        if (!cached) setLanguages([]);
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Dil kodu -> bayrak emoji (flagUrl yoksa kullanılır)
  const languageFlagEmojis = {
    tr: '🇹🇷', en: '🇬🇧', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', ja: '🇯🇵', ru: '🇷🇺', it: '🇮🇹', es: '🇪🇸',
    zh: '🇨🇳', hi: '🇮🇳', ko: '🇰🇷', pt: '🇵🇹', nl: '🇳🇱', pl: '🇵🇱', uk: '🇺🇦', ku: '🇮🇶', ro: '🇷🇴',
    bg: '🇧🇬', sr: '🇷🇸', hu: '🇭🇺', cs: '🇨🇿', sk: '🇸🇰', sl: '🇸🇮', mk: '🇲🇰', hy: '🇦🇲',
    mr: '🇮🇳', te: '🇮🇳', gu: '🇮🇳', ml: '🇮🇳', kn: '🇮🇳', or: '🇮🇳', fa: '🇮🇷', ur: '🇵🇰',
    id: '🇮🇩', ms: '🇲🇾', th: '🇹🇭', vi: '🇻🇳', bn: '🇧🇩', ta: '🇱🇰', az: '🇦🇿', kk: '🇰🇿',
    uz: '🇺🇿', ky: '🇰🇬', tk: '🇹🇲', he: '🇮🇱', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮',
    el: '🇬🇷', ca: '🇪🇸', ps: '🇦🇫', ha: '🇳🇬', sw: '🇹🇿', am: '🇪🇹', so: '🇸🇴', mn: '🇲🇳',
    km: '🇰🇭', lo: '🇱🇦', my: '🇲🇲', si: '🇱🇰', jv: '🇮🇩', tl: '🇵🇭', eo: '🌍', eu: '🇪🇸'
  };

  const selectOptions = useMemo(() => {
    const allOption = { value: 'all', label: t('blogs.allLanguages'), flagUrl: null, flagEmoji: '🌍' };
    const langOpts = languages.map(lang => ({
      value: lang.code,
      label: lang.name,
      flagUrl: lang.flagUrl,
      flagEmoji: languageFlagEmojis[lang.code] || '🌍'
    }));
    return [allOption, ...langOpts];
  }, [languages, t]);

  const selectedOption = useMemo(() => {
    if (selectedLanguage === 'all' || !selectedLanguage) return selectOptions[0];
    return selectOptions.find(o => o.value === selectedLanguage) || selectOptions[0];
  }, [selectedLanguage, selectOptions]);

  const formatOptionLabel = (option) => (
    <span className="d-flex align-items-center gap-2">
      {option.flagUrl ? (
        <img
          src={option.flagUrl.startsWith('http') ? option.flagUrl : `${API_BASE_URL}${option.flagUrl}`}
          alt=""
          className="language-flag-icon"
        />
      ) : (
        <span className="language-flag-emoji">{option.flagEmoji}</span>
      )}
      {option.label}
    </span>
  );

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
              <Select
                value={selectedOption}
                options={selectOptions}
                formatOptionLabel={formatOptionLabel}
                onChange={(opt) => changeLanguage(opt?.value || 'all')}
                isDisabled={languagesLoading}
                isSearchable
                placeholder={languagesLoading ? t('common.loading') : t('blogs.selectLanguage')}
                className="blogs-language-select"
                classNamePrefix="blogs-lang"
                maxMenuHeight={280}
                noOptionsMessage={() => 'Sonuç bulunamadı'}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: 38,
                    borderColor: 'var(--bs-border-color)'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 1060
                  })
                }}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">
                {t('common.search')}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t('blogs.searchPlaceholder')}
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
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
