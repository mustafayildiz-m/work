import NewsletterDetailPageClient from '../components/NewsletterDetailPageClient';

export const dynamic = 'force-dynamic';

const NewsletterDetailPage = ({ params }) => {
  return <NewsletterDetailPageClient id={params.id} />;
};

export default NewsletterDetailPage;
