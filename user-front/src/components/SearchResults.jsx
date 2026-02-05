'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchContext } from '@/context/useSearchContext';
import { useLanguage } from '@/context/useLanguageContext';
import Link from 'next/link';
import Image from 'next/image';

// Tab configuration
const TABS = [
  { id: 'all', labelKey: 'search.all' },
  { id: 'users', labelKey: 'search.users' },
  { id: 'scholars', labelKey: 'search.scholars' },
  { id: 'followers', labelKey: 'search.followers' }
];

// Safe Image Component
const SafeImage = ({ src, alt, width, height, isScholar, isFollower }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    setImgSrc('/profile/profile.png');
  };

  const borderColor = isScholar ? '#198754' : (isFollower ? '#0dcaf0' : 'rgba(0,0,0,0.1)');

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: '50%',
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
      flexShrink: 0,
      backgroundColor: '#f8f9fa'
    }}>
      <Image
        src={imgSrc && imgSrc !== 'null' && imgSrc !== 'undefined' ? imgSrc : '/profile/profile.png'}
        alt={alt}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={handleError}
        unoptimized={true}
      />
    </div>
  );
};

const SearchResults = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    showResults,
    clearSearch,
    performSearch
  } = useSearchContext();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const resultsRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile form submit
  const handleMobileSubmit = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('mobileSearch') || '';
    if (query.trim() && performSearch) {
      performSearch(query);
    }
  }, [performSearch]);

  // Handle mobile input change
  const handleMobileInputChange = useCallback((e) => {
    const query = e.target.value;
    if (query.trim() && performSearch) {
      performSearch(query);
    } else if (!query.trim()) {
      clearSearch();
    }
  }, [performSearch, clearSearch]);

  // Close on outside click
  useEffect(() => {
    if (!showResults) return;
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        clearSearch();
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        clearSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showResults, clearSearch]);

  const totalResults = useMemo(() =>
    searchResults.users.length +
    searchResults.scholars.length +
    searchResults.followers.length,
    [searchResults]
  );

  const getTabCount = useCallback((tabId) => {
    switch (tabId) {
      case 'users': return searchResults.users.length;
      case 'scholars': return searchResults.scholars.length;
      case 'followers': return searchResults.followers.length;
      default: return totalResults;
    }
  }, [searchResults, totalResults]);

  // Common Layout Styles
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: '#212529', // Bootstrap dark text
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s'
  };

  const nameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const usernameStyle = {
    fontSize: '13px',
    color: '#6c757d'
  };

  // Render Functions
  const renderUserItem = useCallback((user) => (
    user.id && user.id !== 'undefined' ? (
      <Link
        key={user.id}
        href={`/profile/user/${user.id}`}
        style={linkStyle}
        onClick={clearSearch}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <SafeImage src={user.profilePicture} alt={user.name} width={40} height={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...nameStyle, marginBottom: 0 }}>{user.name}</div>
        </div>
      </Link>
    ) : null
  ), [clearSearch]);

  const renderScholarItem = useCallback((scholar) => (
    scholar.id && scholar.id !== 'undefined' ? (
      <Link
        key={scholar.id}
        href={`/profile/scholar/${scholar.id}`}
        style={linkStyle}
        onClick={clearSearch}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <SafeImage src={scholar.profilePicture} alt={scholar.name} width={40} height={40} isScholar={true} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...nameStyle, marginBottom: 0 }}>
            {scholar.name}
            <span style={{
              backgroundColor: '#198754',
              color: 'white',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: '600'
            }}>Alim</span>
          </div>
        </div>
      </Link>
    ) : null
  ), [clearSearch]);

  const renderFollowerItem = useCallback((follower) => (
    follower.id && follower.id !== 'undefined' ? (
      <Link
        key={follower.id}
        href={`/profile/user/${follower.id}`}
        style={linkStyle}
        onClick={clearSearch}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <SafeImage src={follower.profilePicture} alt={follower.name} width={40} height={40} isFollower={true} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...nameStyle, marginBottom: 0 }}>
            {follower.name}
            <span style={{
              backgroundColor: '#0dcaf0',
              color: 'white',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: '600'
            }}>Takipçi</span>
          </div>
        </div>
      </Link>
    ) : null
  ), [clearSearch]);

  if (!showResults) return null;

  return (
    <>
      {isMobile && <div className="sr-overlay" onClick={clearSearch} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1049 }} />}

      <div
        ref={resultsRef}
        className={isMobile ? 'position-fixed' : 'position-absolute'}
        style={{
          ...(isMobile ? {
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1050,
            backgroundColor: 'var(--bs-body-bg)'
          } : {
            top: 'calc(100% + 10px)',
            left: 0,
            width: '550px',
            maxHeight: '500px',
            zIndex: 1050,
            backgroundColor: 'var(--bs-body-bg)',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }),
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', padding: '8px' }}>←</button>
            <input type="text" value={searchQuery} onChange={handleMobileInputChange} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {isSearching ? 'Aranıyor...' : `${totalResults} sonuç`}
          </div>
          {!isMobile && (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666' }}>✕</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#0d6efd' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'inherit',
                border: '1px solid rgba(0,0,0,0.1)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {t(tab.labelKey)}
              {tab.id !== 'all' && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px'
                }}>
                  {getTabCount(tab.id)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '10px' }}>
          {activeTab === 'all' && (
            <>
              {searchResults.users.length > 0 && (
                <div>
                  <div style={{ padding: '12px 20px 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '0.5px' }}>Kullanıcılar</div>
                  {searchResults.users.slice(0, 3).map(renderUserItem)}
                </div>
              )}
              {searchResults.scholars.length > 0 && (
                <div>
                  <div style={{ padding: '12px 20px 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '0.5px' }}>Alimler</div>
                  {searchResults.scholars.slice(0, 3).map(renderScholarItem)}
                </div>
              )}
              {searchResults.followers.length > 0 && (
                <div>
                  <div style={{ padding: '12px 20px 4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '0.5px' }}>Takipçiler</div>
                  {searchResults.followers.slice(0, 3).map(renderFollowerItem)}
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && searchResults.users.map(renderUserItem)}
          {activeTab === 'scholars' && searchResults.scholars.map(renderScholarItem)}
          {activeTab === 'followers' && searchResults.followers.map(renderFollowerItem)}

          {totalResults === 0 && !isSearching && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>{t('search.noResults')}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResults;