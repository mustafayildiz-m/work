import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { Faq } from '@/partials/common/faq';
import { Help2 } from '@/partials/common/help2';
import { Starter } from '@/partials/common/starter';
import { toAbsoluteUrl } from '@/lib/helpers';

export function AccountMembersStarterContent() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Starter
        image={
          <Fragment>
            <img
              src={toAbsoluteUrl('/media/illustrations/22.svg')}
              className="dark:hidden max-h-[230px]"
              alt="image"
            />

            <img
              src={toAbsoluteUrl('/media/illustrations/22-dark.svg')}
              className="light:hidden max-h-[230px]"
              alt="image"
            />
          </Fragment>
        }
        title="New Member Onboarding and Registration"
        subTitle={
          <Fragment>
            <FormattedMessage id="UI.A_STREAMLINED_PROCESS_TO_WELCOME_AND_INT" />
            <br />
            <FormattedMessage id="UI.ENSURING_A_SMOOTH_AND_EFFICIENT_START" />
          </Fragment>
        }
        engage={{
          path: '/account/home/user-profile',
          label: 'Add New Member',
          btnColor: 'btn-primary',
        }}
      />
      <Faq />
      <Help2 />
    </div>
  );
}
