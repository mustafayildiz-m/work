import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import NewsletterContentWithTranslation from '../components/NewsletterContentWithTranslation';

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

const fetchFromApi = async (path) => {
  const apiBase =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';
  const response = await fetch(`${apiBase}${path}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

const NewsletterDetailPage = async ({ params }) => {
  const data = await fetchFromApi(`/newsletters/${params.id}`);
  const listResult = await fetchFromApi('/newsletters?limit=6');
  const otherItems = (listResult?.data || []).filter(
    (item) => String(item.id) !== String(params.id)
  );
  const themeCardStyle = {
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)',
    borderColor: 'var(--bs-border-color)'
  };
  if (!data) {
    notFound();
  }

  return (
    <Col lg={9}>
      <Row className="g-3">
        <Col lg={8}>
          <NewsletterContentWithTranslation data={data} themeCardStyle={themeCardStyle} />
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-3" style={themeCardStyle}>
            <CardBody>
              <small className="text-muted d-block mb-1">Yayin bilgisi</small>
              <h6 className="fw-bold mb-1">Haber Bulteni</h6>
              <p className="text-muted small mb-0">Bu alanda guncel bulten icerikleri yer alir.</p>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm" style={themeCardStyle}>
            <CardBody>
              <h6 className="fw-bold mb-3">Diger sayilar</h6>
              {otherItems.map((item) => (
                <div key={item.id} className="mb-3 pb-3 border-bottom">
                  <Link href={`/feed/newsletters/${item.id}`} className="text-decoration-none">
                    <small className="text-muted d-block">{formatDate(item.publishDate || item.publishedAt)}</small>
                    <strong className="d-block">{item.title}</strong>
                  </Link>
                </div>
              ))}
              {otherItems.length === 0 && (
                <p className="text-muted small mb-0">Diger bulten bulunamadi.</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Col>
  );
};

export default NewsletterDetailPage;
