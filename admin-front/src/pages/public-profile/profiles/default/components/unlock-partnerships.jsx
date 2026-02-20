import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const UnlockPartnerships = () => {
  return (
    <Card>
      <CardContent className="px-10 py-7.5 lg:pe-12.5">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-mono">
              <FormattedMessage id="UI.UNLOCK_CREATIVE" /> <br />
              <FormattedMessage id="UI.PARTNERSHIPS_ON_OUR_BLOG" />
            </h2>
            <p className="text-sm text-secondary-foreground leading-5.5">
              <FormattedMessage id="UI.EXPLORE_EXCITING_COLLABORATION_OPPORTUNI" />
            </p>
          </div>
          <img
            src={toAbsoluteUrl('/media/illustrations/1.svg')}
            className="dark:hidden max-h-[160px]"
            alt="image"
          />

          <img
            src={toAbsoluteUrl('/media/illustrations/1-dark.svg')}
            className="light:hidden max-h-[160px]"
            alt="image"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/network/get-started"><FormattedMessage id="UI.GET_STARTED_1" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { UnlockPartnerships };
