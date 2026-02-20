import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Webhooks = () => {
  const [webhooknameInput, setWebhookNameInput] = useState('CostaRicaHook');

  return (
    <Card className="pb-2.5">
      <CardHeader id="webhooks">
        <CardTitle><FormattedMessage id="UI.WEBHOOKS" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <p className="text-sm text-foreground">
          <FormattedMessage id="UI.SET_UP_WEBHOOKS_TO_TRIGGER_ACTIONS_ON_EX_1" />
        </p>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.WEBHOOK_URL" /></Label>
          <div className="grow">
            <Input type="text" placeholder="Enter URL" />
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.WEBHOOK_NAME" /></Label>
          <div className="grow">
            <Input
              type="text"
              value={webhooknameInput}
              onChange={(e) => setWebhookNameInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.EVENT_TYPE" /></Label>
          <div className="grow">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.ALL_EVENTS" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.PUSH_WEBHOOKS" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.PIPE_WEBHOOK" /></SelectItem>
                <SelectItem value="4"><FormattedMessage id="UI.PLUGIN_WEBHOOKS" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5 mb-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CUSTOM_HEADERS" /></Label>
          <div className="grow">
            <div className="flex items-center space-x-2">
              <Label htmlFor="size-sm" className="text-sm">
                <FormattedMessage id="UI.USE_CUSTOM_HEADER" />
              </Label>
              <Switch id="size-sm" size="sm" defaultChecked />
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

export { Webhooks };
