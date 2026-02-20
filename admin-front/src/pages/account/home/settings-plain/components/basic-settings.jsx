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

const BasicSettings = ({ title }) => {
  const [date, setDate] = useState(new Date(1984, 0, 20));
  const [nameInput, setNameInput] = useState('Jason Tatum');
  const [emailInput, setEmailInput] = useState('jason@studio.io');
  const [addressInput, setAddressInput] = useState('Avinguda Imaginària, 789');
  const [cityInput, setCityInput] = useState('Barcelona');
  const [postcodeInput, setPostcodeInput] = useState('08012');

  return (
    <Card className="pb-2.5">
      <CardHeader id="general_settings">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-update" className="text-sm">
            <FormattedMessage id="UI.PUBLIC_PROFILE" />
          </Label>
          <Switch defaultChecked size="sm" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.PHOTO" /></Label>
          <div className="flex items-center justify-between flex-wrap grow gap-2.5">
            <span className="text-sm font-medium text-secondary-foreground">
              <FormattedMessage id="UI.150X150PX_JPEG_PNG_IMAGE" />
            </span>
            <AvatarInput />
          </div>
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.NAME" /></Label>
          <Input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
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
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.PHONE_NUMBER" /></Label>
          <Input type="text" placeholder="Phone number" />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.EMAIL" /></Label>
          <Input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.ADDRESS" /></Label>
          <Input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.COUNTRY" /></Label>
          <Select defaultValue="1">
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1"><FormattedMessage id="UI.SPAIN" /></SelectItem>
              <SelectItem value="2"><FormattedMessage id="UI.OPTION_2" /></SelectItem>
              <SelectItem value="3"><FormattedMessage id="UI.OPTION_3" /></SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.STATE" /></Label>
          <Input type="text" placeholder="State" />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CITY" /></Label>
          <Input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.POSTCODE" /></Label>
          <Input
            type="text"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { BasicSettings };
