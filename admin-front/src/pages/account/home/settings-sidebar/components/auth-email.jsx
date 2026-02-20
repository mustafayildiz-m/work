import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AuthEmail = () => {
  const [emailInput, setEmailInput] = useState('jason@studio.io');

  return (
    <Card className="pb-2.5">
      <CardHeader id="auth_email">
        <CardTitle><FormattedMessage id="UI.EMAIL" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 pt-7.5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56"><FormattedMessage id="UI.EMAIL" /></Label>
            <div className="flex flex-col items-start grow gap-7.5 w-full">
              <Input
                className="input"
                type="text"
                defaultValue={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />

              <div className="flex items-center gap-7.5">
                <Label
                  htmlFor="auto-update"
                  className="text-foreground text-sm"
                >
                  <FormattedMessage id="UI.ACTIVE" />
                </Label>
                <Switch defaultChecked size="sm" />
                <Label
                  htmlFor="auto-update"
                  className="text-foreground text-sm"
                >
                  <FormattedMessage id="UI.PRIMARY" />
                </Label>
                <Switch size="sm" />
              </div>
              <span className="form-info text-foreground text-sm font-normal">
                <FormattedMessage id="UI.INPUT_YOUR_EMAIL_DESIGNATE_AS_PRIMARY_FO" />
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AuthEmail };
