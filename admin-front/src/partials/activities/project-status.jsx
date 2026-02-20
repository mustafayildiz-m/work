import { FormattedMessage } from "react-intl";
import { Rocket } from 'lucide-react';
import { TimelineItem } from './timeline-item';

const ActivitiesProjectStatus = () => {
  return (
    <TimelineItem icon={Rocket} line={false}>
      <div className="flex flex-col">
        <div className="text-sm text-mono">
          <FormattedMessage id="UI.COMPLETED_PHASE_ONE_OF_CLIENT_PROJECT_AH" />
        </div>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.6_DAYS_AGO_1045_AM" />
        </span>
      </div>
    </TimelineItem>
  );
};

export { ActivitiesProjectStatus };
