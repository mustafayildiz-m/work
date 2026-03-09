import { notFound } from 'next/navigation';
import { Col, Row } from 'react-bootstrap';
import NewsletterContentWithTranslation from '../components/NewsletterContentWithTranslation';
import NewsletterSidebar from '../components/NewsletterSidebar';

export const dynamic = 'force-dynamic';

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
          <NewsletterSidebar otherItems={otherItems} themeCardStyle={themeCardStyle} />
        </Col>
      </Row>
    </Col>
  );
};

export default NewsletterDetailPage;
