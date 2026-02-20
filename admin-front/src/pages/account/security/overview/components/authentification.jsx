import { FormattedMessage } from "react-intl";
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const Authentification = () => {
  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.AUTHENTICATION" /></CardTitle>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto pb-3 p-0">
        <Table className="align-middle text-sm text-muted-foreground">
          <TableBody>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PASSWORD" />
              </TableCell>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PASSWORD_LAST_CHANGED_2_MONTHS_AGO" />
              </TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.2FA" />
              </TableCell>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.TO_BE_SET" />
              </TableCell>
              <TableCell className="text-end">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="#"><FormattedMessage id="UI.SETUP" /></Link>
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><FormattedMessage id="UI.SIGNIN_WITH" /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                      className="size-4"
                      alt="image"
                    />
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/facebook.svg')}
                      className="size-4"
                      alt="image"
                    />
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')}
                      className="dark:hidden size-4"
                      alt="image"
                    />

                    <img
                      src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')}
                      className="light:hidden size-4"
                      alt="image"
                    />
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-end">
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

export { Authentification };
