import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { HexagonBadge } from '@/partials/common/hexagon-badge';
import {
  BadgeCheck,
  CheckCircle,
  LocateFixed,
  Puzzle,
  ShieldCheck,
  TabletSmartphone,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const GeneralSettings = () => {
  const items = [
    {
      icon: Users,
      title: (
        <Fragment>
          <FormattedMessage id="UI.PREVENT_MEMBERS_FROM_INVITING_OTHERS" />
          <Badge size="sm" variant="primary" appearance="outline">
            <FormattedMessage id="UI.PRO" />
          </Badge>
        </Fragment>
      ),

      description:
        'Restrict members from sending invites to new potential members.',
      actions: <Switch size="sm" id="auto-update" />,
    },
    {
      icon: Puzzle,
      title: (
        <Fragment>
          <FormattedMessage id="UI.PREVENT_MEMBERS_FROM_INSTALLING_THIRDPAR" />
          <Badge size="sm" variant="primary" appearance="outline">
            <FormattedMessage id="UI.PRO" />
          </Badge>
        </Fragment>
      ),

      description:
        'Prohibit the installation of external apps or integrations by members..',
      actions: <Switch size="sm" id="auto-update" />,
    },
    {
      icon: LocateFixed,
      title: 'Allow use location',
      description: "Enable feature to use and share the user's location.",
      actions: <Switch size="sm" defaultChecked />,
    },
    {
      icon: ShieldCheck,
      title: (
        <Fragment>
          <FormattedMessage id="UI.PUSH_PROTECTION_FOR_YOURSELF" />
          <Badge variant="info" appearance="outline">
            <FormattedMessage id="UI.BETA" />
          </Badge>
        </Fragment>
      ),

      description: 'Enable users to create and display a profile publicly.',
      actions: <Button variant="outline"><FormattedMessage id="UI.SETUP" /></Button>,
    },
    {
      icon: BadgeCheck,
      title: 'Allow public profile',
      description: 'Enable users to create and display a profile publicly.',
      actions: <Switch size="sm" defaultChecked />,
    },
    {
      icon: CheckCircle,
      title: 'Allow use location',
      description: "Enable feature to use and share the user's location.",
      actions: <Switch size="sm" />,
    },
    {
      icon: TabletSmartphone,
      title: (
        <Fragment>
          <FormattedMessage id="UI.PRIVATE_VULNERABILITY_REPORTING" />
          <Badge variant="info" appearance="outline">
            <FormattedMessage id="UI.BETA" />
          </Badge>
        </Fragment>
      ),

      description: 'Confidential channel for reporting system vulnerabilities.',
      actions: (
        <Fragment>
          <Button
            variant="outline"
            className="bg-red-100 border-red-200 text-red-600 hover:text-white hover:bg-red-500 dark:border-red-950 dark:bg-red-950/30"
          >
            <FormattedMessage id="UI.DISABLE_ALL" />
          </Button>
          <Button variant="outline"><FormattedMessage id="UI.ENABLE_ALL" /></Button>
        </Fragment>
      ),
    },
  ];

  const renderItem = (item, index) => {
    return (
      <CardContent
        key={index}
        className="border-b border-border flex items-center flex-wrap sm:flex-nowrap justify-between py-4 gap-2.5"
      >
        <div className="flex items-center gap-3.5">
          <HexagonBadge
            stroke="stroke-input"
            fill="fill-muted/30"
            size="size-[50px]"
            badge={<item.icon className="text-xl text-muted-foreground" />}
          />

          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 leading-none font-medium text-sm text-mono">
              {item.title}
            </span>
            <span className="text-sm text-gray700">{item.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">{item.actions}</div>
      </CardContent>
    );
  };

  return (
    <Card>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Card>
  );
};

export { GeneralSettings };
