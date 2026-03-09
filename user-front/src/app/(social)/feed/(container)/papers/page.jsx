import { Col } from 'react-bootstrap';
import PapersList from './components/PapersList';

export const dynamic = 'force-dynamic';

const fetchPapers = async (searchQuery) => {
  const apiBase =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';
  const url = new URL('/papers', apiBase);
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

const PapersPage = async ({ searchParams }) => {
  const search = searchParams?.search?.trim() || '';
  const items = await fetchPapers(search);

  return (
    <Col lg={9}>
      <PapersList items={items} search={search} />
    </Col>
  );
};

export default PapersPage;
