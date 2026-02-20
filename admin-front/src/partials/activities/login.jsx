import { FormattedMessage } from "react-intl";
import { LogIn } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesLogin = () => {
  return (
    <TimelineItem icon={LogIn} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.JENNYS_LAST_LOGIN_TO_THE" />{' '}
          <Button mode="link" asChild>
            <Link to="#"><FormattedMessage id="UI.CUSTOMER_PORTAL" /></Link>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.5_DAYS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesLogin };
