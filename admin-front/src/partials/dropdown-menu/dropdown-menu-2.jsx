import { FormattedMessage } from "react-intl";
import { CloudCog, FileInput, Settings, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DropdownMenu2({ trigger }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]" side="bottom" align="end">
        <DropdownMenuItem asChild>
          <Link to="/account/home/settings-enterprise">
            <Settings />
            <span><FormattedMessage id="UI.SETTINGS" /></span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/members/import-members">
            <FileInput />
            <span><FormattedMessage id="UI.IMPORT" /></span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/activity">
            <CloudCog />
            <span><FormattedMessage id="UI.ACTIVITY" /></span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="#">
            <ThumbsDown />
            <span><FormattedMessage id="UI.REPORT" /></span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
