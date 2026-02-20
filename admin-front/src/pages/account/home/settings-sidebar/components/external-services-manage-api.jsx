import { FormattedMessage } from "react-intl";
import { Fragment, useState } from 'react';
import { HexagonBadge } from '@/partials/common/hexagon-badge';
import { Copy, User } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ExternalServicesManageApi = ({ title, switch: showSwitch }) => {
  const [apiKeyInput, setApiKeyInput] = useState('abc123xyz456sample789key000');

  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-5.png')}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-5-dark.png')}');
          }
        `}
      </style>
      <Card>
        <CardHeader className="mb-5" id="external_services_manage_api">
          <CardTitle>{title || 'Manage API'}</CardTitle>
          {showSwitch && (
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-update" className="text-sm">
                <FormattedMessage id="UI.PAUSE" />
              </Label>
              <Switch size="sm" id="auto-update" />
            </div>
          )}
        </CardHeader>
        <CardContent className="lg:py-7.5 grid gap-5 lg:gap-7.5">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56 text-foreground font-normal">
              <FormattedMessage id="UI.API_KEY" />
            </Label>
            <InputWrapper>
              <Input
                type="text"
                defaultValue={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />

              <Button
                variant="dim"
                mode="icon"
                className="-me-2"
                onClick={() => navigator.clipboard.writeText(apiKeyInput)}
              >
                <Copy size={16} />
              </Button>
            </InputWrapper>
          </div>
          <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow border border-border rounded-xl gap-2 p-5 rtl:[background-position:-195px_-85px] [background-position:195px_-85px] bg-no-repeat bg-[length:650px] user-access-bg">
            <div className="flex items-center gap-4">
              <HexagonBadge
                stroke="stroke-orange-200 dark:stroke-orange-950"
                fill="fill-orange-50 dark:fill-orange-950/30"
                size="size-[50px]"
                badge={<User size={20} className="text-xl text-orange-400" />}
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center flex-wrap gap-2.5">
                  <Link
                    to="#"
                    className="text-base font-medium text-mono hover:text-primary-active"
                  >
                    <FormattedMessage id="UI.USER_ACCESS" />
                  </Link>
                  <Badge size="sm" variant="secondary" appearance="outline">
                    <FormattedMessage id="UI.16_DAYS_LEFT" />
                  </Badge>
                </div>
                <div className="form-info text-foreground font-normal">
                  <FormattedMessage id="UI.THIS_API_KEY_CAN_ONLY_ACCESS" />{' '}
                  <Button mode="link" asChild>
                    <Link to="https://keenthemes.com/"><FormattedMessage id="UI.KEENTHEMES" /></Link>
                  </Button>
                  <br />
                  <FormattedMessage id="UI.SECURE_ACCESS_WITH_A_UNIQUE_API_KEY_FOR_" />
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
              <Button variant="mono"><FormattedMessage id="UI.RENEW_PLAN" /></Button>
              <Button variant="ghost"><FormattedMessage id="UI.DOCS" /></Button>
            </div>
          </div>
          <p className="text-sm text-foreground">
            <FormattedMessage id="UI.UNLOCK_THE_FULL_POTENTIAL_OF_YOUR_APPLIC" />
          </p>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export { ExternalServicesManageApi };
