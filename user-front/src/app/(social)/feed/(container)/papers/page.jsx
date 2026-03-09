import PapersPageClient from './components/PapersPageClient';

export const dynamic = 'force-dynamic';

const PapersPage = async ({ searchParams }) => {
  const search = searchParams?.search?.trim() || '';

  return <PapersPageClient initialSearch={search} />;
};

export default PapersPage;
