import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

const Saves = () => {
  return (
    <Fragment>
      <style>
        {`
          .post-saves-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-2.png')}');
            margin-top: -1rem;
		        height: 7rem;
          }
          .dark .post-saves-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-2-dark.png')}');
            height: 12rem;
		        margin-bottom: -4.5rem;
          }
        `}
      </style>
      <div className="text-center p-7.5 pt-5">
        <div className="bg-center bg-no-repeat bg-cover post-saves-bg"></div>
        <div className="text-xl font-medium text-mono text-center my-2">
          <FormattedMessage id="UI.ACCESS_RESTRICTED_FOR_THIS_OPTION" />
        </div>
        <span className="text-sm text-secondary-foreground block mb-7.5">
          <FormattedMessage id="UI.THE_USER_MAY_NOT_HAVE_THE_NECESSARY_PRIV" /> <br />
          <FormattedMessage id="UI.TO_ACCESS_THIS_OPTION_IN_THIS_PAGE" />
        </span>
        <div className="flex justify-center">
          <Button variant="outline"><FormattedMessage id="UI.REQUEST_ACCESS" /></Button>
        </div>
      </div>
    </Fragment>
  );
};

export { Saves };
