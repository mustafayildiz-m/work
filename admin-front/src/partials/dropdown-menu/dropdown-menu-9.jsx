import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Award, Coffee, Info, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { GiveAwardDialog } from '../dialogs/give-award-dialog';
import { ReportUserDialog } from '../dialogs/report-user-dialog';
import { ShareProfileDialog } from '../dialogs/share-profile';

export function DropdownMenu9({ trigger }) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleShareDialogClose = () => {
    setIsShareDialogOpen(false);
  };

  const handleAwardDialogClose = () => {
    setIsAwardDialogOpen(false);
  };

  const handleReportDialogClose = () => {
    setIsReportDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-[210px]" side="bottom" align="end">
          <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
            <Coffee />
            <span><FormattedMessage id="UI.SHARE_PROFILE" /></span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsAwardDialogOpen(true)}>
            <Award />
            <span><FormattedMessage id="UI.GIVE_AWARD" /></span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center justify-between gap-2"
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            <TrendingUp />
            <div className="grow flex items-center justify-between gap-2">
              <span><FormattedMessage id="UI.STAY_UPDATED" /></span>
              <Switch size="sm"></Switch>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
            <Info />
            <span><FormattedMessage id="UI.REPORT_USER" /></span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareProfileDialog
        open={isShareDialogOpen}
        onOpenChange={handleShareDialogClose}
      />
      <GiveAwardDialog
        open={isAwardDialogOpen}
        onOpenChange={handleAwardDialogClose}
      />
      <ReportUserDialog
        open={isReportDialogOpen}
        onOpenChange={handleReportDialogClose}
      />
    </>
  );
}
