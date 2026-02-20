import { FormattedMessage } from "react-intl";
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ShippingDate = () => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-start grow gap-2 w-full">
        <span className="form-info text-xs text-mono font-medium">
          <FormattedMessage id="UI.SHIPPING_DATE" />
        </span>

        <Input id="active" type="text" placeholder="Active" />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox />
        <Label><FormattedMessage id="UI.SEND" /></Label>
        <Button mode="link" asChild>
          <Link to="#" className="text-xs font-medium">
            <FormattedMessage id="UI.SHIPPING_INFO" />
          </Link>
        </Button>
        <Label><FormattedMessage id="UI.TO_CUSTOMER" /></Label>
      </div>
    </div>
  );
};
