import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InventorySummary() {
  return (
    <Card className="h-full">
      <CardHeader className="px-3 bg-accent/50">
        <CardTitle><FormattedMessage id="UI.INVENTORY_SUMMARY" /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4">
        <div className="flex items-center justify-between gap-5">
          <span className="text-sm font-normal text-secondary-foreground uppercase">
            <FormattedMessage id="UI.QUANTITY_IN_HAND" />
          </span>
          <span className="text-2xl font-medium text-mono">12746</span>
        </div>

        <div className="border-b border-b-border mt-1"></div>

        <div className="text-sm flex items-center justify-between gap-5">
          <span className="font-normal text-secondary-foreground uppercase">
            <FormattedMessage id="UI.QUANTITY_TO_BE_RECEIVED" />
          </span>
          <span className="text-2xl font-medium text-mono">62</span>
        </div>
      </CardContent>
    </Card>
  );
}
