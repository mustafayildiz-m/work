import { FormattedMessage } from "react-intl";
import { Rocket } from 'lucide-react';
import { TimelineItem } from './timeline-item';

const ActivitiesProductSpecific = () => {
  return (
    <TimelineItem icon={Rocket} line={false}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.EXPLORED_NICHE_DEMO_IDEAS_FOR_PRODUCTSPE" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.3_WEEKS_AGO_407_PM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesProductSpecific };
