import { FormattedMessage, useIntl } from "react-intl";
import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const YoneticilerPage = () => {
  const intl = useIntl();
  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.YONETICILER__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
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

