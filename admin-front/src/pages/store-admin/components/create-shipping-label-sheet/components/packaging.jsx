import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Packaging = () => {
  const [packageName, setPackageName] = useState('Mike Anderson – Medium Box');
  const [totalWeight, setTotalWeight] = useState('2.1');
  const [length, setLength] = useState('48');
  const [width, setWidth] = useState('36');
  const [height, setHeight] = useState('20');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 px-5">
        <CardTitle><FormattedMessage id="UI.PACKAGING" /></CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-4.5">
          {/* Package Name */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs text-mono font-medium"><FormattedMessage id="UI.PACKAGE_NAME" /></span>
            <Input
              className=""
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 w-full">
              <span className="form-info text-xs text-mono font-medium">
                <FormattedMessage id="UI.PACKAGE_TYPE" />
              </span>

              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="1"><FormattedMessage id="UI.MEDIUM_BOX" /></SelectItem>
                  <SelectItem value="2"><FormattedMessage id="UI.SMALL_BOX" /></SelectItem>
                  <SelectItem value="3"><FormattedMessage id="UI.LARGE_BOX" /></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <span className="form-info text-xs text-mono font-medium">
                <FormattedMessage id="UI.TOTAL_WEIGHT" />
              </span>

              <Input
                placeholder=""
                type="text"
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div className="flex-1 min-w-[100px]">
              <div className="flex flex-col gap-2 w-full">
                <span className="text-xs text-mono font-medium"><FormattedMessage id="UI.LENGTH" /></span>

                <Input
                  placeholder=""
                  type="text"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[100px]">
              <div className="flex flex-col gap-2 w-full">
                <span className="text-xs text-mono font-medium"><FormattedMessage id="UI.WIDTH" /></span>

                <Input
                  placeholder=""
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[100px]">
              <div className="flex flex-col gap-2 w-full">
                <span className="text-xs text-mono font-medium"><FormattedMessage id="UI.HEIGHT" /></span>

                <Input
                  placeholder=""
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="w-auto min-w-[66px]">
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="1"><FormattedMessage id="UI.SM" /></SelectItem>
                  <SelectItem value="2"><FormattedMessage id="UI.MM" /></SelectItem>
                  <SelectItem value="3"><FormattedMessage id="UI.DM" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox defaultChecked />
            <Label><FormattedMessage id="UI.SAVE_PACKAGE_FOR_FUTURE_ORDERS" /></Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
