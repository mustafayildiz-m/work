import { FormattedMessage } from "react-intl";
import { Users } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { TimelineItem } from './timeline-item';

const ActivitiesNewProduct = () => {
  return (
    <TimelineItem icon={Users} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.JENNY_SENT_AN" />{' '}
          <Button mode="link" asChild>
            <Link to="#"><FormattedMessage id="UI.INQUIRY" /></Link>
          </Button>{' '}
          <FormattedMessage id="UI.ABOUT_A" />{' '}
          <Button mode="link" asChild>
            <Link to="#"><FormattedMessage id="UI.NEW_PRODUCT_1" /></Link>
          </Button>{' '}.
                  </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.TODAY_900_AM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesNewProduct };
