import { FormattedMessage } from "react-intl";
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
  return (
    <Card className="pb-2.5">
      <CardHeader id="webhooks">
        <CardTitle><FormattedMessage id="UI.WEBHOOKS" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <p className="text-sm font-medium text-secondary-foreground">
          <FormattedMessage id="UI.SET_UP_WEBHOOKS_TO_TRIGGER_ACTIONS_ON_EX" /> <br />
          <FormattedMessage id="UI.ENSURE_SEAMLESS_INTEGRATION" />
        </p>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <span className="text-sm font-medium text-secondary-foreground max-w-56 w-full">
            <FormattedMessage id="UI.WEBHOOK_URL" />
          </span>
          <div className="grow min-w-48">
            <Input
              type="text"
              className="w-full"
              placeholder="Enter URL"
              value=""
              readOnly
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <span className="text-sm font-medium text-secondary-foreground max-w-56 w-full">
            <FormattedMessage id="UI.WEBHOOK_NAME" />
          </span>
          <div className="grow min-w-48">
            <Input
              type="text"
              className="w-full placeholder:text-secondary-foreground"
              placeholder="CostaRicaHook"
              value=""
              readOnly
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <span className="text-sm font-medium text-secondary-foreground max-w-56 w-full">
            <FormattedMessage id="UI.EVENT_TYPE" />
          </span>
          <div className="grow min-w-48">
            <Select defaultValue="1">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.ALL_EVENTS" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5 mb-2.5">
          <span className="text-sm font-medium text-secondary-foreground max-w-56 w-full">
            <FormattedMessage id="UI.CUSTOM_HEADERS" />
          </span>
          <div className="grow min-w-48">
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
