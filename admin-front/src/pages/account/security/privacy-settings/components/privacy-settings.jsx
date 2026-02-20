import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { HexagonBadge } from '@/partials/common/hexagon-badge';
import {
  BadgePercent,
  CheckCircle2,
  MailCheck,
  MapPin,
  Search,
  ShieldQuestion,
  UserCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const PrivacySettings = () => {
  const items = [
    {
      icon: Search,
      title: (
        <Fragment>
          <FormattedMessage id="UI.SHOW_UP_IN_SEARCH_RESULTS" />
          <Badge size="sm" variant="primary" appearance="outline">
            <FormattedMessage id="UI.PRO" />
          </Badge>
        </Fragment>
      ),

      description:
        'Control your visibility by choosing if you appear in search results.',
      actions: <Switch size="sm" id="auto-update" />,
    },
    {
      icon: MailCheck,
      title: (
        <Fragment>
          <FormattedMessage id="UI.MANAGE_READ_RECEIPTS_FOR_MESSAGES" />
          <Badge size="sm" variant="primary" appearance="outline">
            <FormattedMessage id="UI.PRO" />
          </Badge>
        </Fragment>
      ),

      description: 'Enable or disable read receipts for private messages.',
      actions: <Switch size="sm" id="auto-update" />,
    },
    {
      icon: MapPin,
      title: 'Enable Location-Based Services',
      description:
        'Allow the app to access and use your location for personalized content.',
      actions: <Switch size="sm" id="auto-update" defaultChecked />,
    },
    {
      icon: BadgePercent,
      title: (
        <Fragment>
          <FormattedMessage id="UI.AD_PERSONALIZATION_SETTINGS" />
          <Badge variant="info" appearance="outline">
            <FormattedMessage id="UI.BETA" />
          </Badge>
        </Fragment>
      ),

      description: 'Customize how ads are targeted to your interests.',
      actions: <Button variant="outline"><FormattedMessage id="UI.SETUP" /></Button>,
    },
    {
      icon: UserCircle2,
      title: 'Allow public profile',
      description: 'Enable users to create and display a profile publicly.',
      actions: <Switch size="sm" id="auto-update" defaultChecked />,
    },
    {
      icon: CheckCircle2,
      title: 'Allow use location',
      description: "Enable feature to use and share the user's location.",
      actions: <Switch size="sm" id="auto-update" />,
    },
    {
      icon: ShieldQuestion,
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
        className="border-b border-border flex items-center justify-between py-4 gap-2.5"
      >
        <div className="flex items-center gap-3.5">
          <HexagonBadge
            stroke="stroke-input"
            fill="fill-muted/30"
            size="size-[50px]"
            badge={<item.icon className="text-xl text-muted-foreground" />}
          />

          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 leading-none font-medium text-sm text-mono">
              {item.title}
            </span>
            <span className="text-sm text-secondary-foreground">
              {item.description}
            </span>
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

export { PrivacySettings };
