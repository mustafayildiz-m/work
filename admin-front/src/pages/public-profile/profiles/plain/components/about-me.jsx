import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutMe = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.ABOUT_ME" /></CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-5.5 mb-4">
          <FormattedMessage id="UI.I_AM_A_PASSIONATE_AND_DEDICATED_INDIVIDU" />
        </p>
        <p className="text-sm text-foreground leading-5.5">
          <FormattedMessage id="UI.OVER_THE_YEARS_I_HAVE_HONED_MY_SKILLS_IN" />
        </p>
      </CardContent>
    </Card>
  );
};

export { AboutMe };
