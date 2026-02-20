import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { HexagonBadge } from '@/partials/common/hexagon-badge';
import { ScrollText } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Upgrade = () => {
  return (
    <Fragment>
      <style>
        {`
          .upgrade-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-14.png')}');
          }
          .dark .upgrade-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-14-dark.png')}');
          }
        `}
      </style>
      <Card className="rounded-xl">
        <div className="flex items-center justify-between grow gap-5 p-5 rtl:bg-[center_left_-8rem] bg-[center_right_-8rem] bg-no-repeat bg-[length:700px] upgrade-bg">
          <div className="flex items-center gap-4">
            <HexagonBadge
              stroke="stroke-blue-200 dark:stroke-blue-950"
              fill="fill-blue-50 dark:fill-blue-950/30"
              size="size-[50px]"
              badge={<ScrollText className="text-xl text-blue-400" />}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Link
                  to="#"
                  className="text-base font-medium text-mono hover:text-primary-active"
                >
                  <FormattedMessage id="UI.UPGRADE_YOUR_COMPONENTSIO_TO_ENTERPRISE" />
                </Link>
                <Badge variant="destructive" appearance="outline">
                  <FormattedMessage id="UI.TRIAL_EXPIRES_IN_29_DAYS" />
                </Badge>
              </div>
              <div className="text-sm text-secondary-foreground">
                <FormattedMessage id="UI.ENTERPRISE_COMPONENTSIO_IS_A_WEBSITE_OFF" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost">
              <Link to="#"><FormattedMessage id="UI.CANCEL_TRIAL" /></Link>
            </Button>
            <Button variant="mono">
              <Link to="#"><FormattedMessage id="UI.UPGRADE_NOW" /></Link>
            </Button>
          </div>
        </div>
      </Card>
    </Fragment>
  );
};

export { Upgrade };
