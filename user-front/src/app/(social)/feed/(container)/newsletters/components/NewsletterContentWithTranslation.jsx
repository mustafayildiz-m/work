'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Card, CardBody, Spinner } from 'react-bootstrap';
import { BsArrowLeft } from 'react-icons/bs';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MAX_TEXT_LENGTH = 9000;
const SOURCE_LOCALE = 'tr'; // Bulten icerigi varsayilan olarak Turkce

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
  const { locale, t } = useLanguage();
  const [translated, setTranslated] = useState({ title: '', intro: '', sections: [] });
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

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

  const contentSections = useCallback(() => {
    const secs = (data?.sections || []).filter((s) => s && typeof s.content === 'string');
    if (secs.length > 0) return secs;
    const raw = data?.content;
    if (raw && typeof raw === 'string') {
      return [{ title: 'Detay', content: raw }];
    }
    return [];
  }, [data]);

  useEffect(() => {
    if (!data || locale === SOURCE_LOCALE) {
      setTranslated({ title: '', intro: '', sections: [] });
      setTranslating(false);
      return;
    }
    let cancelled = false;
    setTranslating(true);
    setError(null);
    const api = (text) => translateApi(text, locale);
    const sections = contentSections();
    (async () => {
      try {
        const [titleRes, introRes, ...sectionRes] = await Promise.all([
          translatePlain(data.title, api),
          translatePlain(data.intro || '', api),
          ...sections.map((s) =>
            s.content
              ? translateWithPlaceholders(s.content, (html) => translateChunked(html, api))
              : Promise.resolve('')
          )
        ]);
        if (!cancelled) {
          setTranslated({
            title: titleRes,
            intro: introRes,
            sections: sections.map((s, i) => ({
              ...s,
              content: sectionRes[i] ?? s.content
            }))
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Ceviri yapilirken hata olustu');
          setTranslated({ title: '', intro: '', sections: [] });
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [data, locale, translateApi, contentSections]);

  const displayTitle = locale !== SOURCE_LOCALE && translated.title ? translated.title : data?.title;
  const displayIntro = locale !== SOURCE_LOCALE && translated.intro ? translated.intro : data?.intro;
  const displaySections = locale !== SOURCE_LOCALE && translated.sections?.length
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
          {t('feed.newslettersBackToAll')}
        </Button>

        <h3 className="fw-bold mb-3">{displayTitle}</h3>

        <small className="text-muted d-block mb-3">{formatDate(data?.publishDate || data?.publishedAt)}</small>

        {error && (
          <div className="alert alert-warning py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {translating && (
          <div className="d-flex align-items-center gap-2 mb-3 text-muted">
            <Spinner animation="border" size="sm" />
            <span>{t('feed.newslettersTranslating')}</span>
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
