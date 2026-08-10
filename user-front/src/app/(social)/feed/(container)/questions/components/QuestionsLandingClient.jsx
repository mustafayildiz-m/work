'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Spinner } from 'react-bootstrap';
import { BsQuestionCircle } from 'react-icons/bs';
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
      <Col lg={9} className="feed-main-col qa-page-col">
        <div className="d-flex justify-content-center py-5" data-testid="loading-spinner">
          <Spinner animation="border" variant="success" />
        </div>
      </Col>
    );
  }

  return (
    <Col lg={9} className="feed-main-col qa-page-col">
      <Card className="qa-page-card questions-landing-card" data-testid="questions-landing">
        <CardHeader className="qa-page-card__header border-0">
          <div className="d-flex align-items-center gap-2">
            <span className="qa-page-card__icon">
              <BsQuestionCircle size={20} />
            </span>
            <div>
              <h1 className="qa-page-card__title" data-testid="landing-title">
                {t('qa.title') || 'Questions & Answers'}
              </h1>
              <p className="qa-page-card__subtitle">
                {t('qa.subtitle') || 'Select your language to browse Islamic Q&A content'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="qa-page-card__body">
          {stats && (
            <Row className="mb-4 g-3" data-testid="stats-row">
              <Col xs={6} md={4}>
                <div className="questions-stat-card text-center h-100">
                  <h3 className="fw-bold mb-0">{stats.totalLanguages}</h3>
                  <small className="text-muted">{t('qa.statsLanguages')}</small>
                </div>
              </Col>
              <Col xs={6} md={4}>
                <div className="questions-stat-card text-center h-100">
                  <h3 className="fw-bold mb-0">{stats.activeLanguages}</h3>
                  <small className="text-muted">{t('qa.statsActive')}</small>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="questions-stat-card text-center h-100">
                  <h3 className="fw-bold mb-0">{stats.totalQuestions?.toLocaleString()}</h3>
                  <small className="text-muted">{t('qa.statsQuestions')}</small>
                </div>
              </Col>
            </Row>
          )}

          <LanguagePicker
            embedded
            suggested={suggested}
            onSelect={(lang) => {
              const slug = lang.iso639_3 || lang.code;
              if (slug) router.push(`/feed/questions/${slug}`);
            }}
          />
        </CardBody>
      </Card>
    </Col>
  );
}
