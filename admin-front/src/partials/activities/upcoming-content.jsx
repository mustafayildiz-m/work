import { FormattedMessage } from "react-intl";
import { Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesUpcomingContent = () => {
  return (
    <TimelineItem icon={Share2} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.I_COULDNT_RESIST_SHARING_A_SNEAK_PEEK_OF" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/blogger"><FormattedMessage id="UI.UPCOMING_CONTENT" /></Link>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.5_DAYS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesUpcomingContent };
