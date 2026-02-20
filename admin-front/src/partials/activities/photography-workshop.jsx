import { FormattedMessage } from "react-intl";
import { SquareDashedBottomCode } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineItem } from './timeline-item';

const ActivitiesPhotographyWorkshop = () => {
  return (
    <TimelineItem icon={SquareDashedBottomCode} line={true}>
      <div className="flex flex-col pb-2.5">
        <span className="text-sm text-foreground">
          <FormattedMessage id="UI.JENNY_ATTENDED_A_NATURE_PHOTOGRAPHY_IMME" />
        </span>
        <span className="text-xs text-secondary-foreground">
          <FormattedMessage id="UI.3_DAYS_AGO_1145_AM" />
        </span>
      </div>
      <Card className="shadow-none">
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-5 shrink-0">
                <div className="border border-orange-200 rounded-lg  max-h-20">
                  <div className="flex items-center justify-center border-b border-b-orange-200 bg-orange-50 dark:border-orange-950 dark:bg-orange-950/30 rounded-t-lg">
                    <span className="text-sm text-orange-400 font-medium p-2">
                      <FormattedMessage id="UI.APR" />
                    </span>
                  </div>
                  <div className="flex items-center justify-center size-12">
                    <span className="font-medium text-foreground text-xl tracking-tight">
                      02
                    </span>
                  </div>
                </div>
                <img
                  src={toAbsoluteUrl('/media/images/600x400/8.jpg')}
                  className="rounded-lg max-h-20 max-w-full"
                  alt="image"
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  mode="link"
                  asChild
                  className="text-xs text-orange-400 leading-[14px] hover:text-primary-active mb-px"
                >
                  <Link to="#"><FormattedMessage id="UI.NATURE_PHOTOGRAPHY_IMMERSION" /></Link>
                </Button>
                <Button
                  mode="link"
                  asChild
                  className="text-base font-medium hover:text-primary text-mono leading-4"
                >
                  <Link to="#"><FormattedMessage id="UI.NATURE_PHOTOGRAPHY_IMMERSION" /></Link>
                </Button>
                <p className="text-xs text-foreground leading-[22px]">
                  <FormattedMessage id="UI.ENHANCE_YOUR_NATURE_PHOTOGRAPHY_SKILLS_I" />
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TimelineItem>
  );
};

export { ActivitiesPhotographyWorkshop };
