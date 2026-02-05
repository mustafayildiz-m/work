import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const BireyselKullanicilarPage = () => {
  return (
    <>
      <Helmet>
        <title>Bireysel Kullanıcılar - Islamic Windows Admin</title>
      </Helmet>
      
      <Container>
        <UserManagement
          role="user"
          title="Bireysel Kullanıcılar"
          description="Platform kullanıcılarını görüntüleyin ve yönetin"
        />
      </Container>
    </>
  );
};

export default BireyselKullanicilarPage;

