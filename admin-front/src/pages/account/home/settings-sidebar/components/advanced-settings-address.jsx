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

const AdvancedSettingsAddress = () => {
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('1');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');

  return (
    <Card>
      <CardHeader id="advanced_settings_address">
        <CardTitle><FormattedMessage id="UI.ADDRESS" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:py-7.5">
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full items-center gap-1 max-w-56">
            <FormattedMessage id="UI.ADDRESS" />
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="Avinguda Imaginària, 789"
            defaultValue={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.COUNTRY" /></Label>
          <div className="grow">
            <Select value={country} onValueChange={setCountry}>
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
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.STATE" /></Label>
          <Input
            id="state"
            type="text"
            placeholder="State"
            defaultValue={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.CITY" /></Label>
          <Input
            id="city"
            type="text"
            placeholder="Barcelona"
            defaultValue={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56"><FormattedMessage id="UI.POSTCODE" /></Label>
          <Input
            id="postcode"
            type="text"
            placeholder="08012"
            defaultValue={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
        </div>
        <div className="flex justify-end pt-2.5">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AdvancedSettingsAddress };
