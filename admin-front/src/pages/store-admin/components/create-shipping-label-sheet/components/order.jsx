import { FormattedMessage } from "react-intl";
import { Card, CardContent } from '@/components/ui/card';

const locations = [
  { address: '1234 Industrial Way, Dallas, TX 75201', time: '10:00 AM' },
  { address: '8458 Sunset Blvd #209, Los Angeles, CA 90069', time: '11:30 AM' },
];

export const Order = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-5 flex-wrap px-5 bg-muted/70 py-2.5">
          <div className="flex flex-col space-y-3 relative">
            {locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center gap-2 relative z-10"
              >
                {index !== locations.length - 1 && (
                  <div className="absolute left-[2.2px] top-[15px] w-[2px] h-full bg-input rounded-full z-0"></div>
                )}
                <span className="size-1.5 rounded-full bg-gray-700 z-10 outline outline-gray-50 outline-3 mt-[2px]"></span>
                <span className="text-xs font-medium text-foreground">
                  {location.address}
                </span>
              </div>
            ))}
          </div>
        </div>

        <span className="border-b border-border"></span>

        <div className="flex justify-start gap-9 p-5 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-normal text-secondary-foreground">
              <FormattedMessage id="UI.ORDER_ID" />
            </span>
            <span className="text-sm font-medium text-mono"><FormattedMessage id="UI.SOAMS4620" /></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-normal text-secondary-foreground">
              <FormattedMessage id="UI.PLACED" />
            </span>
            <span className="text-sm font-medium text-mono"><FormattedMessage id="UI.28_JUL_2025" /></span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-normal text-secondary-foreground">
              <FormattedMessage id="UI.TOTAL_PRICE" />
            </span>
            <span className="text-sm font-medium text-mono">$320.00</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-normal text-secondary-foreground">
              <FormattedMessage id="UI.SHIPPING_PRIORITY" />
            </span>
            <span className="text-sm font-medium text-mono"><FormattedMessage id="UI.HIGH" /></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
