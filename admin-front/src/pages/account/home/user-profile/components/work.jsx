import { FormattedMessage } from "react-intl";
import { SquarePen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const Work = () => {
  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.WORK" /></CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-update" className="text-sm">
            <FormattedMessage id="UI.AVAILABLE_NOW" />
          </Label>
          <Switch defaultChecked size="sm" />
        </div>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto pb-3 p-0">
        <Table className="align-middle text-sm text-muted-foreground">
          <TableBody>
            <TableRow>
              <TableCell className="py-2 min-w-36text-secondary-foreground font-normal">
                <FormattedMessage id="UI.LANGUAGE" />
              </TableCell>
              <TableCell className="py-2 min-w-72 w-full text-foreground font-normal">
                <FormattedMessage id="UI.ENGLISH" />{' '}
                <span className="text-secondary-foreground font-normal">
                  <FormattedMessage id="UI.FLUENT" />
                </span>
              </TableCell>
              <TableCell className="py-2 text-end min-w-24">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.HOURLY_RATE" />
              </TableCell>
              <TableCell className="py-2 text-foreground font-normal">
                <FormattedMessage id="UI.28__HOUR" />
              </TableCell>
              <TableCell className="py-2 text-end">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2text-secondary-foreground font-normal">
                <FormattedMessage id="UI.AVAIBILATY" />
              </TableCell>
              <TableCell className="py-2 text-foreground font-normal">
                <FormattedMessage id="UI.32_HOURS_A_WEEK" />
              </TableCell>
              <TableCell className="py-2 text-end">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.SKILLS" />
              </TableCell>
              <TableCell className="py-3 text-secondary-foreground">
                <div className="flex flex-wrap gap-2.5">
                  <Badge variant="secondary"><FormattedMessage id="UI.WEB_DESIGN" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.CODE_REVIEW" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.NOCODE" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.UX" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.FIGMA" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.WEBFLOW" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.AI" /></Badge>
                  <Badge variant="secondary"><FormattedMessage id="UI.MANAGEMENT" /></Badge>
                </div>
              </TableCell>
              <TableCell className="py-3 text-end">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.ABOUT" />
              </TableCell>
              <TableCell className="py-4 text-foreground font-normal">
                <FormattedMessage id="UI.WERE_OPEN_TO_PARTNERSHIPS_GUEST_POSTS_AN" /> <br />
                <FormattedMessage id="UI.MORE_JOIN_US_TO_SHARE_YOUR_INSIGHTS_AND_" /> <br />
                <FormattedMessage id="UI.YOUR_AUDIENCE" />
              </TableCell>
              <TableCell className="py-4 text-end">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { Work };
