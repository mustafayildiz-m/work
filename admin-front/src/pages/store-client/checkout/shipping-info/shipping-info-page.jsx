import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { MapPinned } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ShippingInfoContent } from '.';
import { Steps } from '../steps';

export function ShippingInfoPage() {
  return (
    <Fragment>
      <Steps currentStep={1} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <FormattedMessage id="UI.ENTER_AND_CONFIRM_YOUR_DELIVERY_ADDRESS" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <MapPinned />
              <Link to="#"><FormattedMessage id="UI.ADD_ADDRESS" /></Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ShippingInfoContent />
      </Container>
    </Fragment>
  );
}
