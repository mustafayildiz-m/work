import { FormattedMessage } from "react-intl";
import { Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesFollowersMilestone = () => {
  return (
    <TimelineItem icon={Coffee} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-mono">
          <FormattedMessage id="UI.REACHING_THE_MILESTONE_OF" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/feeds"><FormattedMessage id="UI.10000_FOLLOWERS" /></Link>
          </Button>{' '}
          <FormattedMessage id="UI.ON_THE_BLOG_WAS_A_DREAM_COME_TRUE" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.5_DAYS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesFollowersMilestone };
