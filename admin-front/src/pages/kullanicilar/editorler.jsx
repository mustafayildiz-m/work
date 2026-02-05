import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const EditorlerPage = () => {
  return (
    <>
      <Helmet>
        <title>Editörler - Islamic Windows Admin</title>
      </Helmet>
      
      <Container>
        <UserManagement
          role="editor"
          title="Editörler"
          description="İçerik editörlerini görüntüleyin ve yönetin"
        />
      </Container>
    </>
  );
};

export default EditorlerPage;

