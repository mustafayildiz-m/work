import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { AvatarInput } from '@/partials/common/avatar-input';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const BasicSettings = () => {
  const [date, setDate] = useState(new Date(1984, 0, 20));
  const [nameInput, setNameInput] = useState('Jason Tatum');
  const [companyInput, setCompanyInput] = useState('KeenThemes');
  const [phoneInput, setPhoneInput] = useState('');

  return (
    <Card className="pb-2.5">
      <CardHeader id="basic_settings">
        <CardTitle><FormattedMessage id="UI.BASIC_SETTINGS" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.PHOTO" /></Label>
          <div className="flex items-center justify-between flex-wrap grow gap-2.5">
            <span className="text-sm text-secondary-foreground">
              <FormattedMessage id="UI.150X150PX_JPEG_PNG_IMAGE" />
            </span>
            <AvatarInput />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              <FormattedMessage id="UI.NAME" />
            </Label>
            <Input
              type="text"
              defaultValue={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              <FormattedMessage id="UI.BIRTH_DATE" />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  mode="input"
                  variant="outline"
                  id="date"
                  className={cn(
                    'w-full data-[state=open]:border-primary',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarDays className="-ms-0.5" />
                  {date ? format(date, 'LLL dd, y') : <span><FormattedMessage id="UI.PICK_A_DATE" /></span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="single" // Single date selection
                  defaultMonth={date}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              <FormattedMessage id="UI.COMPANY" />
            </Label>
            <Input
              type="text"
              defaultValue={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              <FormattedMessage id="UI.PHONE_NUMBER" />
            </Label>
            <Input
              type="text"
              placeholder="Enter phone"
              defaultValue={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.VISIBILITY" /></Label>
          <div className="grow">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1"><FormattedMessage id="UI.PUBLIC" /></SelectItem>
                <SelectItem value="2"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
                <SelectItem value="3"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.AVAIBALITY" /></Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-update" className="text-sm">
              <FormattedMessage id="UI.AVAILABLE_TO_HIRE" />
            </Label>
            <Switch defaultChecked size="sm" />
          </div>
        </div>
        <div className="flex justify-end pt-2.5">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { BasicSettings };
