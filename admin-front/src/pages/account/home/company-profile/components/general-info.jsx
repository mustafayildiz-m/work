import { FormattedMessage } from "react-intl";
import { Copy, SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const GeneralInfo = () => {
  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.GENERAL_INFO" /></CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-update" className="text-sm">
            <FormattedMessage id="UI.PUBLIC_PROFILE" />
          </Label>
          <Switch defaultChecked size="sm" />
        </div>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto pb-3 p-0">
        <Table
          className="align-middle text-sm text-muted-foreground"
          id="general_info_table"
        >
          <TableBody>
            <TableRow>
              <TableCell className="min-w-56 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.COMPANY_NAME" />
              </TableCell>
              <TableCell className="min-w-48 w-full text-foreground font-normal">
                <FormattedMessage id="UI.HEXLAB" />
              </TableCell>
              <TableCell className="min-w-16 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PHONE_NUMBER" />
              </TableCell>
              <TableCell className="text-foreground font-normal">
                +1 555-1234
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.VAT_NUMBER" />
              </TableCell>
              <TableCell className="text-foreground font-normal">
                <Badge size="md" variant="destructive" appearance="outline">
                  <FormattedMessage id="UI.MISSING_DETAILS" />
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="#"><FormattedMessage id="UI.ADD" /></Link>
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.REGISTRATION_NUMBER" />
              </TableCell>
              <TableCell className="text-foreground font-normal">
                <FormattedMessage id="UI.IYS2023A56789" />
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.REMOTE_COMPANY_ID" />
              </TableCell>
              <TableCell className="text-foreground text-sm font-normal">
                <div className="flex items-center gap-0.5">
                  <FormattedMessage id="UI.CID78901BXT2023" />
                  <Button variant="ghost" mode="icon">
                    <Copy size={16} />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center">
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

export { GeneralInfo };
