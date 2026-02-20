import { FormattedMessage } from "react-intl";
import { Download } from 'lucide-react';
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

export default function Item8() {
  return (
    <div className="flex grow gap-2.5 px-5">
      <Avatar>
        <AvatarImage src="/media/avatars/300-12.png" alt="avatar" />
        <AvatarFallback><FormattedMessage id="UI.CH" /></AvatarFallback>
        <AvatarIndicator className="-end-1.5 -bottom-1.5">
          <AvatarStatus variant="online" className="size-2.5" />
        </AvatarIndicator>
      </Avatar>
      <div className="flex flex-col gap-3.5 grow">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-px">
            <Link to="#" className="hover:text-primary text-mono font-semibold">
              <FormattedMessage id="UI.SKYLAR_FROST" />
            </Link>
            <span className="text-secondary-foreground">
              {' '}
              <FormattedMessage id="UI.UPLOADED_2_ATTACHMENTS" />{' '}
            </span>
          </div>
          <span className="flex items-center text-xs font-medium text-muted-foreground">
            <FormattedMessage id="UI.3_DAYS_AGO" />
            <span className="rounded-full size-1 bg-mono/30 mx-1.5"></span>
            <FormattedMessage id="UI.WEB_DESIGN" />
          </span>
        </div>

        <Card className="shadow-none flex items-center justify-between flex-row gap-1.5 p-2.5 rounded-lg bg-muted/70">
          <div className="flex items-center gap-1.5">
            <img
              src={toAbsoluteUrl('/media/file-types/word.svg')}
              className="h-5"
              alt="image"
            />

            <span className="font-medium text-secondary-foreground text-xs me-1">
              <FormattedMessage id="UI.LANDINGPAGEVER1DOCX" />
            </span>
            <span className="font-medium text-muted-foreground text-xs">
              <FormattedMessage id="UI.UPLOAD_3_DAYS_AGO" />
            </span>
          </div>
          <Download size={16} className="text-muted-foreground text-md" />
        </Card>

        <Card className="shadow-none flex items-center justify-between flex-row gap-1.5 p-2.5 rounded-lg bg-muted/70">
          <div className="flex items-center gap-1.5">
            <img
              src={toAbsoluteUrl('/media/file-types/word.svg')}
              className="h-5"
              alt="image"
            />

            <span className="font-medium hover:text-primary text-secondary-foreground text-xs me-1">
              <FormattedMessage id="UI.LANDINGPAGEVER2DOCX" />
            </span>
            <span className="font-medium text-muted-foreground text-xs">
              <FormattedMessage id="UI.UPLOAD_3_DAYS_AGO" />
            </span>
          </div>

          <Download size={16} className="text-muted-foreground text-md" />
        </Card>
      </div>
    </div>
  );
}
