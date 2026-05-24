'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BsSearch, BsArrowLeft, BsXLg } from 'react-icons/bs';
import { useSearchContext } from '@/context/useSearchContext';
import { useLanguage } from '@/context/useLanguageContext';
import { usePathname } from 'next/navigation';
import SearchResults from '@/components/SearchResults';

const MobileSearchOverlay = ({ isOpen, onClose }) => {
  const { performSearch, clearSearch } = useSearchContext();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const prevPathRef = useRef(pathname);

  const handleClose = useCallback(() => {
    setQuery('');
    setHasSearched(false);
    clearSearch();
    onClose();
  }, [clearSearch, onClose]);

  const handleClearInput = useCallback(() => {
    setQuery('');
    setHasSearched(false);
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const doSearch = useCallback((value) => {
    if (value.trim()) {
      setHasSearched(true);
      performSearch(value);
    } else {
      setHasSearched(false);
      clearSearch();
    }
  }, [performSearch, clearSearch]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 300);
  }, [doSearch]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    doSearch(query);
  }, [query, doSearch]);

  // Close overlay on route change (user clicked a result link)
  useEffect(() => {
    if (isOpen && prevPathRef.current !== pathname) {
      handleClose();
    }
    prevPathRef.current = pathname;
  }, [pathname, isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayContent = (
    <div
      className="mobile-search-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1060,
        backgroundColor: 'var(--bs-body-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header: back arrow + search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderBottom: '1px solid var(--bs-border-color)',
          flexShrink: 0,
          minHeight: '56px',
        }}
      >
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bs-body-color)',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          aria-label={t('common.close')}
        >
          <BsArrowLeft size={22} />
        </button>

        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <BsSearch
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--bs-secondary-color)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            value={query}
            onChange={handleInputChange}
            placeholder={t('search.placeholder')}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 38px 10px 38px',
              borderRadius: '24px',
              fontSize: '15px',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearInput}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bs-secondary-color)',
                cursor: 'pointer',
              }}
              aria-label={t('common.close')}
            >
              <BsXLg size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Results area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {hasSearched ? (
          <SearchResults embedded />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--bs-secondary-color)',
              textAlign: 'center',
            }}
          >
            <BsSearch size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '15px', margin: 0 }}>
              {t('search.searchPlaceholder') || t('search.placeholder')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlayContent, document.body);
};

export default MobileSearchOverlay;
