import { FormattedMessage } from "react-intl";
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesNewArticle = () => {
  return (
    <TimelineItem icon={Users} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.POSTED_A_NEW_ARTICLE" />{' '}
          <Button mode="link" asChild>
            <Link to="/public-profile/profiles/blogger">
              <FormattedMessage id="UI.TOP_10_TECH_TRENDS" />
            </Link>
          </Button>
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.TODAY_900_AM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesNewArticle };
