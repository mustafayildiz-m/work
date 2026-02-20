import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const InviteWithLink = () => {
  const [linkInput, setLinkInput] = useState(
    'https://www.ktstudio.com/RSVP?c=12345XYZt',
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.INVITE_WITH_LINK" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-32"><FormattedMessage id="UI.LINK" /></Label>
          <div className="flex flex-col items-start grow gap-5">
            <InputWrapper>
              <Input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />

              <Button variant="dim" mode="icon" className="-me-2">
                <Copy size={16} />
              </Button>
            </InputWrapper>
            <Button variant="outline">
              <RefreshCw size={12} />
              <FormattedMessage id="UI.RESET_LINK" />
            </Button>
          </div>
        </div>
        <p className="text-foreground text-sm">
          <FormattedMessage id="UI.CLICK_BELOW_TO_RSVP_FOR_OUR_EXCLUSIVE_EV" />
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button>
          <Link to="#"><FormattedMessage id="UI.INVITE_PEOPLE" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { InviteWithLink };
