import { FormattedMessage } from "react-intl";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Order() {
  const items = [
    { label: 'Subtotal', amount: 492.0 },
    { label: 'Shipping', amount: 0.0 },
    { label: 'VAT', amount: 0.0 },
  ];

  const renderItem = (item, index) => (
    <div key={index} className="flex justify-between items-center px-5">
      <span className="text-sm font-normal text-secondary-foreground">
        {item.label}
      </span>
      <span className="text-sm font-medium text-mono">${item.amount}.0</span>
    </div>
  );

  return (
    <Card className="bg-accent/50">
      <CardHeader className="px-5">
        <CardTitle><FormattedMessage id="UI.ORDER_SUMMARY" /></CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-5 space-y-2">
        <div className="flex flex-col px-5">
          <span className="text-sm font-medium text-mono mb-1.5">
            <FormattedMessage id="UI.SHIPPING_TO_JEROENS_HOME" />
          </span>

          <div className="flex flex-col gap-1 text-xs font-normal text-secondary-foreground">
            <span><FormattedMessage id="UI.JEROEN_VAN_DIJK" /></span>
            <span><FormattedMessage id="UI.KEIZERSGRACHT_172" /></span>
            <span><FormattedMessage id="UI.1016_DW_AMSTERDAM" /></span>
            <span><FormattedMessage id="UI.NETHERLANDS" /></span>
          </div>
        </div>

        <div className="border-b border-border mb-4 mt-5"></div>
        <span className="text-sm font-medium block text-mono mb-3.5 px-5">
          <FormattedMessage id="UI.PRICE_DETAILS" />
        </span>

        {items.map((item, index) => {
          return renderItem(item, index);
        })}
      </CardContent>
      <CardFooter className="flex justify-between items-center px-5">
        <span className="text-sm font-normal text-secondary-foreground">
          <FormattedMessage id="UI.TOTAL" />
        </span>
        <span className="text-base font-semibold text-mono">$492.00</span>
      </CardFooter>
    </Card>
  );
}
