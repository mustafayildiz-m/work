'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Card, Row, Col, Form, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsCalendarDate, BsPlayFill, BsEye, BsHeart, BsGlobe2, BsGrid3X3Gap, BsList, BsShare, BsNewspaper, BsWhatsapp, BsSearch, BsXCircleFill } from 'react-icons/bs';
import { useScholarStories } from '@/hooks/useScholarStories';
import NewsImage from './NewsImage';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import { toast } from 'react-toastify';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import './IslamicNews.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getThumbnailUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

/* ═══════════════════════════════════════════════
   Story Card (Instagram-style 9:16 portrait)
   ═══════════════════════════════════════════════ */
const StoryCard = ({ story, languages = [], onShareToFeed }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { id, title, thumbnail_url, video_url, duration, view_count, like_count, scholar, language, is_featured } = story;

  const langLabel = (code) => {
    const l = languages.find((x) => x.code === code);
    return l ? l.name : code;
  };

  const thumb = getThumbnailUrl(thumbnail_url) || '/images/book-placeholder.jpg';
  const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';

  return (
    <div className="position-relative" style={{ overflow: 'visible' }}>
      <Link href={`/blogs/story/${id}`} className="text-decoration-none">
        <div className="story-card">
          <NewsImage
            src={thumb}
            alt={title}
            width={400}
            height={620}
            className="story-card__image"
            style={{ objectFit: 'cover' }}
          />

          <div className="story-card__gradient" />

          {video_url && (
            <div className="story-card__play">
              <BsPlayFill size={26} />
            </div>
          )}

          <div className="story-card__top">
            <span className="story-card__lang-badge">{langLabel(language)}</span>
            {is_featured && <span className="story-card__featured-badge">⭐ Öne Çıkan</span>}
          </div>

          {duration && <span className="story-card__duration">{formatDuration(duration)}</span>}

          <div className="story-card__bottom">
            {scholar && (
              <div className="story-card__scholar">
                {scholar.profileImage && (
                  <img
                    src={scholar.profileImage.startsWith('http') ? scholar.profileImage : `${API_BASE_URL}${scholar.profileImage}`}
                    alt={scholar.fullName}
                    className="story-card__scholar-avatar"
                  />
                )}
                <span className="story-card__scholar-name">{scholar.fullName}</span>
              </div>
            )}
            <h6 className="story-card__title">{title}</h6>
            <div className="story-card__stats">
              <span className="story-card__stat"><BsEye size={11} /> {view_count || 0}</span>
              <span className="story-card__stat"><BsHeart size={10} /> {like_count || 0}</span>
            </div>
          </div>
        </div>
      </Link>

      {onShareToFeed && (
        <div className="story-card__share" onClick={(e) => e.stopPropagation()}>
          <Dropdown show={shareOpen} onToggle={(open) => setShareOpen(open)}>
            <DropdownToggle as="button" className="story-card__share-btn dropdown-toggle-no-caret">
              <BsShare size={13} />
            </DropdownToggle>
            <DropdownMenu align="end" className="shadow-lg border-0" style={{ borderRadius: '12px', minWidth: '200px' }}>
              <DropdownItem as="button" onClick={() => { if (storyUrl) { navigator.clipboard.writeText(storyUrl); toast.success('Link kopyalandı'); } setShareOpen(false); }}>
                <BsShare size={14} className="me-2" /> Link Kopyala
              </DropdownItem>
              <DropdownItem as="button" onClick={() => { if (storyUrl) window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${storyUrl}`)}`, '_blank'); setShareOpen(false); }}>
                <BsWhatsapp size={14} className="me-2 text-success" /> WhatsApp&apos;ta Paylaş
              </DropdownItem>
              <DropdownItem as="button" onClick={(e) => { e.preventDefault(); setShareOpen(false); onShareToFeed(story); }}>
                <BsNewspaper size={14} className="me-2 text-primary" /> Haber Akışında Paylaş
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
const ScholarStories = () => {
  const { t } = useLanguage();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [openShareDropdownId, setOpenShareDropdownId] = useState(null);

  const handleShareToFeed = async (story) => {
    if (!story?.id) { toast.error('Hikaye bilgisi bulunamadı'); return; }
    const toastId = toast.loading('Paylaşılıyor...');
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.update(toastId, { render: 'Giriş yapmalısınız', type: 'error', isLoading: false, autoClose: 3000 }); return; }
      let userId;
      try { const payload = JSON.parse(atob(token.split('.')[1])); userId = payload.id || payload.userId || payload.sub; }
      catch { const ud = localStorage.getItem('user'); if (ud) try { userId = JSON.parse(ud).id; } catch {} }
      if (!userId) { toast.update(toastId, { render: 'Kullanıcı bilgisi bulunamadı', type: 'error', isLoading: false, autoClose: 3000 }); return; }

      const formData = new FormData();
      formData.append('user_id', String(userId));
      formData.append('type', 'shared_story');
      formData.append('title', '');
      formData.append('content', `${story.title || 'Hikaye'} hikayesini paylaştı`);
      formData.append('shared_story_id', String(story.id));

      const res = await fetch(`${API_BASE_URL}/user-posts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.ok) {
        toast.update(toastId, { render: 'Hikaye haber akışında paylaşıldı', type: 'success', isLoading: false, autoClose: 3000 });
        window.dispatchEvent(new CustomEvent('timelineRefreshRequested'));
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.update(toastId, { render: errData?.message || 'Paylaşım başarısız', type: 'error', isLoading: false, autoClose: 4000 });
      }
    } catch (err) {
      toast.update(toastId, { render: err?.message || 'Bir hata oluştu', type: 'error', isLoading: false, autoClose: 4000 });
    }
  };

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    try { if (typeof window !== 'undefined') { const s = localStorage.getItem('blogsViewMode'); if (s === 'grid' || s === 'list') return s; } } catch {}
    return 'grid';
  });

  const { stories, loading, error, pagination, searchQuery, selectedLanguage, searchStories, goToPage, refetch, clearSearch, changeLanguage } = useScholarStories();

  useEffect(() => {
    if (typeof window !== 'undefined') try { localStorage.setItem('blogsViewMode', viewMode); } catch {}
  }, [viewMode]);

  useEffect(() => {
    const trimmed = localSearchQuery.trim();
    const timer = setTimeout(() => {
      if (trimmed) searchStories(trimmed);
      else if (searchQuery) clearSearch();
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearchQuery, searchStories, clearSearch]);

  useEffect(() => {
    const CACHE_KEY = 'languages-cache';
    const CACHE_TTL = 10 * 60 * 1000;
    const getCached = () => { try { const r = sessionStorage.getItem(CACHE_KEY); if (!r) return null; const { data, ts } = JSON.parse(r); return Date.now() - ts > CACHE_TTL ? null : data; } catch { return null; } };
    const setCached = (data) => { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {} };

    const fetchLangs = async () => {
      const cached = getCached();
      if (cached) { setLanguages(cached); setLanguagesLoading(false); } else setLanguagesLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/languages`, { headers });
        if (res.ok) {
          const data = await res.json();
          const sorted = (data || []).filter((l) => l.isActive !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setCached(sorted);
          setLanguages(sorted);
        }
      } catch { if (!cached) setLanguages([]); }
      finally { setLanguagesLoading(false); }
    };
    fetchLangs();
  }, []);

  const selectOptions = useMemo(() => {
    const all = { value: 'all', label: t('blogs.allLanguages'), flagUrl: null, flagEmoji: '🌍' };
    return [all, ...languages.map((l) => ({ value: l.code, label: l.name, flagUrl: l.flagUrl, flagEmoji: getFlagEmojiFallback(l.code) }))];
  }, [languages, t]);

  const selectedOption = useMemo(() => {
    if (!selectedLanguage || selectedLanguage === 'all') return selectOptions[0];
    return selectOptions.find((o) => o.value === selectedLanguage) || selectOptions[0];
  }, [selectedLanguage, selectOptions]);

  const formatOptionLabel = (opt) => (
    <span className="d-flex align-items-center gap-2">
      {opt.flagUrl ? <img src={getFlagImageUrl(opt.flagUrl, API_BASE_URL)} alt="" className="language-flag-icon" /> : <span className="language-flag-emoji">{opt.flagEmoji}</span>}
      {opt.label}
    </span>
  );

  const featuredStories = useMemo(() => stories.filter((s) => s.is_featured), [stories]);

  const handleSearch = (e) => { e.preventDefault(); localSearchQuery.trim() ? searchStories(localSearchQuery.trim()) : clearSearch(); };
  const handleClearSearch = () => { setLocalSearchQuery(''); clearSearch(); };
  const handlePageChange = (p) => { goToPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const genPaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);

    items.push(<li key="prev" className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>‹</button></li>);
    if (start > 1) { items.push(<li key={1} className="page-item"><button className="page-link" onClick={() => handlePageChange(1)}>1</button></li>); if (start > 2) items.push(<li key="e1" className="page-item disabled"><span className="page-link">…</span></li>); }
    for (let i = start; i <= end; i++) items.push(<li key={i} className={`page-item ${i === page ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(i)}>{i}</button></li>);
    if (end < totalPages) { if (end < totalPages - 1) items.push(<li key="e2" className="page-item disabled"><span className="page-link">…</span></li>); items.push(<li key={totalPages} className="page-item"><button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button></li>); }
    items.push(<li key="next" className={`page-item ${page === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>›</button></li>);
    return items;
  };

  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>{t('common.error')}!</Alert.Heading>
        <p>{t('blogs.errorLoading')}: {error}</p>
        <Button variant="outline-danger" onClick={refetch}>{t('blogs.retry')}</Button>
      </Alert>
    );
  }

  return (
    <div className="bg-mode p-2 p-sm-3 p-md-4">
      {/* ── Featured Stories Ring ── */}
      {featuredStories.length > 0 && !searchQuery && (
        <div className="stories-ring-bar">
          {featuredStories.map((s) => (
            <Link key={s.id} href={`/blogs/story/${s.id}`} className="story-ring-item">
              <div className="story-ring-avatar">
                <img
                  src={getThumbnailUrl(s.thumbnail_url) || '/images/book-placeholder.jpg'}
                  alt={s.title}
                />
              </div>
              <span className="story-ring-name">{s.scholar?.fullName || s.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <div className="stories-header">
        <h1 className="stories-header__title">
          {t('blogs.title')}
          <span className="stories-header__badge">{pagination.total}</span>
        </h1>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group">
            <Button variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('grid')} title={t('blogs.gridView')}><BsGrid3X3Gap size={16} /></Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('list')} title={t('blogs.listView')}><BsList size={20} /></Button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Form onSubmit={handleSearch} className="stories-filter-bar">
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
            control: (base) => ({ ...base, minHeight: 38, borderColor: 'var(--bs-border-color)' }),
            menu: (base) => ({ ...base, zIndex: 1060, borderRadius: '12px' }),
          }}
        />
        <div className="position-relative" style={{ flex: 1, minWidth: 160 }}>
          <Form.Control
            type="text"
            className="stories-search-input"
            placeholder={t('blogs.searchPlaceholder')}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="position-absolute border-0 bg-transparent text-muted"
              style={{ right: 12, top: '50%', transform: 'translateY(-50%)' }}
            >
              <BsXCircleFill size={16} />
            </button>
          )}
        </div>
      </Form>

      {/* ── Loading ── */}
      {loading && stories.length === 0 && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{t('common.loading')}</p>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' ? (
        <div className="stories-grid">
          {stories.length > 0 ? (
            stories.map((story) => <StoryCard key={story.id} story={story} languages={languages} onShareToFeed={handleShareToFeed} />)
          ) : (
            !loading && (
              <div className="text-center py-5" style={{ gridColumn: '1 / -1' }}>
                {searchQuery ? (
                  <>
                    <h5 className="text-muted mb-3">&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                    <Button variant="outline-primary" onClick={handleClearSearch}>{t('blogs.showAll')}</Button>
                  </>
                ) : (
                  <h5 className="text-muted">{t('blogs.noStories')}</h5>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        /* ── List View ── */
        <div className="blogs-list-view">
          {stories.length > 0 ? (
            stories.map((story) => {
              const { id, title, description, thumbnail_url, video_url, duration, view_count, like_count, scholar, created_at, language, is_featured } = story;
              const langLabel = (code) => { const l = languages.find((x) => x.code === code); return l ? l.name : code; };
              const thumb = getThumbnailUrl(thumbnail_url) || '/images/book-placeholder.jpg';
              const listStoryUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';

              return (
                <div key={id} className="position-relative mb-2 mb-md-3" style={{ overflow: 'visible' }}>
                  <Link href={`/blogs/story/${id}`} className="text-decoration-none">
                    <Card className="stories-list-card shadow-sm border-0">
                      <Row className="g-0">
                        <Col xs={4} md={3}>
                          <div className="stories-list-thumb">
                            <NewsImage src={thumb} alt={title} width={300} height={200} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                            {video_url && (
                              <div className="position-absolute top-50 start-50 translate-middle">
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <BsPlayFill size={20} className="text-white" />
                                </div>
                              </div>
                            )}
                            {is_featured && (
                              <span className="position-absolute top-0 end-0 m-1 badge" style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)', color: '#1a1a2e', fontSize: '0.6rem' }}>⭐</span>
                            )}
                          </div>
                        </Col>
                        <Col xs={8} md={9}>
                          <Card.Body className="p-2 p-md-3">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="mb-0 text-reset fw-semibold" style={{ fontSize: '0.9rem' }}>{title}</h6>
                              <span className="story-card__lang-badge ms-2 flex-shrink-0">{langLabel(language)}</span>
                            </div>
                            {scholar && <p className="text-primary small mb-1 fw-medium" style={{ fontSize: '0.78rem' }}>{scholar.fullName}</p>}
                            {description && (
                              <p className="text-muted mb-2" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{description}</p>
                            )}
                            <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.72rem' }}>
                              <small className="text-muted d-flex align-items-center gap-1"><BsCalendarDate size={11} /> {formatDate(created_at)}</small>
                              {duration && <><span className="text-muted">•</span><small className="text-muted">{formatDuration(duration)}</small></>}
                              <span className="text-muted">•</span>
                              <small className="text-muted d-flex align-items-center gap-1"><BsEye size={11} /> {view_count || 0}</small>
                              <small className="text-muted d-flex align-items-center gap-1"><BsHeart size={10} /> {like_count || 0}</small>
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  </Link>
                  <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 20 }} onClick={(e) => e.stopPropagation()}>
                    <Dropdown show={openShareDropdownId === id} onToggle={(open) => setOpenShareDropdownId(open ? id : null)}>
                      <DropdownToggle variant="outline-secondary" size="sm" className="d-flex align-items-center dropdown-toggle-no-caret" style={{ borderRadius: '50%', width: 30, height: 30, padding: 0, justifyContent: 'center' }}>
                        <BsShare size={12} />
                      </DropdownToggle>
                      <DropdownMenu align="end" className="shadow-lg border-0" style={{ borderRadius: '12px' }}>
                        <DropdownItem as="button" onClick={() => { if (listStoryUrl) { navigator.clipboard.writeText(listStoryUrl); toast.success('Link kopyalandı'); } setOpenShareDropdownId(null); }}>
                          <BsShare size={14} className="me-2" /> Link Kopyala
                        </DropdownItem>
                        <DropdownItem as="button" onClick={() => { if (listStoryUrl) window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${listStoryUrl}`)}`, '_blank'); setOpenShareDropdownId(null); }}>
                          <BsWhatsapp size={14} className="me-2 text-success" /> WhatsApp&apos;ta Paylaş
                        </DropdownItem>
                        <DropdownItem as="button" onClick={(e) => { e.preventDefault(); setOpenShareDropdownId(null); handleShareToFeed(story); }}>
                          <BsNewspaper size={14} className="me-2 text-primary" /> Haber Akışında Paylaş
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              );
            })
          ) : (
            !loading && (
              <div className="text-center py-5">
                {searchQuery ? (
                  <>
                    <h5 className="text-muted mb-3">&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                    <Button variant="outline-primary" onClick={handleClearSearch}>{t('blogs.showAll')}</Button>
                  </>
                ) : (
                  <h5 className="text-muted">{t('blogs.noStories')}</h5>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {stories.length > 0 && pagination.totalPages > 1 && (
        <nav className="mt-3">
          <ul className="stories-pagination">{genPaginationItems()}</ul>
        </nav>
      )}

      {stories.length > 0 && (
        <div className="text-center mt-2 mb-3">
          <small className="text-muted">
            {searchQuery
              ? `"${searchQuery}" ${t('blogs.searchResults')} ${stories.length} ${t('blogs.storiesFound')}`
              : `${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} / ${pagination.total} ${t('blogs.storiesCount')}`}
          </small>
        </div>
      )}
    </div>
  );
};

export default ScholarStories;
