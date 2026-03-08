'use client';

import { Button, Card, CardBody, Col, Form } from 'react-bootstrap';
import { BsArrowRight, BsEnvelopePaper, BsSearch } from 'react-icons/bs';
import Link from 'next/link';

const newsletterItems = [
  {
    id: 1,
    title: 'Haftalik Gundem',
    excerpt: 'Bu haftanin one cikan gelismeleri, editor notlari ve ozel oneriler.',
    publishedAt: '12 Mart 2026'
  },
  {
    id: 2,
    title: 'Kitap ve Makale Seckisi',
    excerpt: 'Yeni eklenen kitap, makale ve podcast iceriklerinden derlenen secim listesi.',
    publishedAt: '9 Mart 2026'
  },
  {
    id: 3,
    title: 'Topluluktan Oneriler',
    excerpt: 'Toplulugun one cikardigi kaynaklar, yorumlar ve haftanin en cok kaydedilenleri.',
    publishedAt: '5 Mart 2026'
  }
];

const NewslettersPage = () => {
  const themeCardStyle = {
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)',
    borderColor: 'var(--bs-border-color)'
  };

  return (
    <Col lg={9}>
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
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white border mb-2">
                <BsEnvelopePaper className="text-success" />
                <small className="fw-semibold text-muted">IW Newsletter</small>
              </div>
              <h4 className="mb-1 fw-bold">Haber Bultenleri</h4>
              <p className="mb-0 text-muted">Haftalik ozetler, editor seckileri ve topluluk one cikanlari.</p>
            </div>
          </div>
          <small className="text-muted">Admin panelinden yayimlanir • Haftalik yayin</small>
        </div>

        <CardBody>
          <div className="d-flex flex-column flex-md-row gap-2 mb-4">
            <div className="position-relative flex-grow-1">
              <BsSearch
                className="position-absolute text-muted"
                style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <Form.Control
                placeholder="Bulten ara..."
                style={{
                  paddingLeft: 36,
                  backgroundColor: 'var(--bs-body-bg)',
                  color: 'var(--bs-body-color)',
                  borderColor: 'var(--bs-border-color)'
                }}
              />
            </div>
            <Button variant="outline-secondary">Filtrele</Button>
          </div>

          <div className="d-grid gap-2">
            {newsletterItems.map((item) => (
              <Card key={item.id} className="border-0 border-bottom rounded-0" style={{ ...themeCardStyle, borderColor: 'var(--bs-border-color)' }}>
                <CardBody className="px-0 py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">IW Newsletter • {item.publishedAt}</small>
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <p className="text-muted mb-2">{item.excerpt}</p>
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
            ))}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default NewslettersPage;
