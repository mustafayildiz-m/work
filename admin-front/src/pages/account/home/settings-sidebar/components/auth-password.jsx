import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AuthPassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <Card>
      <CardHeader id="auth_password">
        <CardTitle><FormattedMessage id="UI.PASSWORD" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CURRENT_PASSWORD" /></Label>
            <Input
              type="password"
              placeholder="Your current password"
              defaultValue={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56"><FormattedMessage id="UI.NEW_PASSWORD" /></Label>
            <Input
              type="password"
              placeholder="New password"
              defaultValue={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CONFIRM_NEW_PASSWORD" /></Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              defaultValue={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2.5">
          <Button><FormattedMessage id="UI.RESET_PASSWORD" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AuthPassword };
