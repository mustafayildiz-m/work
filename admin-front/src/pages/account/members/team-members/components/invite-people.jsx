import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { SquarePlus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const InvitePeople = () => {
  const [emailInput, setEmailInput] = useState('jason@studio.io');
  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.INVITE_PEOPLE" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-32"><FormattedMessage id="UI.EMAIL" /></Label>
          <Input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap gap-2.5">
          <Label className="flex w-full max-w-32"><FormattedMessage id="UI.ROLE" /></Label>
          <div className="flex flex-col items-start grow gap-5">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.MEMBER" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.EDITOR" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.DESIGNER" /></SelectItem>
                <SelectItem value="4"><FormattedMessage id="UI.ADMIN" /></SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <SquarePlus size={12} />
              <FormattedMessage id="UI.ADD_MORE" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button>
          <Link to="#"><FormattedMessage id="UI.INVITE_PEOPLE" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { InvitePeople };
