import { FormattedMessage, useIntl } from "react-intl";
import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import UserManagement from './components/UserManagement';

const BireyselKullanicilarPage = () => {
  const intl = useIntl();
  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.BIREYSEL_KULLANICILAR__ISLAMIC_WINDOWS_A"
        })}</title>
      </Helmet>
      <Container>
        <UserManagement
          role="user"
          title={<FormattedMessage id="UI.USER_MGMT_PAGE_USERS_TITLE" />}
          description={<FormattedMessage id="UI.USER_MGMT_PAGE_USERS_DESC" />}
        />
      </Container>
    </>
  );
};

export default BireyselKullanicilarPage;

