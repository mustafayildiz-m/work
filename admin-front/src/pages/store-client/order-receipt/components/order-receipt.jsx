import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { ListChecks } from 'lucide-react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Card4 } from '../../components/common/card4';

export function OrderReceipt() {
  return (
    <Fragment>
      <div className="py-10">
        <Card className="px-0 w-full max-w-[800px] mx-auto overflow-hidden">
          <Progress
            value={100}
            className="h-[8px]"
            indicatorClassName="bg-[linear-gradient(90deg,#D618A3_0%,#1951E0_32.67%,#12C79C_67.17%,#DFBB19_100%)]"
          />

          <div
            className="py-10 mb-5 ps-6 pe-3 me-3 text-center space-y-5"
            id="order_receipt_body"
          >
            <div className="flex flex-col items-center gap-3 mb-5 lg:mb-9">
              <Link to="#" className="dark:hidden">
                <img
                  src={toAbsoluteUrl('/media/app/logo.png')}
                  className="default-logo h-[22px]"
                  alt="image"
                />
              </Link>

              <Link to="#" className="hidden dark:block">
                <img
                  src={toAbsoluteUrl('/media/app/default-logo-dark.svg')}
                  className="default-logo h-[22px]"
                  alt="image"
                />
              </Link>

              <h3 className="text-2xl text-dark font-semibold mt-6">
                <FormattedMessage id="UI.ORDER_CONFIRMATION" />
              </h3>
              <span className="text-sm text-secondary-foreground font-medium">
                <FormattedMessage id="UI.THANK_YOU_YOUR_ORDER" />
                <span className="text-sm text-dark font-semibold">
                  {' '}
                  <FormattedMessage id="UI.X319330S24" />{' '}
                </span>
                <FormattedMessage id="UI.IS_CONFIRMED_AND_BEING_PROCESSED" />
              </span>
            </div>

            <div className="space-y-5 lg:pb-5">
              <Card4 limit={4} />
            </div>

            <Card className="bg-muted/70 text-start px-5 lg:px-7 py-4">
              <div className="flex justify-start gap-9">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    <FormattedMessage id="UI.ORDER_PLACED" />
                  </span>
                  <span className="text-sm font-medium text-dark">
                    <FormattedMessage id="UI.26_JUNE_2025_ID" />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    <FormattedMessage id="UI.TOTAL" />
                  </span>
                  <span className="text-sm font-medium text-dark">$512.60</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    <FormattedMessage id="UI.SHIP_TO" />
                  </span>
                  <span className="text-sm font-medium text-dark">
                    <FormattedMessage id="UI.JEROEN_VAN_DIJK" />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-normal text-secondary-foreground">
                    <FormattedMessage id="UI.ESTIMATED_DELIVERY" />
                  </span>
                  <span className="text-sm font-medium text-dark">
                    <FormattedMessage id="UI.07_JULY_2025" />
                  </span>
                </div>
              </div>
            </Card>
            <Button variant="outline" className="lg:mt-5">
              <ListChecks />
              <Link to="/store-client/my-orders"><FormattedMessage id="UI.MY_ORDERS" /></Link>
            </Button>
          </div>
        </Card>
      </div>
      <style>
        {`
          body {
            background-color: #F9F9F9;
          }

          .dark body {
            background-color: var(--color-muted-foreground);
          }
        `}
      </style>
    </Fragment>
  );
}
