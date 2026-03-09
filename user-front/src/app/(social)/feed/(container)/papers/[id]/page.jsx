import { notFound } from 'next/navigation';
import { Col, Row } from 'react-bootstrap';
import PaperContent from '../components/PaperContent';
import PaperSidebar from '../components/PaperSidebar';

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

const PaperDetailPage = async ({ params }) => {
  const data = await fetchFromApi(`/papers/${params.id}`);
  const listResult = await fetchFromApi('/papers?limit=6');
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
          <PaperContent data={data} themeCardStyle={themeCardStyle} />
        </Col>

        <Col lg={4}>
          <PaperSidebar otherItems={otherItems} themeCardStyle={themeCardStyle} />
        </Col>
      </Row>
    </Col>
  );
};

export default PaperDetailPage;
