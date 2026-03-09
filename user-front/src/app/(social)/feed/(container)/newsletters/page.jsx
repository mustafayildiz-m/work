import NewslettersPageClient from './components/NewslettersPageClient';

export const dynamic = 'force-dynamic';

const NewslettersPage = async ({ searchParams }) => {
  const search = searchParams?.search?.trim() || '';
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);

  return <NewslettersPageClient initialSearch={search} initialPage={page} />;
};

export default NewslettersPage;
