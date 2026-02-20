import { FormattedMessage } from "react-intl";
import { PageNavbar } from '@/pages/account';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Link } from 'react-router-dom';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { AccountActivityContent } from './account-basic-content';

export function AccountActivityPage() {
  const { settings } = useSettings();

  return (
    <>
      <PageNavbar />
      {settings.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                <FormattedMessage id="UI.CENTRAL_HUB_FOR_PERSONAL_CUSTOMIZATION" />
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <Button variant="outline" asChild>
                <Link to="#"><FormattedMessage id="UI.PRIVACY_SETTINGS" /></Link>
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <AccountActivityContent />
      </Container>
    </>
  );
}
