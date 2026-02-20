import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Item16() {
  return (
    <div className="flex grow gap-2 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-29.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-3 grow">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.ETHAN_PARKER" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.CREATED_A_NEW_TASKS_TO" />{' '}
            </span>
            <Link to="#" className="hover:text-primary text-primary">
              <FormattedMessage id="UI.SITE_SCULPT" />
            </Link>
            <span className="text-secondary-foreground"> <FormattedMessage id="UI.PROJECT" /></span>
          </div>
          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.3_DAYS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.WEB_DESIGNER" />
          </span>
        </div>

        <div className="kt-card shadow-none p-3.5 gap-3.5 rounded-lg bg-muted/70">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-mono text-xs">
                <FormattedMessage id="UI.LOCATION_HISTORY_IS_ERASED_AFTER_LOGGING" />
              </span>
              <span className="font-medium text-muted-foreground text-xs">
                <FormattedMessage id="UI.DUE_DATE_15_MAY_2024" />
              </span>
            </div>

            <div className="flex -space-x-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={toAbsoluteUrl('/media/avatars/300-3.png')}
                  alt="image"
                />

                <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
              </Avatar>
              <Avatar className="size-6">
                <AvatarImage
                  src={toAbsoluteUrl('/media/avatars/300-2.png')}
                  alt="image"
                />

                <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge size="sm" variant="success" appearance="outline">
              <FormattedMessage id="UI.IMPROVEMENT" />
            </Badge>
            <Badge size="sm" variant="destructive" appearance="outline">
              <FormattedMessage id="UI.BUG" />
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
