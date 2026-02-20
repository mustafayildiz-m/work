import { FormattedMessage } from "react-intl";
import { BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesVirtualTeam = () => {
  return (
    <TimelineItem icon={BadgeCheck} line={false}>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-foreground">
          <FormattedMessage id="UI.HOSTED_A_VIRTUAL" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/creator">
              <FormattedMessage id="UI.TEAMBUILDING_EVENT" />
            </Link>
          </Button>
          <FormattedMessage id="UI._FOSTERING_COLLABORATION_AND_STRENGTHENI" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          <FormattedMessage id="UI.1_MONTH_AGO_1356_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesVirtualTeam };
