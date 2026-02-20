import { FormattedMessage, useIntl } from "react-intl";
import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const EditorlerPage = () => {
  const intl = useIntl();
  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.EDITORLER__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
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

