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

const OpenToWork = ({ className, title }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-5.5">
          <FormattedMessage id="UI.SEASONED_UIUX_DESIGNER_WITH_A_FLAIR_FOR_" />
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

export { OpenToWork };
