import { FormattedMessage, useIntl } from "react-intl";
import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import { Demo1LightSidebarContent } from './';

export function Demo1LightSidebarPage() {
  const intl = useIntl();
  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.DASHBOARD__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <Container>
        <Demo1LightSidebarContent />
      </Container>
    </>
  );
}
