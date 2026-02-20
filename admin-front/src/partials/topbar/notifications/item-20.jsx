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
import { Button } from '@/components/ui/button';

export default function Item20() {
  return (
    <div className="flex grow gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-9.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-2.5 grow">
        <div className="flex flex-col gap-1 mb-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.GABRIEL_BENNETT" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.STARTED_CONNECT_YOU" />{' '}
            </span>
          </div>
          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.3_DAY_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.DEVELOPMENT" />
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button size="sm" variant="outline">
            <CircleCheck /> <FormattedMessage id="UI.CONNECTED" />
          </Button>
          <Button size="sm" variant="mono">
            <FormattedMessage id="UI.GO_TO_PROFILE" />
          </Button>
        </div>
      </div>
    </div>
  );
}
