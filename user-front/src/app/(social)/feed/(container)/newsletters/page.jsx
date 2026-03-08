import { Button, Card, CardBody, Col, Form } from 'react-bootstrap';
import { BsArrowRight, BsSearch } from 'react-icons/bs';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const publicApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${publicApiBase.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
};

const fetchNewsletters = async (searchQuery) => {
  const apiBase =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';
  const url = new URL('/newsletters', apiBase);
  url.searchParams.set('limit', '100');
  if (searchQuery) {
    url.searchParams.set('search', searchQuery);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.data) ? data.data : [];
};

const NewslettersPage = async ({ searchParams }) => {
  const search = searchParams?.search?.trim() || '';
  const items = await fetchNewsletters(search);
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
              <h4 className="mb-1 fw-bold">Haber Bultenleri</h4>
              <p className="mb-0 text-muted">Haftalik ozetler, editor seckileri ve topluluk one cikanlari.</p>
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

          <div className="d-grid gap-2">
            {items.map((item) => (
              <Card key={item.id} className="border-0 border-bottom rounded-0" style={{ ...themeCardStyle, borderColor: 'var(--bs-border-color)' }}>
                <CardBody className="px-0 py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap">
                    {item.imageUrl && (
                      <img
                        src={resolveImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="rounded-3 border flex-shrink-0"
                        style={{ width: 88, height: 88, objectFit: 'cover' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <small className="text-muted d-block mb-1">{formatDate(item.publishDate || item.publishedAt)}</small>
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <p className="text-muted mb-2">{item.intro || '-'}</p>
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
            {items.length === 0 && (
              <p className="text-muted mb-0">Gosterilecek bulten bulunamadi.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default NewslettersPage;
