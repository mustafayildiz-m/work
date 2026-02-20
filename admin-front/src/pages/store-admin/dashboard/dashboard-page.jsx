import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { DashboardContent } from '.';

export function DashboardPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <FormattedMessage id="UI.SALES_INVENTORY_AND_ACTIVITY_OVERVIEW" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <Link to="#"><FormattedMessage id="UI.REPORTS" /></Link>
            </Button>
            <Button>
              <Link to="#"><FormattedMessage id="UI.NEW_PRODUCT" /></Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <DashboardContent />
      </Container>
    </Fragment>
  );
}
