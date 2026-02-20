import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Captions } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { OrderPlacedContent } from '.';
import { Steps } from '../steps';

export function OrderPlacedPage() {
  return (
    <Fragment>
      <Steps currentStep={3} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <FormattedMessage id="UI.YOUR_PURCHASE_HAS_BEEN_SUCCESSFULLY_COMP" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <Captions />
              <Link to="/store-client/my-orders"><FormattedMessage id="UI.MY_ORDERS" /></Link>
            </Button>
            <Button>
              <Captions />
              <Link to="/store-client/my-orders"><FormattedMessage id="UI.CONTINUE_SHOPPING" /></Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <OrderPlacedContent />
      </Container>
    </Fragment>
  );
}
