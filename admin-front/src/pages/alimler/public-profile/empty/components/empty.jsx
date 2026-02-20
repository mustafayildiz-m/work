import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Empty = () => {
  return (
    <Fragment>
      <Card className="p-8 lg:p-12">
        <CardContent>
          <div className="grid justify-center py-5">
            <img
              src={toAbsoluteUrl('/media/illustrations/11.svg')}
              className="dark:hidden max-h-[170px]"
              alt="image"
            />

            <img
              src={toAbsoluteUrl('/media/illustrations/11-dark.svg')}
              className="light:hidden max-h-[170px]"
              alt="image"
            />
          </div>
          <div className="text-lg font-medium text-mono text-center">
            <FormattedMessage id="UI.UPLOAD_ITEM_TO_GET_STARTED" />
          </div>
          <div className="text-sm text-secondary-foreground text-center gap-1">
            <FormattedMessage id="UI.BEGIN_BY_CRAFTING_YOUR_INAUGURAL_LIST_IN" />
            <Link
              to="/account/billing/plans"
              className="text-sm font-medium link"
            >
              <FormattedMessage id="UI.GET_STARTED" />
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="flex grow justify-center pt-5 lg:pt-7.5">
        <Button mode="link" underlined="dashed" asChild>
          <Link to="/public-profile/profiles/default">
            <FormattedMessage id="UI.CHECK_READY_TEMPLATES" />
          </Link>
        </Button>
      </div>
    </Fragment>
  );
};

export { Empty };
