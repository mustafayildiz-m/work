import { FormattedMessage } from "react-intl";
import { SlidersVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const SalesOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.SALES_OVERVIEW" /></CardTitle>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <div className="size-[11px] border-2 border-primary rounded-full"></div>
              <div className="text-sm font-medium text-muted-foreground">
                <FormattedMessage id="UI.GOALS" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-[11px] border-2 border-success rounded-full"></div>
              <div className="text-sm font-medium text-muted-foreground">
                <FormattedMessage id="UI.SALES" />
              </div>
            </div>
          </div>
          <Button>
            <SlidersVertical size={16} />
          </Button>
        </div>
      </CardHeader>
      <div className="px-3 py-1">
        <div id="sales_overview_chart"></div>
      </div>
    </Card>
  );
};

export { SalesOverview };
