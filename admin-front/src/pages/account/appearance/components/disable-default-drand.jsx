import { FormattedMessage } from "react-intl";
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const DisableDefaultBrand = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-1.5">
          <CardTitle><FormattedMessage id="UI.DISABLE_DEFAULT_BRANDING" /></CardTitle>
          <Badge size="sm" variant="primary" appearance="outline">
            <FormattedMessage id="UI.PRO" />
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-secondary-foreground">
            <FormattedMessage id="UI.REMOVE_ANY_KTSTUDIOIO_BRANDING_AND_MEDIA" />
          </p>
          <div>
            <Button mode="link" underlined="dashed">
              <Link to="#"><FormattedMessage id="UI.VIEW_PLANS" /></Link>
            </Button>
          </div>
        </div>
        <Switch size="sm" disabled />
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" disabled>
          <FormattedMessage id="UI.UPDATE" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export { DisableDefaultBrand };
