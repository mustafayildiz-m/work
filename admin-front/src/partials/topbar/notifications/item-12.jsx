import { FormattedMessage } from "react-intl";
import { Heart, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function Item12() {
  return (
    <div className="flex grow gap-2.5 px-5">
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
              <FormattedMessage id="UI.CREATED_MESSAGE_TO" />{' '}
            </span>
            <Link to="#" className="hover:text-primary text-primary">
              <FormattedMessage id="UI.SITESCULPT" />
            </Link>
            <span className="text-secondary-foreground"> <FormattedMessage id="UI.PROJECT" /> </span>
          </div>
          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.4_DAYS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.MANAGER" />
          </span>
        </div>

        <Card className="shadow-none flex flex-col gap-2.5 p-3.5 rounded-lg">
          <div className="font-semibold text-mono text-sm"><FormattedMessage id="UI.DASHBOARDS" /></div>
          <p className="font-medium text-secondary-foreground text-sm mb-1 leading-5">
            <FormattedMessage id="UI.HELLO_EVERYONE_QUESTION_REGARDING_THE_PR" />
            <br />
            <FormattedMessage id="UI.NEW_DASHBOARDS_THE_UPDATE_IS_COMING_SOON" />
          </p>

          <div className="flex items-center gap-2.5">
            <Badge
              size="sm"
              variant="primary"
              appearance="outline"
              className="text-primary me-1 text-sm"
            >
              <Mail /> <FormattedMessage id="UI.26_COMMENTS" />
            </Badge>
            <Badge
              size="sm"
              variant="secondary"
              appearance="outline"
              className="text-muted-foreground me-1 text-sm"
            >
              <Heart /> <FormattedMessage id="UI.13_LIKES" />
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
