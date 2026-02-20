import { FormattedMessage } from "react-intl";
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Seats = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.SEATS" /></CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <h4 className="text-base font-medium text-mono"><FormattedMessage id="UI.1449_SEATS" /></h4>
        <p className="text-sm text-foreground">
          <FormattedMessage id="UI.ADDITIONAL_SEATS_HAVE_BEEN_ADDED_YET_AVA" />
        </p>
        <div>
          <Button mode="link" underlined="dashed" asChild>
            <Link to="#"><FormattedMessage id="UI.LEARN_MORE" /></Link>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline">
          <Link to="#"><FormattedMessage id="UI.ADD_SEATS" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Seats };
