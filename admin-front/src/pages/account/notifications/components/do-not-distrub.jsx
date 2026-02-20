import { FormattedMessage } from "react-intl";
import { Bell } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DoNotDistrub = ({ title, icon, text }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Do Not Disturb'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <p className="text-sm text-secondary-foreground">
          <FormattedMessage id="UI.ACTIVATE_DO_NOT_DISTURB_TO_SILENCE_ALL_N" />
        </p>
        <div>
          <Button mode="link" underlined="dashed">
            <Link to="#"><FormattedMessage id="UI.LEARN_MORE" /></Link>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline">
          <Link to="#" className="flex items-center gap-1.5">
            <div>{icon || <Bell size={16} />}</div>
            {text || 'Pause Notifications'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { DoNotDistrub };
