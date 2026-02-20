import { FormattedMessage } from "react-intl";
import { UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export default function Item19() {
  return (
    <div className="flex grow gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-17.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-2.5 grow">
        <div className="flex flex-col gap-1 mb-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.AARON_FOSTER" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.REQUESTED_TO_VIEW" />{' '}
            </span>
          </div>
          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.3_DAY_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.LARSEN_LTD" />
          </span>
        </div>

        <Card className="kt-card shadow-none flex items-center flex-row gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/70">
          <UserRoundCheck size={16} className="text-green-500 text-base" />
          <span className="font-medium text-green-500 text-sm">
            <FormattedMessage id="UI.YOU_ALLOWED_AARON_TO_VIEW" />
          </span>
        </Card>
      </div>
    </div>
  );
}
