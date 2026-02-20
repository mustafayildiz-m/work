import { FormattedMessage } from "react-intl";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Password = () => {
  return (
    <Card className="pb-2.5">
      <CardHeader id="password_settings">
        <CardTitle><FormattedMessage id="UI.PASSWORD" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CURRENT_PASSWORD" /></Label>
          <Input type="text" placeholder="Your current password" />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.NEW_PASSWORD" /></Label>
          <Input type="text" placeholder="New password" />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CONFIRM_NEW_PASSWORD" /></Label>
          <Input type="text" placeholder="Confirm new password" />
        </div>
        <div className="flex justify-end">
          <Button><FormattedMessage id="UI.RESET_PASSWORD" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { Password };
