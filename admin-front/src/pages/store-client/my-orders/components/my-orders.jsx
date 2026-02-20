import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Card4 } from '../../components/common/card4';

export function MyOrders() {
  return (
    <div className="grid xl:grid-cols-1 gap-5 lg:gap-9">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="justify-start bg-muted/70 gap-9 h-auto py-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ORDER_ID" />
              </span>
              <span className="text-sm font-medium text-mono"><FormattedMessage id="UI.X319330S24" /></span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ORDER_PLACED" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.26_JUNE_2025" />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.TOTAL" />
              </span>
              <span className="text-sm font-medium text-mono">$512.60</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.SHIP_TO" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.JEROEN_VAN_DIJK" />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ESTIMATED_DELIVERY" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.07_JULY_2025" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 lg:p-7.5 space-y-5">
            <Card4 limit={4} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="justify-start bg-muted/70 gap-9 h-auto py-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ORDER_ID" />
              </span>
              <span className="text-sm font-medium text-mono"><FormattedMessage id="UI.X319330S24" /></span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ORDER_PLACED" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.26_JUNE_2025" />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.TOTAL" />
              </span>
              <span className="text-sm font-medium text-mono">$512.60</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.SHIP_TO" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.JEROEN_VAN_DIJK" />
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-normal text-secondary-foreground">
                <FormattedMessage id="UI.ESTIMATED_DELIVERY" />
              </span>
              <span className="text-sm font-medium text-mono">
                <FormattedMessage id="UI.07_JULY_2025" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 lg:p-7.5 space-y-5">
            <Card4 limit={1} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
