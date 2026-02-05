'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { BsCalendarDate, BsNewspaper, BsGlobe, BsArrowLeft } from 'react-icons/bs';
import NewsImage from './NewsImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NewsDetail = ({ newsId }) => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/islamic-news/${newsId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching news detail:', err);
        
        // Fallback for API errors
        if (err.message.includes('fetch')) {
          setError('API bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryVariant = (category) => {
    if (category?.includes('politics')) return 'primary';
    if (category?.includes('lifestyle')) return 'success';
    if (category?.includes('top')) return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Haber yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>Hata!</Alert.Heading>
        <p>Haber yüklenirken bir hata oluştu: {error}</p>
        <Button variant="outline-danger" onClick={() => router.back()}>
          Geri Dön
        </Button>
      </Alert>
    );
  }

  if (!news) {
    return (
      <Alert variant="warning" className="mb-4">
        <Alert.Heading>Haber Bulunamadı</Alert.Heading>
        <p>İstediğiniz haber bulunamadı.</p>
        <Button variant="outline-warning" onClick={() => router.back()}>
          Geri Dön
        </Button>
      </Alert>
    );
  }

  return (
    <div className="bg-mode p-4">
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => router.back()}
          className="d-flex align-items-center gap-2"
        >
          <BsArrowLeft size={16} />
          Haberlere Geri Dön
        </Button>
      </div>

      {/* News Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <BsNewspaper size={20} className="text-primary" />
          <span className="text-muted">{news.source_name}</span>
          {news.country && (
            <>
              <BsGlobe size={16} className="text-muted" />
              <span className="text-muted">
                {news.country === 'turkey' ? 'Türkiye' : news.country}
              </span>
            </>
          )}
        </div>

        <h1 className="h2 mb-3">{news.title}</h1>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {news.category?.split(',').map((cat, index) => (
            <Badge 
              key={index} 
              bg={getCategoryVariant(cat.trim())} 
              className="px-3 py-2"
            >
              {cat.trim()}
            </Badge>
          ))}
        </div>

        <div className="d-flex align-items-center gap-3 text-muted">
          <small>
            <BsCalendarDate size={16} className="me-1" />
            {formatDate(news.pub_date)}
          </small>
          {news.language && (
            <small>Dil: {news.language === 'turkish' ? 'Türkçe' : news.language}</small>
          )}
        </div>
      </div>

      {/* News Image */}
      <div className="mb-4">
        <NewsImage
          src={news.image_url}
          alt={news.title || 'Haber görseli'}
          width={800}
          height={400}
          className="w-100 rounded"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* News Content */}
      <Row>
        <Col lg={8}>
          <Card className="border-0 bg-transparent">
            <Card.Body className="px-0">
              <h5 className="mb-3">Haber Özeti</h5>
              <p className="lead mb-4">{news.description}</p>

              {news.content && news.content !== 'ONLY AVAILABLE IN PAID PLANS' ? (
                <div className="news-content">
                  <h5 className="mb-3">Haber Detayı</h5>
                  <div dangerouslySetInnerHTML={{ __html: news.content }} />
                </div>
              ) : (
                <Alert variant="info" className="mb-4">
                  <Alert.Heading>Premium İçerik</Alert.Heading>
                  <p>Bu haberin tam içeriği premium üyelik gerektirir.</p>
                  {news.link && (
                    <Button 
                      href={news.link} 
                      target="_blank" 
                      variant="outline-primary"
                      as="a"
                    >
                      Orijinal Kaynağı Görüntüle
                    </Button>
                  )}
                </Alert>
              )}

              {news.keywords && (
                <div className="mt-4">
                  <h6 className="mb-2">Anahtar Kelimeler:</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {news.keywords.split(',').map((keyword, index) => (
                      <Badge key={index} bg="secondary" className="px-2 py-1">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <h6 className="mb-3">Haber Bilgileri</h6>
              
              <div className="mb-3">
                <small className="text-muted d-block">Kaynak</small>
                <strong>{news.source_name}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Yayın Tarihi</small>
                <strong>{formatDate(news.pub_date)}</strong>
              </div>

              {news.country && (
                <div className="mb-3">
                  <small className="text-muted d-block">Ülke</small>
                  <strong>{news.country === 'turkey' ? 'Türkiye' : news.country}</strong>
                </div>
              )}

              {news.language && (
                <div className="mb-3">
                  <small className="text-muted d-block">Dil</small>
                  <strong>{news.language === 'turkish' ? 'Türkçe' : news.language}</strong>
                </div>
              )}

              {news.link && (
                <div className="mt-4">
                  <Button 
                    href={news.link} 
                    target="_blank" 
                    variant="primary" 
                    className="w-100"
                    as="a"
                  >
                    Orijinal Kaynağı Aç
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NewsDetail;
