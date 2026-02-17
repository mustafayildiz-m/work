'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Form, InputGroup, Button, Pagination, Spinner, Alert, Badge, Collapse } from 'react-bootstrap';
import { BsMicFill, BsPlayFill, BsPauseFill, BsHeart, BsSearch, BsClock, BsEye, BsStarFill, BsFilter, BsArrowLeft, BsGrid3X3Gap, BsList, BsChevronDown, BsChevronUp, BsSkipBackward, BsSkipForward, BsX } from 'react-icons/bs';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PodcastsListPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const languageId = searchParams.get('languageId');
  const languageName = decodeURIComponent(searchParams.get('languageName') || '');
  const languageCode = searchParams.get('languageCode');
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    // localStorage'dan görünüm modunu güvenli şekilde oku
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('podcastsViewMode');
        if (saved === 'grid' || saved === 'list') {
          return saved;
        }
      }
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
    }
    return 'grid';
  }); // 'grid' veya 'list'
  const [showCategoryFilter, setShowCategoryFilter] = useState(() => {
    // localStorage'dan kategori filtre durumunu güvenli şekilde oku
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('podcastsCategoryFilterOpen');
        return saved === 'true';
      }
    } catch (error) {
      console.error('localStorage okuma hatası:', error);
    }
    return false;
  });
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const itemsPerPage = 12;

  const fetchPodcasts = useCallback(async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      setError(null);

      if (search && search.trim()) {
        const searchResponse = await fetch(`${API_URL}/podcasts/search?q=${encodeURIComponent(search)}&page=${page}&limit=${itemsPerPage}`);
        if (!searchResponse.ok) throw new Error('Arama başarısız');
        const searchResult = await searchResponse.json();

        // Dil filtrelemesi
        const filteredPodcasts = languageCode
          ? (searchResult.podcasts || []).filter(p => p.language === languageCode)
          : searchResult.podcasts || [];

        setPodcasts(filteredPodcasts);
        setPagination({
          totalCount: filteredPodcasts.length,
          totalPages: Math.ceil(filteredPodcasts.length / itemsPerPage),
          currentPage: page,
          limit: itemsPerPage,
          hasNextPage: page < Math.ceil(filteredPodcasts.length / itemsPerPage),
          hasPreviousPage: page > 1,
        });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        isActive: 'true',
      });

      if (languageCode) {
        params.append('language', languageCode);
      }

      if (category && category.trim()) {
        params.append('category', category.trim());
      }

      const response = await fetch(`${API_URL}/podcasts?${params.toString()}`);
      if (!response.ok) throw new Error('Podcastler yüklenemedi');

      const result = await response.json();
      setPodcasts(result.podcasts || []);
      setPagination({
        totalCount: result.total || 0,
        totalPages: result.totalPages || 0,
        currentPage: page,
        limit: itemsPerPage,
        hasNextPage: page < (result.totalPages || 0),
        hasPreviousPage: page > 1,
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, languageCode]);

  useEffect(() => {
    if (languageId) {
      fetchPodcasts(currentPage, activeSearch, selectedCategory);
    }
  }, [languageId, currentPage, activeSearch, selectedCategory, fetchPodcasts]);

  // Görünüm modunu localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('podcastsViewMode', viewMode);
      } catch (error) {
        console.error('localStorage yazma hatası:', error);
      }
    }
  }, [viewMode]);

  // Kategori filtre durumunu localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('podcastsCategoryFilterOpen', showCategoryFilter.toString());
      } catch (error) {
        console.error('localStorage yazma hatası:', error);
      }
    }
  }, [showCategoryFilter]);

  useEffect(() => {
    if (!languageId) {
      router.push('/feed/podcasts');
    }
  }, [languageId, router]);

  if (!languageId) {
    return null;
  }

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
    setCurrentPage(1);
    setActiveSearch(searchQuery);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePlay = (podcast) => {
    if (currentlyPlaying?.id === podcast.id) {
      // Pause current podcast
      if (audioRef) {
        audioRef.pause();
        setIsPlaying(false);
      }
      setCurrentlyPlaying(null);
    } else {
      // Play new podcast
      if (audioRef) {
        audioRef.pause();
      }
      setCurrentlyPlaying(podcast);
      setIsPlaying(true);
      fetch(`${API_URL}/podcasts/${podcast.id}/listen`, { method: 'POST' }).catch(() => { });
    }
  };

  const handlePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeekForward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.min(audioRef.currentTime + 10, audioRef.duration);
    }
  };

  const handleSeekBackward = () => {
    if (audioRef) {
      audioRef.currentTime = Math.max(audioRef.currentTime - 10, 0);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.currentTime = percentage * duration;
    }
  };

  useEffect(() => {
    if (currentlyPlaying && audioRef) {
      const audioUrl = getAudioUrl(currentlyPlaying.audioUrl);
      audioRef.src = audioUrl;
      audioRef.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio play error:', err);
        toast.error('Ses çalınamadı. Lütfen tekrar deneyin.');
        setIsPlaying(false);
      });
    }
  }, [currentlyPlaying, audioRef]);

  const handleLike = async (podcast) => {
    try {
      await fetch(`${API_URL}/podcasts/${podcast.id}/like`, { method: 'POST' });
      setPodcasts(prev => prev.map(p =>
        p.id === podcast.id ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p
      ));
      toast.success('Beğenildi!');
    } catch (err) {
      toast.error('Beğeni kaydedilemedi');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCoverUrl = (coverImage) => {
    if (!coverImage) return '/images/podcast-placeholder.jpg';
    if (coverImage.startsWith('http')) return coverImage;
    return `${API_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
  };

  const getAudioUrl = (audioUrl) => {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http')) return audioUrl;
    return `${API_URL}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
  };

  const categories = ['Hadis', 'Fıkıh', 'Tefsir', 'Siyer', 'Akaid', 'Tasavvuf', 'Genel'];

  return (
    <Col lg={9} style={{ paddingBottom: currentlyPlaying ? '120px' : '0' }}>
      {/* Audio Player (Hidden) */}
      <audio
        ref={(ref) => setAudioRef(ref)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => {
          setCurrentlyPlaying(null);
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio error:', e);
          toast.error('Ses dosyası yüklenemedi');
          setCurrentlyPlaying(null);
          setIsPlaying(false);
        }}
        style={{ display: 'none' }}
      />


      {/* Modern Bottom-Fixed Audio Player */}
      {currentlyPlaying && (
        <div
          className="position-fixed bottom-0 start-0 w-100 podcast-player-container"
          style={{
            zIndex: 1050,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)',
            borderTop: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          {/* Progress Bar */}
          <div
            onClick={handleProgressClick}
            style={{
              height: '4px',
              background: 'rgba(102, 126, 234, 0.2)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.1s linear',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#667eea',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.5)'
                }}
              />
            </div>
          </div>

          <div className="container-fluid px-3 py-2">
            <Row className="align-items-center g-2">
              {/* Album Art & Info */}
              <Col xs={12} md={4} lg={3}>
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                    <Image
                      src={getCoverUrl(currentlyPlaying.coverImage)}
                      alt={currentlyPlaying.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="mb-0 text-truncate fw-bold" style={{ fontSize: '0.95rem' }}>
                      {currentlyPlaying.title}
                    </h6>
                    <small className="text-muted text-truncate d-block">
                      {currentlyPlaying.author}
                    </small>
                  </div>
                </div>
              </Col>

              {/* Controls */}
              <Col xs={12} md={4} lg={6}>
                <div className="d-flex flex-column align-items-center gap-2">
                  {/* Play Controls */}
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    {/* Backward 10s */}
                    <Button
                      variant="link"
                      className="p-0 text-dark"
                      onClick={handleSeekBackward}
                      title="10 saniye geri"
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <BsSkipBackward size={20} />
                    </Button>

                    {/* Play/Pause */}
                    <Button
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      onClick={handlePlayPause}
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      {isPlaying ? (
                        <BsPauseFill className="text-white" size={24} />
                      ) : (
                        <BsPlayFill className="text-white" size={24} style={{ marginLeft: '2px' }} />
                      )}
                    </Button>

                    {/* Forward 10s */}
                    <Button
                      variant="link"
                      className="p-0 text-dark"
                      onClick={handleSeekForward}
                      title="10 saniye ileri"
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <BsSkipForward size={20} />
                    </Button>
                  </div>

                  {/* Time Display */}
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                    <span>{formatDuration(Math.floor(currentTime))}</span>
                    <span>/</span>
                    <span>{formatDuration(Math.floor(duration))}</span>
                  </div>
                </div>
              </Col>

              {/* Close Button */}
              <Col xs={12} md={4} lg={3} className="text-end">
                <Button
                  variant="link"
                  className="p-2 text-muted"
                  onClick={() => {
                    if (audioRef) {
                      audioRef.pause();
                    }
                    setCurrentlyPlaying(null);
                    setIsPlaying(false);
                  }}
                  title="Kapat"
                  style={{
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.color = '#dc3545';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.color = '';
                  }}
                >
                  <BsX size={28} />
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      )}


      {/* Header */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="bg-gradient text-white border-0" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Row className="align-items-center g-3">
            <Col xs={12} md={5}>
              <div className="d-flex align-items-center">
                <Link href="/feed/podcasts">
                  <Button
                    variant="light"
                    size="sm"
                    className="me-3"
                  >
                    <BsArrowLeft className="me-1" />
                    {t('podcasts.list.backToLanguages')}
                  </Button>
                </Link>
                <div>
                  <CardTitle className="mb-0 h4">
                    <BsMicFill className="me-2" />
                    {t(`books.languages.${languageName}`)} {t('podcasts.list.podcastsTitle')}
                  </CardTitle>
                  <small className="text-white-50">İslami içerikli sesli yayınlar</small>
                </div>
              </div>
            </Col>
            <Col xs={12} md={5}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder={t('podcasts.list.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white"
                  />
                  <Button variant="light" type="submit">
                    <BsSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col xs={12} md={2} className="text-end">
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'light' : 'outline-light'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  title={t('podcasts.list.gridView')}
                >
                  <BsGrid3X3Gap size={18} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'light' : 'outline-light'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  title={t('podcasts.list.listView')}
                >
                  <BsList size={22} />
                </Button>
              </div>
            </Col>
          </Row>
        </CardHeader>
      </Card>

      {/* Category Filter - Collapsible */}
      {categories.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <CardBody>
            <div
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              style={{ cursor: 'pointer' }}
              className="d-flex align-items-center justify-content-between mb-3"
            >
              <h6 className="mb-0">
                <BsFilter className="me-2" />
                {t('podcasts.list.filterByCategory')}
                {selectedCategory && (
                  <Badge bg="primary" className="ms-2">{selectedCategory}</Badge>
                )}
              </h6>
              <div className="text-primary">
                {showCategoryFilter ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
              </div>
            </div>

            <Collapse in={showCategoryFilter}>
              <div>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleCategoryChange('')}
                    className="mb-2"
                  >
                    {t('podcasts.list.allCategories')}
                  </Button>
                  {categories.map((category, index) => (
                    <Button
                      key={index}
                      variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleCategoryChange(category)}
                      className="mb-2"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </Collapse>
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardBody>
          <Row className="text-center">
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-primary">{pagination.totalCount}</h3>
                <small className="text-muted">{t('podcasts.list.totalPodcasts')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-success">{pagination.currentPage}</h3>
                <small className="text-muted">{t('podcasts.list.currentPage')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-info">{pagination.totalPages}</h3>
                <small className="text-muted">{t('podcasts.list.totalPages')}</small>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="p-3">
                <h3 className="mb-0 text-warning">{podcasts.length}</h3>
                <small className="text-muted">{t('podcasts.list.onThisPage')}</small>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">{t('podcasts.list.loadingPodcasts')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <Alert.Heading>{t('podcasts.list.error')}</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* No Results */}
      {!loading && !error && podcasts.length === 0 && (
        <Alert variant="info">
          <Alert.Heading>{t('podcasts.list.noPodcasts')}</Alert.Heading>
          <p>{activeSearch ? `"${activeSearch}" ${t('podcasts.list.noSearchResults')}` : t('podcasts.list.noLanguagePodcasts')}</p>
        </Alert>
      )}

      {/* Podcasts Grid/List */}
      {!loading && !error && podcasts.length > 0 && (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <Row className="g-4 mb-4">
              {podcasts.map((podcast) => (
                <Col key={podcast.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 shadow-sm border-0 podcast-card" style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <div className="position-relative" style={{ paddingTop: '100%', overflow: 'hidden' }}>
                      <Image
                        src={getCoverUrl(podcast.coverImage)}
                        alt={podcast.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-top"
                        onError={(e) => {
                          e.target.src = '/images/podcast-placeholder.jpg';
                        }}
                      />

                      {/* Featured Badge */}
                      {podcast.isFeatured && (
                        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                          <Badge bg="warning" className="d-flex align-items-center gap-1">
                            <BsStarFill size={10} /> Öne Çıkan
                          </Badge>
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0 hover-overlay" style={{
                        background: 'rgba(0,0,0,0.7)',
                        transition: 'opacity 0.3s ease'
                      }}>
                        <button
                          onClick={() => togglePlay(podcast)}
                          className="btn btn-lg rounded-circle"
                          style={{
                            width: '56px',
                            height: '56px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)',
                          }}
                        >
                          {currentlyPlaying?.id === podcast.id ? (
                            <BsPauseFill className="text-white" size={24} />
                          ) : (
                            <BsPlayFill className="text-white" size={24} style={{ marginLeft: '3px' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <Card.Body className="p-3">
                      <Card.Title className="text-center mb-2" style={{
                        fontSize: '0.95rem',
                        minHeight: '2.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {podcast.title}
                      </Card.Title>

                      {podcast.author && (
                        <p className="text-muted small text-center mb-2" style={{
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <BsMicFill size={12} className="me-1" />
                          {podcast.author}
                        </p>
                      )}

                      {podcast.category && (
                        <div className="text-center mb-2">
                          <Badge bg="primary" style={{ fontSize: '0.7rem' }}>
                            {podcast.category}
                          </Badge>
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                        <span className="d-flex align-items-center gap-1">
                          <BsClock size={12} />
                          {formatDuration(podcast.duration)}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <BsEye size={12} />
                          {podcast.listenCount || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(podcast);
                          }}
                          className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                        >
                          <BsHeart size={12} className="text-danger" />
                          <span className="text-muted">{podcast.likeCount || 0}</span>
                        </button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="mb-4">
              {podcasts.map((podcast) => (
                <Card key={podcast.id} className="mb-3 shadow-sm border-0 podcast-list-card" style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <Row className="g-0">
                    <Col xs={12} md={3} lg={2}>
                      <div className="position-relative" style={{ height: '100%', minHeight: '200px' }}>
                        <Image
                          src={getCoverUrl(podcast.coverImage)}
                          alt={podcast.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-start"
                          onError={(e) => {
                            e.target.src = '/images/podcast-placeholder.jpg';
                          }}
                        />
                        {podcast.isFeatured && (
                          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                            <Badge bg="warning" className="d-flex align-items-center gap-1">
                              <BsStarFill size={10} /> Öne Çıkan
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={12} md={9} lg={10}>
                      <Card.Body className="p-4">
                        <Row>
                          <Col xs={12} lg={8}>
                            <Card.Title className="mb-2 h5" style={{ color: '#667eea' }}>
                              {podcast.title}
                            </Card.Title>

                            {podcast.description && (
                              <p className="text-muted mb-3" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.6'
                              }}>
                                {podcast.description}
                              </p>
                            )}

                            <div className="d-flex flex-wrap gap-3 mb-3">
                              {podcast.author && (
                                <div className="d-flex align-items-center text-muted small">
                                  <BsMicFill className="me-1" />
                                  <strong>{t('podcasts.list.author')}:</strong>&nbsp;{podcast.author}
                                </div>
                              )}

                              {podcast.duration && (
                                <div className="d-flex align-items-center text-muted small">
                                  <BsClock className="me-1" />
                                  <strong>{t('podcasts.list.duration')}:</strong>&nbsp;{formatDuration(podcast.duration)}
                                </div>
                              )}

                              {podcast.category && (
                                <div className="d-flex align-items-center text-muted small">
                                  <BsFilter className="me-1" />
                                  <strong>{t('podcasts.list.category')}:</strong>&nbsp;
                                  <Badge bg="primary" className="ms-1">{podcast.category}</Badge>
                                </div>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-3 text-muted small">
                              <span className="d-flex align-items-center gap-1">
                                <BsEye size={14} />
                                {podcast.listenCount || 0} dinlenme
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <BsHeart size={14} className="text-danger" />
                                {podcast.likeCount || 0} beğeni
                              </span>
                            </div>
                          </Col>
                          <Col xs={12} lg={4} className="d-flex flex-column justify-content-between align-items-end">
                            <div className="mb-3">
                              {/* Boş alan */}
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => togglePlay(podcast)}
                              className="d-flex align-items-center gap-2"
                            >
                              {currentlyPlaying?.id === podcast.id ? (
                                <>
                                  <BsPauseFill size={18} />
                                  Duraklat
                                </>
                              ) : (
                                <>
                                  <BsPlayFill size={18} />
                                  {t('podcasts.list.playNow')}
                                </>
                              )}
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mb-4">
              <Pagination>
                <Pagination.First
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(1)}
                />
                <Pagination.Prev
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                />

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
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
                <Pagination.Last
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.totalPages)}
                />
              </Pagination>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center text-muted mb-4">
            <small>
              {t('podcasts.list.showing')}: {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, pagination.totalCount)} {t('podcasts.list.paginationInfo')} {pagination.totalCount} {t('podcasts.list.podcasts')}
            </small>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .podcast-card {
          transition: all 0.3s ease !important;
          animation: fadeIn 0.4s ease-out;
        }
        .podcast-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2) !important;
        }
        .podcast-card .hover-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .podcast-card:hover .hover-overlay {
          opacity: 1 !important;
        }
        .podcast-list-card {
          transition: all 0.3s ease !important;
          animation: fadeIn 0.4s ease-out;
        }
        .podcast-list-card:hover {
          transform: translateX(5px) !important;
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15) !important;
        }

        /* Dark Mode for Podcast Player */
        [data-bs-theme="dark"] .podcast-player-container {
          background: rgba(44, 48, 52, 0.95) !important;
          border-top: 1px solid rgba(102, 126, 234, 0.3) !important;
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5) !important;
        }
        
        [data-bs-theme="dark"] .podcast-player-container .text-dark {
          color: #dee2e6 !important;
        }
        
        [data-bs-theme="dark"] .podcast-player-container .text-muted {
          color: #adb5bd !important;
        }
      `}</style>
    </Col>
  );
}

