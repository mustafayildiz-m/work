import { FormattedMessage } from "react-intl";
import { MoveLeft, MoveRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Info } from './components/info';
import { Order } from './components/order';

export function ShippingInfoContent() {
  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Info />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">
            <MoveLeft className="text-base" />
            <Link to="/store-client/checkout/order-summary"><FormattedMessage id="UI.ORDER_SUMMARY" /></Link>
          </Button>

          <Button>
            <Link to="/store-client/checkout/payment-method">
              <FormattedMessage id="UI.PAYMENT_METHOD" />
            </Link>
            <MoveRight className="text-base" />
          </Button>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Order />
        </div>
      </div>
    </div>
  );
}
