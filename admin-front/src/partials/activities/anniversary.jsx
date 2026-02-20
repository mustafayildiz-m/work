import { FormattedMessage } from "react-intl";
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesAnniversary = () => {
  return (
    <TimelineItem icon={Trophy} line={false} removeSpace={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.WE_RECENTLY" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/nft"><FormattedMessage id="UI.CELEBRATED" /></Link>
          </Button>{' '}
          <FormattedMessage id="UI.THE_BLOGS_1YEAR_ANNIVERSARY" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.3_MONTHS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesAnniversary };
