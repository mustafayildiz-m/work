'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardBody, Form, ListGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsGlobe, BsChevronRight, BsXLg, BsInboxes } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import {
  getQaLanguageLabels,
  isSystemUiLanguage,
  UI_LOCALE_CODES,
  resolveUiLocaleFromQaLanguage,
} from '@/utils/uiLanguageDisplay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 300;

export default function LanguagePicker({ suggested, onSelect, embedded = false }) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [allLanguages, setAllLanguages] = useState([]);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (q.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `${API_URL}/languages/qa/search?q=${encodeURIComponent(q)}&limit=10`,
        { headers: { 'Accept-Language': locale } },
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [locale]);

  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setQuery(val);
      setShowAll(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(val), DEBOUNCE_MS);
    },
    [search],
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery('');
    setResults([]);
  }, []);

  const handleShowAll = useCallback(async () => {
    if (allLanguages.length > 0) {
      setShowAll(true);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/languages/qa/grouped`, {
        headers: { 'Accept-Language': locale },
      });
      if (res.ok) {
        const data = await res.json();
        setAllLanguages(data);
        setShowAll(true);
      }
    } catch {
      // fail silently
    }
  }, [allLanguages.length, locale]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const popularSystemLanguages = useMemo(() => {
    const list = (suggested?.popular ?? []).filter(isSystemUiLanguage);
    return list.sort((a, b) => {
      const ia = UI_LOCALE_CODES.indexOf(resolveUiLocaleFromQaLanguage(a));
      const ib = UI_LOCALE_CODES.indexOf(resolveUiLocaleFromQaLanguage(b));
      return ia - ib;
    });
  }, [suggested?.popular]);

  const renderLanguageItem = (lang, { nested = false } = {}) => {
    const slug = lang.iso639_3 || lang.code || String(lang.id);
    const { primary, secondary, showSecondary } = getQaLanguageLabels(lang, t);

    return (
      <ListGroup.Item
        key={lang.id || slug}
        action
        onClick={() => onSelect({ ...lang, iso639_3: slug })}
        className={`questions-lang-item d-flex align-items-center gap-3${nested ? ' questions-lang-item--nested' : ''}`}
        data-testid={`lang-item-${slug}`}
        dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'}
      >
        {lang.flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lang.flagUrl} alt="" aria-hidden="true" className="questions-lang-flag" />
        ) : (
          <span className="questions-lang-flag d-grid place-items-center" aria-hidden="true" />
        )}

        <span className="flex-grow-1 min-w-0">
          <span
            className={`questions-lang-native d-block text-truncate ${nested ? '' : 'fs-6'}`}
          >
            {primary}
          </span>
          {showSecondary && (
            <small className="questions-lang-english d-block text-truncate">{secondary}</small>
          )}
        </span>

        {lang.questionCount > 0 && (
          <Badge className="questions-lang-badge">{lang.questionCount.toLocaleString()}</Badge>
        )}
        <BsChevronRight size={12} className="questions-lang-chevron" aria-hidden="true" />
      </ListGroup.Item>
    );
  };

  const content = (
    <>
      <div className="questions-search">
        <BsSearch size={16} className="questions-search__icon" aria-hidden="true" />
        <Form.Control
          type="text"
          placeholder={t('qa.languageSearchPlaceholder')}
          value={query}
          onChange={handleInputChange}
          className="questions-search__input"
          data-testid="language-search-input"
          aria-label={t('qa.languageSearchAria')}
        />
        {query && (
          <button
            type="button"
            className="questions-search__clear"
            onClick={handleClear}
            aria-label={t('qa.clear') || 'Clear'}
          >
            <BsXLg size={11} />
          </button>
        )}
      </div>

      {query.length >= MIN_SEARCH_LENGTH && (
        <div data-testid="search-results">
          {searching ? (
            <div className="questions-list">
              {[0, 1, 2].map((i) => (
                <div key={i} className="questions-skeleton" style={{ height: '3.1rem' }}>
                  <span className="visually-hidden">{t('qa.searching')}</span>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <ListGroup className="mb-3 questions-lang-list">
              {results.map((lang) => renderLanguageItem(lang))}
            </ListGroup>
          ) : (
            <div className="questions-empty" data-testid="no-results">
              <span className="questions-empty__icon">
                <BsInboxes size={24} />
              </span>
              <p className="questions-empty__title">{t('qa.noLanguagesFound')}</p>
            </div>
          )}
        </div>
      )}

      {!query && suggested?.browserSuggested && (
        <div className="mb-3" data-testid="browser-suggested">
          <div className="questions-label">{t('qa.browserDetected')}</div>
          <ListGroup className="questions-lang-list">
            {renderLanguageItem(suggested.browserSuggested)}
          </ListGroup>
        </div>
      )}

      {!query && !showAll && popularSystemLanguages.length > 0 && (
        <div className="mb-3" data-testid="popular-languages">
          <div className="questions-label">{t('qa.popularLanguages')}</div>
          <ListGroup className="questions-lang-list">
            {popularSystemLanguages.map((lang) => renderLanguageItem(lang))}
          </ListGroup>
        </div>
      )}

      {!query && !showAll && (
        <div className="text-center mt-3">
          <button
            type="button"
            className="questions-btn"
            onClick={handleShowAll}
            data-testid="show-all-btn"
          >
            <BsGlobe size={14} />
            {t('qa.showAllLanguages')}
          </button>
        </div>
      )}

      {showAll && allLanguages.length > 0 && (
        <div data-testid="all-languages">
          <div className="questions-label">{t('qa.allLanguages')}</div>
          <ListGroup className="questions-lang-list">
            {allLanguages.map((parent) => (
              <div
                key={parent.id || parent.iso639_3}
                className="d-flex flex-column gap-1"
                style={{ marginBottom: '0.375rem' }}
              >
                {renderLanguageItem(parent)}
                {parent.children?.map((child) => renderLanguageItem(child, { nested: true }))}
              </div>
            ))}
          </ListGroup>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="language-picker" data-testid="language-picker">
        {content}
      </div>
    );
  }

  return (
    <Card data-testid="language-picker">
      <CardBody>{content}</CardBody>
    </Card>
  );
}
