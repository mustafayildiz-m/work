import { FormattedMessage } from "react-intl";
import { Rocket } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesBlogAnniversary = () => {
  return (
    <TimelineItem icon={Rocket} line={false}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.WE_RECENTLY" />
          <Button mode="link" asChild>
            <Link to="#"><FormattedMessage id="UI.CELEBRATED" /></Link>
          </Button>
          <FormattedMessage id="UI.THE_BLOGS_1YEAR_ANNIVERSARY" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.3_WEEKS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesBlogAnniversary };
