import { FormattedMessage } from "react-intl";
import { PageNavbar } from '@/pages/account';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { AccountEnterpriseContent } from '.';

export function AccountEnterprisePage() {
  const { settings } = useSettings();

  return (
    <>
      <PageNavbar />
      {settings?.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                <FormattedMessage id="UI.ADVANCED_BILLING_SOLUTIONS_FOR_LARGE_BUS" />
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <Button variant="outline"><FormattedMessage id="UI.ORDER_HISTORY" /></Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <AccountEnterpriseContent />
      </Container>
    </>
  );
}
