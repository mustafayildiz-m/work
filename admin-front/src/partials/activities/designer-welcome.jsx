import { FormattedMessage } from "react-intl";
import { ChartSpline } from 'lucide-react';
import { TimelineItem } from './timeline-item';

const ActivitiesDesignerWelcome = () => {
  return (
    <TimelineItem icon={ChartSpline} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-foreground">
          <FormattedMessage id="UI.ONBOARDED_A_TALENTED_DESIGNER_TO_OUR_CRE" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.2_WEEKS_AGO_1045_AM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesDesignerWelcome };
