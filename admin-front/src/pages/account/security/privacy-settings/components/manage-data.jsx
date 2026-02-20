import { FormattedMessage } from "react-intl";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const ManageData = () => {
  const items = [
    {
      title: 'Ony invited People',
      description: 'Invite selected people via email.',
      control: <Button variant="outline"><FormattedMessage id="UI.START" /></Button>,
    },
    {
      title: 'People with the link',
      description: 'Create a pubic link for your report.',
      control: <Button variant="outline"><FormattedMessage id="UI.DELETE" /></Button>,
    },
    {
      title: 'No one',
      description: 'Reports will be visible only for you.',
      control: <Switch id="size-xs" size="sm" />,
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
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.MANAGE_YOUR_DATA" /></CardTitle>
      </CardHeader>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Card>
  );
};

export { ManageData };
