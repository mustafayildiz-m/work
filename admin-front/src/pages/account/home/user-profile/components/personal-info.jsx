import { FormattedMessage } from "react-intl";
import { AvatarInput } from '@/partials/common/avatar-input';
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const PersonalInfo = () => {
  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.PERSONAL_INFO" /></CardTitle>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto pb-3 p-0">
        <Table className="align-middle text-sm text-muted-foreground">
          <TableBody>
            <TableRow>
              <TableCell className="py-2 min-w-28 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PHOTO" />
              </TableCell>
              <TableCell className="py-2 text-gray700 font-normal min-w-32 text-sm">
                <FormattedMessage id="UI.150X150PX_JPEG_PNG_IMAGE" />
              </TableCell>
              <TableCell className="py-2 text-center">
                <div className="flex justify-center items-center">
                  <AvatarInput />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.NAME" />
              </TableCell>
              <TableCell className="py-2 text-foreground font-normaltext-sm">
                <FormattedMessage id="UI.JASON_TATUM" />
              </TableCell>
              <TableCell className="py-2 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.AVAILABILITY" />
              </TableCell>
              <TableCell className="py-3 text-foreground font-normal">
                <Badge size="md" variant="success" appearance="outline">
                  <FormattedMessage id="UI.AVAILABLE_NOW" />
                </Badge>
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.BIRTHDAY" />
              </TableCell>
              <TableCell className="py-3 text-secondary-foreground text-sm font-normal">
                <FormattedMessage id="UI.28_MAY_1996" />
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.GENDER" />
              </TableCell>
              <TableCell className="py-3 text-secondary-foreground text-sm font-normal">
                <FormattedMessage id="UI.MALE" />
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3"><FormattedMessage id="UI.ADDRESS" /></TableCell>
              <TableCell className="py-3 text-secondary-foreground text-sm font-normal">
                <FormattedMessage id="UI.YOU_HAVE_NO_AN_ADDRESS_YET" />
              </TableCell>
              <TableCell className="py-3 text-center">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="#"><FormattedMessage id="UI.ADD" /></Link>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { PersonalInfo };
