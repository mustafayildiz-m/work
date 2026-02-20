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
import { Card } from '@/components/ui/card';

export default function Item4() {
  return (
    <div className="flex grow gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-10.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="offline" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-3.5 grow">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.JANE_PEREZ" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.INVITES_YOU_TO_REVIEW_A_FILE" />{' '}
            </span>
          </div>

          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.3_HOURS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.742KB" />
          </span>
        </div>

        <Card className="shadow-none flex items-center flex-row gap-1.5 p-2.5 rounded-lg bg-muted/70">
          <img
            src={toAbsoluteUrl('/media/file-types/pdf.svg')}
            className="h-5"
            alt="image"
          />

          <Link
            to="#"
            className="hover:text-primary font-medium text-secondary-foreground text-xs me-1"
          >
            <FormattedMessage id="UI.LAUNCH_NOV24PPTX" />
          </Link>
          <span className="font-medium text-muted-foreground text-xs">
            <FormattedMessage id="UI.EDITED_39_MINS_AGO" />
          </span>
        </Card>
      </div>
    </div>
  );
}
