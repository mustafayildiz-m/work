'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card, CardBody, Form, Spinner } from 'react-bootstrap';
import { BsArrowRight, BsSearch, BsTranslate } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguages } from '@/hooks/useLanguages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
};

const getLanguageFlag = (code) => {
  const flagMap = {
    tr: '🇹🇷', en: '🇬🇧', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸',
    it: '🇮🇹', ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', fa: '🇮🇷',
    ur: '🇵🇰', hi: '🇮🇳', id: '🇮🇩', ms: '🇲🇾', nl: '🇳🇱', pt: '🇵🇹'
  };
  return flagMap[(code || '').toLowerCase()] || '🌐';
};

function translatePlain(text, translateFn) {
  if (!text || !text.trim()) return Promise.resolve(text);
  return translateFn(text);
}

export default function NewsletterListWithTranslation({ items, search, themeCardStyle }) {
  const { languages, loading: languagesLoading } = useLanguages();
  const [selectedLang, setSelectedLang] = useState(null);
  const [translatedItems, setTranslatedItems] = useState({});
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langDropdownPos, setLangDropdownPos] = useState({ top: 0, left: 0 });
  const langToggleRef = useRef(null);
  const langMenuRef = useRef(null);

  useEffect(() => {
    if (!langDropdownOpen || !langToggleRef.current) return;
    const updatePos = () => {
      if (langToggleRef.current && typeof window !== 'undefined') {
        const rect = langToggleRef.current.getBoundingClientRect();
        const w = 220;
        let left = rect.right - w;
        if (left < 8) left = 8;
        if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
        setLangDropdownPos({
          top: rect.bottom + 4,
          left,
          width: w
        });
      }
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [langDropdownOpen]);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        langToggleRef.current && !langToggleRef.current.contains(e.target) &&
        langMenuRef.current && !langMenuRef.current.contains(e.target)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langDropdownOpen]);

  const translateApi = useCallback(async (text, targetCode) => {
    if (!targetCode) return text || '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        text: text || '',
        targetLangCode: targetCode,
        sourceLangCode: undefined
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ceviri basarisiz');
    }
    const json = await res.json();
    return json.translatedText || '';
  }, []);

  const handleLanguageSelect = useCallback(async (lang) => {
    if (!lang || !items?.length) return;
    setSelectedLang(lang);
    setTranslating(true);
    setError(null);
    try {
      const api = (text) => translateApi(text, lang.code);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const [titleRes, introRes] = await Promise.all([
          translatePlain(item.title, api),
          translatePlain(item.intro || '', api)
        ]);
        setTranslatedItems((prev) => ({ ...prev, [item.id]: { title: titleRes, intro: introRes } }));
        if (i < items.length - 1) await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      setError(err.message || 'Ceviri yapilirken hata olustu');
      setTranslatedItems({});
    } finally {
      setTranslating(false);
    }
  }, [items, translateApi]);

  const getDisplayItem = (item) => {
    if (!selectedLang || !translatedItems[item.id]) return item;
    const t = translatedItems[item.id];
    return {
      ...item,
      title: t.title || item.title,
      intro: t.intro ?? item.intro
    };
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden" style={themeCardStyle}>
      <div
        className="p-4 p-md-5 border-bottom"
        style={{
          backgroundColor: 'var(--bs-tertiary-bg)',
          borderColor: 'var(--bs-border-color)'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-2">
          <div>
            <h4 className="mb-1 fw-bold">Haber Bultenleri</h4>
            <p className="mb-0 text-muted">Haftalik ozetler, editor seckileri ve topluluk one cikanlari.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {selectedLang && !translating && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedLang(null);
                  setTranslatedItems({});
                  setError(null);
                }}
              >
                Orijinale don
              </Button>
            )}
            <div className="position-relative" ref={langToggleRef}>
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-2"
                disabled={languagesLoading || translating}
                onClick={() => setLangDropdownOpen((o) => !o)}
              >
                <BsTranslate />
                {translating ? 'Cevriliyor...' : selectedLang ? `${getLanguageFlag(selectedLang.code)} ${selectedLang.name}` : 'Dil sec ve cevir'}
              </Button>
              {langDropdownOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                  <div
                    ref={langMenuRef}
                    role="menu"
                    className="newsletter-lang-dropdown-custom"
                    style={{
                      position: 'fixed',
                      top: langDropdownPos.top,
                      left: langDropdownPos.left,
                      width: langDropdownPos.width,
                      maxHeight: 320,
                      overflowY: 'auto',
                      zIndex: 99999,
                      backgroundColor: 'var(--bs-body-bg)',
                      color: 'var(--bs-body-color)',
                      border: '1px solid var(--bs-border-color)',
                      borderRadius: 8,
                      boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.25)',
                      padding: '0.25rem 0'
                    }}
                  >
                    {languages
                      .filter((l) => l.isActive !== false)
                      .map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          role="menuitem"
                          className="d-block w-100 text-start border-0 px-3 py-2"
                          style={{
                            background: selectedLang?.id === lang.id ? 'var(--bs-primary-bg-subtle)' : 'transparent',
                            color: 'var(--bs-body-color)',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bs-tertiary-bg)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedLang?.id === lang.id ? 'var(--bs-primary-bg-subtle)' : 'transparent';
                          }}
                          onClick={() => {
                            handleLanguageSelect(lang);
                            setLangDropdownOpen(false);
                          }}
                        >
                          {getLanguageFlag(lang.code)} {lang.name}
                        </button>
                      ))}
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
        <small className="text-muted">Guncel ozetler ve editor seckileri</small>
      </div>

      <CardBody>
        <Form className="d-flex flex-column flex-md-row gap-2 mb-4" method="get">
          <div className="position-relative flex-grow-1">
            <BsSearch
              className="position-absolute text-muted"
              style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <Form.Control
              name="search"
              placeholder="Bulten ara..."
              defaultValue={search}
              style={{
                paddingLeft: 36,
                backgroundColor: 'var(--bs-body-bg)',
                color: 'var(--bs-body-color)',
                borderColor: 'var(--bs-border-color)'
              }}
            />
          </div>
          <Button variant="outline-secondary" type="submit">
            Filtrele
          </Button>
        </Form>

        {error && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {translating && (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            <span>Liste secilen dile cevriliyor...</span>
          </div>
        )}

        <div className="d-grid gap-2">
          {items.map((item) => {
            const display = getDisplayItem(item);
            return (
              <Card key={item.id} className="border-0 border-bottom rounded-0" style={{ ...themeCardStyle, borderColor: 'var(--bs-border-color)' }}>
                <CardBody className="px-0 py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
                    {item.imageUrl && (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={display.title}
                        className="rounded-3 border flex-shrink-0"
                        style={{ width: 88, height: 88, objectFit: 'cover' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">{formatDate(item.publishDate || item.publishedAt)}</small>
                      <h6 className="fw-bold mb-1">{display.title}</h6>
                      <p className="text-muted mb-2">{display.intro || '-'}</p>
                    </div>
                    <Button
                      as={Link}
                      href={`/feed/newsletters/${item.id}`}
                      variant="outline-success"
                      size="sm"
                      className="d-flex align-items-center gap-1 mt-1"
                    >
                      Oku <BsArrowRight />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          {items.length === 0 && (
            <p className="text-muted mb-0">Gosterilecek bulten bulunamadi.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
