'use client';

import { useState, useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import bookOpenIcon from '@/assets/images/icon/book-open-outline-filled.svg';
import Link from 'next/link';
import Image from 'next/image';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { useLanguage } from '@/context/useLanguageContext';
import { getPersonCoverUrl, getPersonAvatarUrl, truncateBio } from '@/utils/peopleCard';
import PeopleCoverCard from '@/components/cards/PeopleCoverCard';

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
  const itemsPerPage = 16;

  useEffect(() => {
    const fetchScholars = async () => {
      if (isSearching) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/scholars?page=${currentPage}&limit=${itemsPerPage}`,
          { method: 'GET', headers }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.scholars && Array.isArray(data.scholars)) {
            setScholars(data.scholars);
            setFilteredScholars(data.scholars);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
          }
        } else {
          setError(t('scholars.loadingScholars'));
        }
      } catch (err) {
        console.error('Error fetching scholars:', err);
        setError(t('scholars.loadingScholars'));
      } finally {
        setLoading(false);
      }
    };

    fetchScholars();
  }, [currentPage, isSearching, t]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setSearchLoading(true);

        try {
          const token = localStorage.getItem('token');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/scholars?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${itemsPerPage}`,
            { method: 'GET', headers }
          );

          if (response.ok) {
            const data = await response.json();
            setFilteredScholars(data.scholars || []);
            setTotalCount(data.totalCount || 0);
            setTotalPages(data.totalPages || 1);
          } else {
            setFilteredScholars([]);
          }
        } catch (err) {
          console.error('Error performing search:', err);
          setFilteredScholars([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    if (!isSearching && !searchQuery.trim()) {
      setFilteredScholars(scholars);
    }
  }, [scholars, isSearching, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
        <Button key="first" variant="outline-primary" size="sm" onClick={() => handlePageChange(1)}>1</Button>
      );
      if (startPage > 2) items.push(<span key="ellipsis1" className="text-muted px-1">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<span key="ellipsis2" className="text-muted px-1">...</span>);
      items.push(
        <Button key="last" variant="outline-primary" size="sm" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  const defaultAvatar = typeof avatar7 === 'string' ? avatar7 : (avatar7?.src || '/images/avatar/default.jpg');

  const handleAvatarError = (e) => {
    e.target.src = defaultAvatar;
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="feed-people-page feed-scholars-page">
          <div className="feed-people-loading">
            <Spinner animation="border" size="sm" variant="primary" />
            <p>{t('scholars.loadingScholars')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9 scholars-page">
      <div className="feed-people-page feed-scholars-page">
        <div className="feed-people-header">
          <div>
            <h5 className="feed-people-title">
              <Image src={bookOpenIcon} alt="" width={18} height={18} />
              {t('scholars.title')}
            </h5>
            <p className="feed-people-subtitle">
              {totalCount} {t('scholars.totalScholars') || t('scholars.title')}
            </p>
          </div>
          <span className="feed-people-brand">{t('scholars.brandLabel')}</span>
        </div>

        <div className="feed-people-toolbar">
          <div className="feed-people-search">
            {searchLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <BsSearch />
            )}
            <input
              type="text"
              placeholder={t('scholars.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {isSearching && (
          <p className="feed-scholars-search-hint">
            &quot;{searchQuery}&quot; — {totalCount} {t('whoToFollow.resultsFound')}
          </p>
        )}

        {error && (
          <Alert variant="danger" className="mx-3 mt-2 mb-0 py-2 small">
            {error}
          </Alert>
        )}

        {filteredScholars.length === 0 ? (
          <div className="feed-people-empty">
            <Image src={bookOpenIcon} alt="" width={32} height={32} className="opacity-50 mb-2" />
            <h6>{t('scholars.noScholarsFound')}</h6>
            <p>{searchQuery ? t('scholars.noScholarsDescription') : t('scholars.noScholarsFound')}</p>
          </div>
        ) : (
          <>
            <div className="feed-scholars-grid">
              {filteredScholars.map((scholar) => {
                const bio = truncateBio(scholar.biography);
                const profileHref = scholar.id ? `/profile/scholar/${scholar.id}` : null;

                return (
                  <PeopleCoverCard
                    key={scholar.id}
                    coverUrl={getPersonCoverUrl(scholar)}
                    avatarUrl={getPersonAvatarUrl(scholar.photoUrl, defaultAvatar)}
                    name={scholar.fullName || t('scholars.title')}
                    bio={bio || undefined}
                    profileHref={profileHref}
                    onAvatarError={handleAvatarError}
                    footer={profileHref ? (
                      <Link href={profileHref} className="feed-scholar-btn">
                        {t('scholars.viewProfile')}
                      </Link>
                    ) : null}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="feed-people-pagination">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t('pagination.previous')}
                </Button>
                {generatePaginationItems()}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScholarsPage;
