import { FormattedMessage } from "react-intl";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const BackupSettings = () => {
  const items = [
    {
      title: 'Automatic Backup',
      description: 'Scheduled Data Protection',
      control: <Switch id="size-sm" size="sm" defaultChecked />,
    },
    {
      title: 'Backup Frequency',
      description: 'Select Preferred Backup',
      control: (
        <Select defaultValue="1">
          <SelectTrigger className="w-24" size="sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="w-24">
            <SelectItem value="1"><FormattedMessage id="UI.DAILY" /></SelectItem>
            <SelectItem value="2"><FormattedMessage id="UI.WEEKLY" /></SelectItem>
            <SelectItem value="3"><FormattedMessage id="UI.MONTHLY" /></SelectItem>
            <SelectItem value="4"><FormattedMessage id="UI.YEARLY" /></SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      title: 'Manual Backup',
      description: 'Backup When Needed',
      control: <Button variant="outline"><FormattedMessage id="UI.START" /></Button>,
    },
  ];

  const renderItem = (item, index) => {
    return (
      <CardContent
        key={index}
        className="border-b border-border flex items-center justify-between py-4 gap-2.5"
      >
        <div className="flex flex-col justify-center gap-1.5">
          <span className="leading-none font-medium text-sm text-mono">
            {item.title}
          </span>
          <span className="text-sm text-secondary-foreground">
            {item.description}
          </span>
        </div>
        {item.control}
      </CardContent>
    );
  };

  return (
    <Card>
      <CardHeader className="mb-1">
        <CardTitle><FormattedMessage id="UI.BACKUP_SETTINGS" /></CardTitle>
      </CardHeader>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Card>
  );
};

export { BackupSettings };
