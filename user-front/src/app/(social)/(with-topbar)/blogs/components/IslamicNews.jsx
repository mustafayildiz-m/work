'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Form, Button, Spinner, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import { BsCalendarDate, BsPlayFill, BsEye, BsHeart, BsGrid3X3Gap, BsList, BsShare, BsNewspaper, BsWhatsapp, BsXCircleFill, BsInstagram, BsYoutube } from 'react-icons/bs';
import { useScholarStories } from '@/hooks/useScholarStories';
import StoryThumbnail from './StoryThumbnail';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';
import { toast } from 'react-toastify';
import { getFlagImageUrl, getFlagEmojiFallback } from '@/utils/language';
import { isInstagramUrl, isYouTubeUrl } from '@/utils/videoThumbnail';
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

const StoryCard = ({ story, languages = [], onShareToFeed }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { id, title, video_url, duration, view_count, like_count, scholar, language, is_featured } = story;

  const langLabel = (code) => {
    const l = languages.find((x) => x.code === code);
    return l ? l.name : code;
  };

  const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';
  const platform = isInstagramUrl(video_url) ? 'instagram' : isYouTubeUrl(video_url) ? 'youtube' : 'video';

  return (
    <div className="story-card-wrap">
      <Link href={`/blogs/story/${id}`} className="text-decoration-none">
        <article className={`story-card ${is_featured ? 'story-card--featured' : ''} story-card--${platform}`}>
          <StoryThumbnail story={story} alt={title} className="story-card__image" />

          <div className="story-card__gradient" />

          {video_url && (
            <div className="story-card__play">
              <BsPlayFill size={24} />
            </div>
          )}

          <div className="story-card__top">
            <span className="story-card__platform">
              {platform === 'instagram' ? <BsInstagram size={12} /> : platform === 'youtube' ? <BsYoutube size={12} /> : null}
              {langLabel(language)}
            </span>
            {is_featured && <span className="story-card__featured-badge">⭐ Öne Çıkan</span>}
          </div>

          {duration ? <span className="story-card__duration">{formatDuration(duration)}</span> : null}

          <div className="story-card__bottom">
            {scholar && (
              <div className="story-card__scholar">
                {scholar.photoUrl && (
                  <img
                    src={scholar.photoUrl.startsWith('http') ? scholar.photoUrl : `${API_BASE_URL}${scholar.photoUrl}`}
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
        </article>
      </Link>

      {onShareToFeed && (
        <div className="story-card__share" onClick={(e) => e.stopPropagation()}>
          <Dropdown show={shareOpen} onToggle={setShareOpen}>
            <DropdownToggle as="button" className="story-card__share-btn dropdown-toggle-no-caret">
              <BsShare size={13} />
            </DropdownToggle>
            <DropdownMenu align="end" className="story-share-menu shadow-lg border-0">
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
    <div className="blogs-stories-page">
      {featuredStories.length > 0 && !searchQuery && (
        <div className="stories-ring-section">
          <div className="stories-ring-label">Öne Çıkan Hikayeler</div>
          <div className="stories-ring-bar">
            {featuredStories.map((s) => (
              <Link key={s.id} href={`/blogs/story/${s.id}`} className="story-ring-item">
                <div className="story-ring-avatar">
                  <StoryThumbnail story={s} alt={s.title} className="story-ring-avatar__img" />
                </div>
                <span className="story-ring-name">{s.scholar?.fullName || s.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="stories-header">
        <div>
          <h1 className="stories-header__title">{t('blogs.title')}</h1>
          <p className="stories-header__subtitle">Instagram tarzı dikey hikayeler ve kısa videolar</p>
        </div>
        <div className="stories-header__actions">
          <span className="stories-header__badge">{pagination.total} hikaye</span>
          <div className="btn-group stories-view-toggle" role="group">
            <Button variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('grid')} title={t('blogs.gridView')}><BsGrid3X3Gap size={16} /></Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('list')} title={t('blogs.listView')}><BsList size={20} /></Button>
          </div>
        </div>
      </div>

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
            control: (base) => ({ ...base, minHeight: 42, borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff' }),
            singleValue: (base) => ({ ...base, color: '#fff' }),
            menu: (base) => ({ ...base, zIndex: 1060, borderRadius: '14px' }),
          }}
        />
        <div className="stories-search-wrap">
          <Form.Control
            type="text"
            className="stories-search-input"
            placeholder={t('blogs.searchPlaceholder')}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <button type="button" onClick={handleClearSearch} className="stories-search-clear">
              <BsXCircleFill size={16} />
            </button>
          )}
        </div>
      </Form>

      {loading && stories.length === 0 && (
        <div className="stories-loading">
          <Spinner animation="border" variant="light" />
          <p>{t('common.loading')}</p>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="stories-grid">
          {stories.length > 0 ? (
            stories.map((story) => <StoryCard key={story.id} story={story} languages={languages} onShareToFeed={handleShareToFeed} />)
          ) : (
            !loading && (
              <div className="stories-empty">
                {searchQuery ? (
                  <>
                    <h5>&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                    <Button variant="outline-light" onClick={handleClearSearch}>{t('blogs.showAll')}</Button>
                  </>
                ) : (
                  <h5>{t('blogs.noStories')}</h5>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <div className="blogs-list-view">
          {stories.length > 0 ? (
            stories.map((story) => {
              const { id, title, description, video_url, duration, view_count, like_count, scholar, created_at, language, is_featured } = story;
              const langLabel = (code) => { const l = languages.find((x) => x.code === code); return l ? l.name : code; };
              const listStoryUrl = typeof window !== 'undefined' ? `${window.location.origin}/blogs/story/${id}` : '';
              const platform = isInstagramUrl(video_url) ? 'instagram' : isYouTubeUrl(video_url) ? 'youtube' : 'video';

              return (
                <div key={id} className="stories-list-item">
                  <Link href={`/blogs/story/${id}`} className="text-decoration-none">
                    <article className={`stories-list-card stories-list-card--${platform}`}>
                      <div className="stories-list-thumb">
                        <StoryThumbnail story={story} alt={title} className="stories-list-thumb__img" />
                        {video_url && (
                          <div className="stories-list-thumb__play">
                            <BsPlayFill size={18} className="text-white" />
                          </div>
                        )}
                        {is_featured && <span className="stories-list-thumb__featured">⭐</span>}
                      </div>
                      <div className="stories-list-body">
                        <div className="stories-list-body__top">
                          <h6>{title}</h6>
                          <span className="story-card__platform">{langLabel(language)}</span>
                        </div>
                        {scholar && <p className="stories-list-scholar">{scholar.fullName}</p>}
                        {description && <p className="stories-list-desc">{description}</p>}
                        <div className="stories-list-meta">
                          <span><BsCalendarDate size={11} /> {formatDate(created_at)}</span>
                          {duration && <span>{formatDuration(duration)}</span>}
                          <span><BsEye size={11} /> {view_count || 0}</span>
                          <span><BsHeart size={10} /> {like_count || 0}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                  <div className="stories-list-share" onClick={(e) => e.stopPropagation()}>
                    <Dropdown show={openShareDropdownId === id} onToggle={(open) => setOpenShareDropdownId(open ? id : null)}>
                      <DropdownToggle as="button" className="story-card__share-btn dropdown-toggle-no-caret">
                        <BsShare size={12} />
                      </DropdownToggle>
                      <DropdownMenu align="end" className="story-share-menu shadow-lg border-0">
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
              <div className="stories-empty">
                {searchQuery ? (
                  <>
                    <h5>&ldquo;{searchQuery}&rdquo; {t('blogs.noResults')}</h5>
                    <Button variant="outline-light" onClick={handleClearSearch}>{t('blogs.showAll')}</Button>
                  </>
                ) : (
                  <h5>{t('blogs.noStories')}</h5>
                )}
              </div>
            )
          )}
        </div>
      )}

      {stories.length > 0 && pagination.totalPages > 1 && (
        <nav className="mt-2">
          <ul className="stories-pagination">{genPaginationItems()}</ul>
        </nav>
      )}

      {stories.length > 0 && (
        <div className="stories-footer-meta">
          <small>
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
