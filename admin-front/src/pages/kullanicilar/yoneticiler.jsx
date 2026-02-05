import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const YoneticilerPage = () => {
  return (
    <>
      <Helmet>
        <title>Yöneticiler - Islamic Windows Admin</title>
      </Helmet>
      
      <Container>
        <UserManagement
          role="admin"
          title="Yöneticiler"
          description="Sistem yöneticilerini görüntüleyin ve yönetin"
        />
      </Container>
    </>
  );
};

export default YoneticilerPage;

