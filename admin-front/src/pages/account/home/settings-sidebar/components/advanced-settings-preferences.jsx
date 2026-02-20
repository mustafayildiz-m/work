import { FormattedMessage } from "react-intl";
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const AdvancedSettingsPreferences = () => {
  const id1 = useId();
  const id2 = useId();

  return (
    <Card>
      <CardHeader id="advanced_settings_preferences">
        <CardTitle><FormattedMessage id="UI.PREFERENCES" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:py-7.5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.LANGUAGE" /></Label>
          <div className="grow">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.AMERICAN_ENGLISH" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.TIME_ZONE" /></Label>
          <div className="grow">
            <Select defaultValue="4">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">
                  <FormattedMessage id="UI.GMT_500__EASTERN_TIMEUS__CANADA" />
                </SelectItem>
                <SelectItem value="5"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="6"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-2">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CURRENCY" /></Label>
          <div className="grow">
            <Select defaultValue="7">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7"><FormattedMessage id="UI.UNITED_STATES_DOLLAR_USD" /></SelectItem>
                <SelectItem value="8"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="9"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.OPEN_TASKS_AS" /></Label>
          <div className="flex items-center gap-5">
            <RadioGroup
              defaultValue="intermediate"
              className="flex items-center gap-5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id={id1} />
                <Label
                  htmlFor={id1}
                  className="text-foreground text-sm font-normal"
                >
                  <FormattedMessage id="UI.MODAL" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id={id2} />
                <Label
                  htmlFor={id2}
                  className="text-foreground text-sm font-normal"
                >
                  <FormattedMessage id="UI.FULLSCREEN" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-1.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.ATTRIBUTES" /></Label>
          <div className="flex flex-col items-start gap-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center space-x-2">
                <Checkbox />
                <Label><FormattedMessage id="UI.SHOW_LIST_NAMES" /></Label>
              </div>
              <div className="form-hint"><FormattedMessage id="UI.SEE_THE_NAME_NEXT_TO_EACH_ICON" /></div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center space-x-2">
                <Checkbox defaultChecked />
                <Label><FormattedMessage id="UI.SHOW_LINKED_TASK_NAMES" /></Label>
              </div>
              <div className="form-hint">
                <FormattedMessage id="UI.SHOW_TASK_NAMES_NEXT_TO_IDS_FOR_LINKED_P" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.EMAIL_VISIBILITY" /></Label>
          <Switch defaultChecked size="sm" />
          <Label htmlFor="auto-update" className="text-foreground text-sm">
            <FormattedMessage id="UI.VISIBLE" />
          </Label>
        </div>
        <div className="flex justify-end">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AdvancedSettingsPreferences };
