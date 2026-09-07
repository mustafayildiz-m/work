'use client';

import { useState, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import { BsQuestionCircle, BsGlobe2, BsPatchCheck, BsChatQuote } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/useLanguageContext';
import LanguagePicker from './LanguagePicker';
import '../../qa/qa-page.css';
import '../questions.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function QuestionsLandingClient() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [suggested, setSuggested] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { 'Accept-Language': locale };
        const [sugRes, statRes] = await Promise.all([
          fetch(`${API_URL}/languages/qa/suggested`, { headers }),
          fetch(`${API_URL}/languages/qa/stats`),
        ]);
        if (sugRes.ok) setSuggested(await sugRes.json());
        if (statRes.ok) setStats(await statRes.json());
      } catch {
        // silently fail - the UI will still render
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [locale]);

  if (loading) {
    return (
      <Col lg={9} className="feed-main-col questions-page">
        <div className="questions-shell">
          <div className="questions-hero">
            <div className="d-flex align-items-center gap-3">
              <span className="questions-hero__icon">
                <BsQuestionCircle size={22} />
              </span>
              <div>
                <span className="questions-hero__eyebrow">Islamic Windows</span>
                <h1 className="questions-hero__title">{t('qa.title') || 'Questions & Answers'}</h1>
              </div>
            </div>
          </div>
          <div className="questions-body" data-testid="loading-spinner">
            <div className="questions-stats">
              {[0, 1, 2].map((i) => (
                <div key={i} className="questions-skeleton" style={{ height: '5.5rem' }} />
              ))}
            </div>
            <div className="questions-list">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="questions-skeleton" />
              ))}
            </div>
          </div>
        </div>
      </Col>
    );
  }

  const statTiles = stats
    ? [
        {
          icon: <BsGlobe2 size={15} />,
          value: stats.totalLanguages?.toLocaleString(),
          label: t('qa.statsLanguages'),
        },
        {
          icon: <BsPatchCheck size={15} />,
          value: stats.activeLanguages?.toLocaleString(),
          label: t('qa.statsActive'),
        },
        {
          icon: <BsChatQuote size={15} />,
          value: stats.totalQuestions?.toLocaleString(),
          label: t('qa.statsQuestions'),
        },
      ]
    : [];

  return (
    <Col lg={9} className="feed-main-col questions-page">
      <div className="questions-shell" data-testid="questions-landing">
        <header className="questions-hero">
          <div className="d-flex align-items-start gap-3">
            <span className="questions-hero__icon">
              <BsQuestionCircle size={22} />
            </span>
            <div className="min-w-0">
              <span className="questions-hero__eyebrow">Islamic Windows</span>
              <h1 className="questions-hero__title" data-testid="landing-title">
                {t('qa.title') || 'Questions & Answers'}
              </h1>
              <p className="questions-hero__subtitle">
                {t('qa.subtitle') || 'Select your language to browse Islamic Q&A content'}
              </p>
            </div>
          </div>
        </header>

        <div className="questions-body">
          {stats && (
            <div className="questions-stats" data-testid="stats-row">
              {statTiles.map((tile) => (
                <div key={tile.label} className="questions-stat">
                  <span className="questions-stat__icon">{tile.icon}</span>
                  <p className="questions-stat__value">{tile.value}</p>
                  <small className="questions-stat__label">{tile.label}</small>
                </div>
              ))}
            </div>
          )}

          <LanguagePicker
            embedded
            suggested={suggested}
            onSelect={(lang) => {
              const slug = lang.iso639_3 || lang.code;
              if (slug) router.push(`/feed/questions/${slug}`);
            }}
          />
        </div>
      </div>
    </Col>
  );
}
