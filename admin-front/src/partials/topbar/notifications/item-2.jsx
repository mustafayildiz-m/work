import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Item2() {
  return (
    <div className="flex grow gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-5.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.LESLIE_ALEXANDER" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.ADDED_NEW_TAGS_TO" />{' '}
            </span>
            <Link to="#" className="hover:text-primary text-primary">
              <FormattedMessage id="UI.WEB_REDESIGN_2024" />
            </Link>
          </div>

          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.53_MINS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.ACME" />
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Badge size="sm" variant="info" appearance="outline">
            <FormattedMessage id="UI.CLIENTREQUEST" />
          </Badge>
          <Badge size="sm" variant="warning" appearance="outline">
            <FormattedMessage id="UI.FIGMA" />
          </Badge>
          <Badge size="sm" variant="secondary" appearance="outline">
            <FormattedMessage id="UI.REDESIGN" />
          </Badge>
        </div>
      </div>
    </div>
  );
}
