import { Container } from 'react-bootstrap';
import NewsDetail from '../../components/NewsDetail';

export const metadata = {
  title: 'Haber Detayı'
};

const NewsDetailPage = ({ params }) => {
  return (
    <main>
      <Container>
        <NewsDetail newsId={params.newsId} />
      </Container>
    </main>
  );
};

export default NewsDetailPage;
