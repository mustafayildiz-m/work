import { FormattedMessage } from "react-intl";
import { useId } from 'react';
import { HexagonBadge } from '@/partials/common/hexagon-badge';
import { Mail } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

const AdvancedSettingsNotifications = () => {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();
  const id6 = useId();

  const items = [
    {
      title: 'Email',
      description: 'Tailor Your Email Preferences.',
      badge: <Mail className="text-xl text-muted-foreground" />,
    },
    {
      title: 'Slack',
      description: 'Stay Updated on Slack.',
      badge: (
        <img
          src={toAbsoluteUrl('/media/brand-logos/slack.svg')}
          className="h-5"
          alt="image"
        />
      ),
    },
  ];

  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="flex items-center justify-between flex-wrap grow border border-border rounded-xl gap-2 px-3.5 py-2.5"
      >
        <div className="flex items-center flex-wrap gap-3.5">
          <HexagonBadge
            stroke="stroke-input"
            fill="fill-muted/30"
            size="size-[50px]"
            badge={item.badge}
          />

          <div className="flex flex-col">
            <Link
              to="#"
              className="text-sm font-medium text-mono hover:text-primary-active mb-px"
            >
              {item.title}
            </Link>
            <span className="text-sm text-secondary-foreground">
              {item.description}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="size-sm" size="sm" defaultChecked />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader id="advanced_settings_notifications">
        <CardTitle><FormattedMessage id="UI.NOTIFICATIONS" /></CardTitle>
      </CardHeader>
      <CardContent className="lg:py-7.5">
        <div className="flex flex-wrap items-center gap-5 mb-5 lg:mb-7">
          {items.map((item, index) => {
            return renderItem(item, index);
          })}
        </div>
        <div className="flex flex-col gap-3.5 mb-7">
          <span className="text-base font-medium text-mono pb-0.5">
            <FormattedMessage id="UI.DESKTOP_NOTIFICATIONS" />
          </span>
          <div className="flex flex-col items-start gap-4">
            <RadioGroup defaultValue="intermediate">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id={id1} />
                <Label htmlFor={id1} variant="secondary">
                  <FormattedMessage id="UI.ALL_NEW_MESSAGES_RECOMMENDED" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id={id2} />
                <Label htmlFor={id2} variant="secondary">
                  <FormattedMessage id="UI.DIRECT_MENTIONS" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id={id3} />
                <Label htmlFor={id3} variant="secondary">
                  <FormattedMessage id="UI.DISABLED" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 mb-7">
          <span className="text-base font-medium text-mono pb-0.5">
            <FormattedMessage id="UI.EMAIL_NOTIFICATIONS" />
          </span>
          <div className="flex flex-col items-start gap-4">
            <RadioGroup defaultValue="intermediate">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id={id4} />
                <Label htmlFor={id4} variant="secondary">
                  <FormattedMessage id="UI.ALL_NEW_MESSAGES_AND_STATUSES" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id={id5} />
                <Label htmlFor={id5} variant="secondary">
                  <FormattedMessage id="UI.AUNREAD_MESSAGES_AND_STATUSES" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id={id6} />
                <Label htmlFor={id6} variant="secondary">
                  <FormattedMessage id="UI.DISABLED" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          <span className="text-base font-medium text-mono pb-0.5">
            <FormattedMessage id="UI.SUBSCRIPTIONS" />
          </span>
          <div className="flex items-center space-x-2">
            <Checkbox />
            <Label><FormattedMessage id="UI.AUTOMATICALLY_SUBSCRIBE_TO_TASKS_YOU_CRE" /></Label>
          </div>
        </div>
        <div className="flex justify-end">
          <Button><FormattedMessage id="UI.SAVE_CHANGES" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { AdvancedSettingsNotifications };
