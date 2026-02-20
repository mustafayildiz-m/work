import { FormattedMessage } from "react-intl";
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Import = () => {
  const [customInput, setCustomInput] = useState('Your welcome message here');
  const options = [
    {
      label: 'Create new users',
      description:
        'Select this option to create new user accounts for individuals whose details are included in the import data but who do not have an existing account in the system.',
      checked: true,
    },
    {
      label: 'Update existing users',
      description:
        'When checked, the system will update the information for users already in the database with any new or altered details provided in the import file.',
      checked: false,
    },
    {
      label: 'Send email notification on password change',
      description:
        'This option ensures users are promptly notified via email in the event of a password change, enhancing security and keeping users informed of their account status.',
      checked: true,
    },
    {
      label: 'Include external IDs in import results',
      description:
        'By including external IDs in the import results, administrators can more easily reconcile and track user records across different systems and databases.',
      checked: false,
    },
  ];

  const renderItem = (option, index) => {
    return (
      <div key={index} className="flex flex-col gap-2.5">
        <div className="flex items-center space-x-2">
          <Checkbox value={option.label} defaultChecked={option.checked} />
          <Label className="text-foreground font-medium">{option.label}</Label>
        </div>
        <p className="form-info leading-5 text-foreground font-normal">
          {option.description}
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.START_IMPORT" /></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-7.5 py-5 lg:py-7.5">
        {options.map((option, index) => {
          return renderItem(option, index);
        })}
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <Button><FormattedMessage id="UI.SELECT_CSV_FILE" /></Button>
            <Button variant="ghost"><FormattedMessage id="UI.CHOOSE_FILE" /></Button>
          </div>
          <p className="text-secondary-foreground text-sm">
            <FormattedMessage id="UI.USE_THE_CHOOSE_FILE_BUTTON_TO_LOCATE_AND" />
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-mono text-sm font-medium">
            <FormattedMessage id="UI.CUSTOM_WELCOME_MESSAGE" />
          </div>
          <Textarea
            placeholder="Your welcome message here"
            className="text-sm text-secondary-foreground font-normal"
            rows={5}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />

          <div className="flex items-center space-x-2">
            <Checkbox />
            <Label className="text-foreground text-sm font-medium">
              <FormattedMessage id="UI.SEND_WELCOME_EMAIL_TO_NEW_USERS" />
            </Label>
          </div>
        </div>
        <div className="text-foreground text-sm">
          <span className="text-destructive uppercase"><FormattedMessage id="UI.WARNING" /> </span>
          <FormattedMessage id="UI.AN_EMAIL_WILL_BE_SENT_TO_ALL_USERS_CREAT" />
        </div>
      </CardContent>
      <CardFooter className="justify-center py-3.5">
        <Button>
          <Link to="#"><FormattedMessage id="UI.IMPORT_MEMBER" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Import };
