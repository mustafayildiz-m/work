'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card, CardBody, Spinner } from 'react-bootstrap';
import { BsArrowLeft, BsTranslate } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguages } from '@/hooks/useLanguages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MAX_TEXT_LENGTH = 9000;

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

function translateWithPlaceholders(html, translateFn) {
  const tags = [];
  let i = 0;
  // Use {{IW0}} format - survives translation APIs (control chars like \x01 get stripped)
  const placeholderPrefix = '{{IW';
  const placeholderSuffix = '}}';
  const htmlWithPlaceholders = html.replace(/<[^>]+>/g, (match) => {
    const ph = `${placeholderPrefix}${i}${placeholderSuffix}`;
    tags.push({ ph, tag: match });
    i++;
    return ph;
  });
  return translateFn(htmlWithPlaceholders).then((translated) => {
    let result = translated;
    // Replace from highest index first to avoid IW1 matching inside IW10
    for (let idx = tags.length - 1; idx >= 0; idx--) {
      const { ph, tag } = tags[idx];
      result = result.split(ph).join(tag);
      // Fallback: API may strip braces, try plain IWn
      const phPlain = `IW${idx}`;
      if (result.includes(phPlain) && !result.includes(ph)) {
        result = result.split(phPlain).join(tag);
      }
    }
    return result;
  });
}

function translatePlain(text, translateFn) {
  if (!text || !text.trim()) return Promise.resolve(text);
  return translateFn(text);
}

async function translateChunked(text, translateFn) {
  if (!text || text.length <= MAX_TEXT_LENGTH) {
    return translateFn(text);
  }
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > MAX_TEXT_LENGTH && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    results.push(await translateFn(chunks[i]));
    if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 400));
  }
  return results.join(' ');
}

export default function NewsletterContentWithTranslation({ data, themeCardStyle }) {
  const { languages, loading: languagesLoading } = useLanguages();
  const [selectedLang, setSelectedLang] = useState(null);
  const [translated, setTranslated] = useState({ title: '', intro: '', sections: [] });
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
    const code = targetCode || selectedLang?.code;
    if (!code) return text || '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/translation/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        text: text || '',
        targetLangCode: code,
        sourceLangCode: undefined
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ceviri basarisiz');
    }
    const json = await res.json();
    return json.translatedText || '';
  }, [selectedLang]);

  // Normalize content source: backend may return content and/or sections
  const contentSections = useCallback(() => {
    const secs = (data?.sections || []).filter((s) => s && typeof s.content === 'string');
    if (secs.length > 0) return secs;
    const raw = data?.content;
    if (raw && typeof raw === 'string') {
      return [{ title: 'Detay', content: raw }];
    }
    return [];
  }, [data]);

  const handleLanguageSelect = useCallback(async (lang) => {
    if (!lang || !data) return;
    setSelectedLang(lang);
    setTranslating(true);
    setError(null);
    try {
      const api = (text) => translateApi(text, lang.code);
      const sections = contentSections();

      const [titleRes, introRes, ...sectionRes] = await Promise.all([
        translatePlain(data.title, api),
        translatePlain(data.intro || '', api),
        ...sections.map((s) =>
          s.content
            ? translateWithPlaceholders(s.content, (html) => translateChunked(html, api))
            : Promise.resolve('')
        )
      ]);

      setTranslated({
        title: titleRes,
        intro: introRes,
        sections: sections.map((s, i) => ({
          ...s,
          content: sectionRes[i] ?? s.content
        }))
      });
    } catch (err) {
      setError(err.message || 'Ceviri yapilirken hata olustu');
      setTranslated({ title: '', intro: '', sections: [] });
    } finally {
      setTranslating(false);
    }
  }, [data, translateApi, contentSections]);

  const displayTitle = selectedLang && translated.title ? translated.title : data?.title;
  const displayIntro = selectedLang && translated.intro ? translated.intro : data?.intro;
  const displaySections = selectedLang && translated.sections?.length
    ? translated.sections
    : contentSections();

  return (
    <Card className="border-0 shadow-sm" style={themeCardStyle}>
      <CardBody className="p-4 p-md-5">
        <Button
          as={Link}
          href="/feed/newsletters"
          variant="light"
          className="mb-3 d-inline-flex align-items-center gap-2 border"
          style={{
            backgroundColor: 'var(--bs-tertiary-bg)',
            color: 'var(--bs-body-color)',
            borderColor: 'var(--bs-border-color)'
          }}
        >
          <BsArrowLeft />
          Tum bultenlere don
        </Button>

        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h3 className="fw-bold mb-0 me-auto">{displayTitle}</h3>
          <div className="d-flex align-items-center gap-2">
            {selectedLang && !translating && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedLang(null);
                  setTranslated({ title: '', intro: '', sections: [] });
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

        <small className="text-muted d-block mb-3">{formatDate(data?.publishDate || data?.publishedAt)}</small>

        {error && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {translating && (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            <span>Metin secilen dile cevriliyor...</span>
          </div>
        )}

        <p className="mb-4">{displayIntro}</p>

        {data?.imageUrl && (
          <figure className="mb-4">
            <img
              src={resolveImageUrl(data.imageUrl)}
              alt={displayTitle}
              className="w-100 rounded-3 border"
              style={{ maxHeight: 380, objectFit: 'cover' }}
            />
          </figure>
        )}

        <div className="d-grid gap-4">
          {displaySections.map((section) => (
            <div key={section.title}>
              <div
                className="mb-0 text-muted newsletter-content"
                dangerouslySetInnerHTML={{ __html: section.content || '' }}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
