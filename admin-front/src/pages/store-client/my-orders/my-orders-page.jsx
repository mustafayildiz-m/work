import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { BaggageClaim } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { MyOrdersContent } from '.';

export function MyOrdersPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription><FormattedMessage id="UI.VIEW_AND_MANAGE_YOUR_ORDERS" /></ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <BaggageClaim />
              <Link to="#"><FormattedMessage id="UI.CONTINUE_SHOPPING" /></Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <MyOrdersContent />
      </Container>
    </Fragment>
  );
}
