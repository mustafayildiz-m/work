'use client';

import { Card, CardBody } from 'react-bootstrap';
import Link from 'next/link';
import { useLanguage } from '@/context/useLanguageContext';

const formatDate = (dateValue, locale = 'tr-TR') => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : (locale === 'en' ? 'en-US' : locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function NewsletterSidebar({ otherItems, themeCardStyle }) {
  const { locale, t } = useLanguage();

  return (
    <>
      <Card className="border-0 shadow-sm mb-3" style={themeCardStyle}>
        <CardBody>
          <small className="text-muted d-block mb-1">{t('feed.newslettersPublishInfo')}</small>
          <h6 className="fw-bold mb-1">{t('menu.newsletters')}</h6>
          <p className="text-muted small mb-0">{t('feed.newslettersPublishInfoDesc')}</p>
        </CardBody>
      </Card>

      <Card className="border-0 shadow-sm" style={themeCardStyle}>
        <CardBody>
          <h6 className="fw-bold mb-3">{t('feed.newslettersOtherEditions')}</h6>
          {otherItems.map((item) => (
            <div key={item.id} className="mb-3 pb-3 border-bottom">
              <Link href={`/feed/newsletters/${item.id}`} className="text-decoration-none">
                <small className="text-muted d-block">{formatDate(item.publishDate || item.publishedAt, locale)}</small>
                <strong className="d-block">{item.title}</strong>
              </Link>
            </div>
          ))}
          {otherItems.length === 0 && (
            <p className="text-muted small mb-0">{t('feed.newslettersNoOtherEditions')}</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}
