import { Col } from 'react-bootstrap';
import NewsletterListWithTranslation from './components/NewsletterListWithTranslation';

export const dynamic = 'force-dynamic';

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
      <NewsletterListWithTranslation items={items} search={search} themeCardStyle={themeCardStyle} />
    </Col>
  );
};

export default NewslettersPage;
