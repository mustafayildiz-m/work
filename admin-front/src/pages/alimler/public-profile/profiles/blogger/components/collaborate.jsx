import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Collaborate = ({ title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-5.5">
          <FormattedMessage id="UI.EXPERIENCED_UIUX_DESIGNER_SEEKING_NEW_OP" />
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/public-profile/works"><FormattedMessage id="UI.VIEW_DETAILS" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Collaborate };
