import { FormattedMessage } from "react-intl";
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesInterview = () => {
  return (
    <TimelineItem icon={LogIn} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.I_HAD_THE_PRIVILEGE_OF_INTERVIEWING_AN_I" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/blogger">
              <FormattedMessage id="UI.UPCOMING_BLOG_POST" />
            </Link>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.2_DAYS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesInterview };
