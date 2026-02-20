import { FormattedMessage } from "react-intl";
import { Copy, SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const AccountSettings = () => {
  return (
    <Card className="min-w-full">
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.ACCOUNT_SETTINGS" /></CardTitle>
      </CardHeader>
      <CardContent className="kt-scrollable-x-auto pb-3 p-0">
        <Table className="align-middle text-sm text-muted-foreground">
          <TableBody>
            <TableRow>
              <TableCell className="py-2 min-w-56 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.EMAIL" />
              </TableCell>
              <TableCell className="py-2 min-w-60 w-full">
                <Link
                  to="#"
                  className="text-foreground text-sm font-normal hover:text-primary-active"
                >
                  <FormattedMessage id="UI.JOHNDOEHEXLADIO" />
                </Link>
              </TableCell>
              <TableCell className="py-2 min-w-28 text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-2 text-secondary-foreground font-normal">
                <FormattedMessage id="UI.PASSWORD" />
              </TableCell>
              <TableCell className="py-2 text-secondary-foreground  font-normal text-sm">
                <FormattedMessage id="UI.PASSWORD_LAST_CHANGED_2_MONTHS_AGO" />
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.SIGNIN_WITH" />
              </TableCell>
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
                      className="dark:hidden h-4"
                      alt="image"
                    />

                    <img
                      src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')}
                      className="light:hidden h-4"
                      alt="image"
                    />
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="#"><FormattedMessage id="UI.SETUP" /></Link>
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.TEAM_ACCOUNT" />
              </TableCell>
              <TableCell className="text-secondary-foreground text-sm font-normal">
                <FormattedMessage id="UI.TO_BE_SET" />
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.SOCIAL_PROFILES" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/linkedin.svg')}
                      className="size-4"
                      alt="image"
                    />
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl(
                        '/media/brand-logos/twitch-purple.svg',
                      )}
                      className="size-4"
                      alt="image"
                    />
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/x.svg')}
                      className="dark:hidden size-4"
                      alt="image"
                    />

                    <img
                      src={toAbsoluteUrl('/media/brand-logos/x-dark.svg')}
                      className="light:hidden size-4"
                      alt="image"
                    />
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-center size-8 bg-background rounded-full border border-input"
                  >
                    <img
                      src={toAbsoluteUrl('/media/brand-logos/dribbble.svg')}
                      className="size-4"
                      alt="image"
                    />
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" mode="icon">
                  <SquarePen size={16} className="text-blue-500" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-secondary-foreground font-normal">
                <FormattedMessage id="UI.REFERRAL_LINK" />
              </TableCell>
              <TableCell className="text-foreground text-sm font-normal">
                <div className="flex items-center gap-0.5">
                  <Link
                    to="#"
                    className="text-secondary-foreground text-sm hover:text-primary-active"
                  >
                    <FormattedMessage id="UI.HTTPSSTUDIOCOW3GVQOI35DT" />
                  </Link>
                  <Button variant="dim" mode="icon">
                    <Copy size={16} />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button mode="link" underlined="dashed" asChild>
                  <Link to="#"><FormattedMessage id="UI.RECREATE" /></Link>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { AccountSettings };
