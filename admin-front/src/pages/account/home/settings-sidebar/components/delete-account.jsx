import { FormattedMessage } from "react-intl";
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const DeleteAccount = () => {
  return (
    <Card>
      <CardHeader id="delete_account">
        <CardTitle><FormattedMessage id="UI.DELETE_ACCOUNT" /></CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:py-7.5 lg:gap-7.5 gap-3">
        <div className="flex flex-col gap-5">
          <div className="text-sm text-foreground">
            <FormattedMessage id="UI.WE_REGRET_TO_SEE_YOU_LEAVE_CONFIRM_ACCOU" />{' '}
            <Button mode="link" asChild>
              <Link to="#"><FormattedMessage id="UI.SETUP_GUIDELINES" /></Link>
            </Button>{' '}
            <FormattedMessage id="UI.IF_YOU_STILL_WISH_CONTINUE" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox />
            <Label><FormattedMessage id="UI.CONFIRM_DELETING_ACCOUNT" /></Label>
          </div>
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline">
            <Link to="#"><FormattedMessage id="UI.DEACTIVATE_INSTEAD" /></Link>
          </Button>
          <Button variant="destructive">
            <Link to="#"><FormattedMessage id="UI.DELETE_ACCOUNT" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { DeleteAccount };
