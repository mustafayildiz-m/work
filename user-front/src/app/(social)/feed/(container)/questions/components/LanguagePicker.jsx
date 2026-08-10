'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardBody, Form, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsGlobe } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';
import { getQaLanguageLabels, isSystemUiLanguage, UI_LOCALE_CODES, resolveUiLocaleFromQaLanguage } from '@/utils/uiLanguageDisplay';

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
      className={`questions-lang-item d-flex justify-content-between align-items-center${nested ? ' ps-4' : ''}`}
      data-testid={`lang-item-${slug}`}
      dir={lang.direction === 'rtl' ? 'rtl' : 'ltr'}
    >
      <div>
        <span className={`${nested ? 'fw-semibold' : 'fw-bold fs-5'} questions-lang-native`}>{primary}</span>
        {showSecondary && (
          <>
            <br />
            <small className="questions-lang-english">{secondary}</small>
          </>
        )}
      </div>
      {lang.questionCount > 0 && (
        <Badge className="questions-lang-badge">{lang.questionCount}</Badge>
      )}
    </ListGroup.Item>
    );
  };

  const content = (
    <>
      <InputGroup className="mb-3 qa-search-group">
        <InputGroup.Text className="qa-search-icon">
          <BsSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={t('qa.languageSearchPlaceholder')}
          value={query}
          onChange={handleInputChange}
          className="qa-search-input"
          data-testid="language-search-input"
          aria-label={t('qa.languageSearchAria')}
        />
      </InputGroup>

      {query.length >= MIN_SEARCH_LENGTH && (
        <div data-testid="search-results">
          {searching ? (
            <p className="text-center text-muted py-3">{t('qa.searching')}</p>
          ) : results.length > 0 ? (
            <ListGroup className="mb-3 questions-lang-list">{results.map(renderLanguageItem)}</ListGroup>
          ) : (
            <p className="text-center text-muted py-3" data-testid="no-results">
              {t('qa.noLanguagesFound')}
            </p>
          )}
        </div>
      )}

      {!query && suggested?.browserSuggested && (
        <div className="mb-3" data-testid="browser-suggested">
          <small className="text-muted d-block mb-1">{t('qa.browserDetected')}</small>
          <ListGroup className="questions-lang-list">{renderLanguageItem(suggested.browserSuggested)}</ListGroup>
        </div>
      )}

      {!query && !showAll && popularSystemLanguages.length > 0 && (
        <div className="mb-3" data-testid="popular-languages">
          <small className="text-muted d-block mb-2">{t('qa.popularLanguages')}</small>
          <ListGroup className="questions-lang-list">{popularSystemLanguages.map(renderLanguageItem)}</ListGroup>
        </div>
      )}

      {!query && !showAll && (
        <div className="text-center">
          <button
            type="button"
            className="btn qa-load-more-btn btn-sm"
            onClick={handleShowAll}
            data-testid="show-all-btn"
          >
            <BsGlobe className="me-1" />
            {t('qa.showAllLanguages')}
          </button>
        </div>
      )}

      {showAll && allLanguages.length > 0 && (
        <div data-testid="all-languages">
          <small className="text-muted d-block mb-2">{t('qa.allLanguages')}</small>
          <ListGroup className="questions-lang-list">
            {allLanguages.map((parent) => (
              <div key={parent.id || parent.iso639_3}>
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
