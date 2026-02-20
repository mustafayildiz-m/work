import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { SquarePlus } from 'lucide-react';
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
  const [invitepeopleInput, setInvitePeopleInput] = useState('jason@studio.io');
  return (
    <Card>
      <CardHeader id="webhooks">
        <CardTitle><FormattedMessage id="UI.INVITE_PEOPLE" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-32"><FormattedMessage id="UI.EMAIL" /></Label>
          <div className="grow min-w-48">
            <Input
              className="w-full"
              type="text"
              value={invitepeopleInput}
              onChange={(e) => setInvitePeopleInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-baseline flex-wrap gap-2.5">
          <Label className="flex w-full max-w-32"><FormattedMessage id="UI.ROLE" /></Label>
          <div className="grid gap-5 grow items-start">
            <Select defaultValue="1">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.MEMBER" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Button variant="outline">
                <SquarePlus size={16} /> <FormattedMessage id="UI.ADD_MORE" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button><FormattedMessage id="UI.INVITE_PEOPLE" /></Button>
      </CardFooter>
    </Card>
  );
};

export { InvitePeople };
