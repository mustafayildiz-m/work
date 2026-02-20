import { FormattedMessage } from "react-intl";
import { CircleCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Item9() {
  return (
    <div className="flex gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-21.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.SELENE_SILVERLEAF" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.CREATED_A_TASKS_IN" />{' '}
            </span>
            <Link to="#" className="hover:text-primary text-primary">
              <FormattedMessage id="UI.DESIGN_PROJECT" />
            </Link>
          </div>

          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.4_DAYS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.MANAGER" />
          </span>
        </div>

        <div className="grid gap-1.5">
          <Badge
            size="sm"
            variant="success"
            appearance="outline"
            className="text-green-500 me-1 text-xs"
          >
            <CircleCheck /> <FormattedMessage id="UI.FEATURE_PRIORITIZATION" />
          </Badge>
          <Badge
            size="sm"
            variant="secondary"
            appearance="outline"
            className="text-secondary-foreground me-1 text-xs"
          >
            <CircleCheck /> <FormattedMessage id="UI.LAST_MONTH_USER_RESEARCH" />
          </Badge>
        </div>
      </div>
    </div>
  );
}
