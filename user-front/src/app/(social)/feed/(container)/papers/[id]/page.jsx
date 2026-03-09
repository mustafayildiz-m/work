import PaperDetailPageClient from '../components/PaperDetailPageClient';

export const dynamic = 'force-dynamic';

const PaperDetailPage = ({ params }) => {
  return <PaperDetailPageClient id={params.id} />;
};

export default PaperDetailPage;
