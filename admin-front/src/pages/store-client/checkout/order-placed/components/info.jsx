import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Info() {
  return (
    <Card>
      <CardHeader className="px-5 min-h-[44px]">
        <CardTitle className="text-sm"><FormattedMessage id="UI.DELIVERY_TO" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-semibold text-mono mb-2.5">
          <FormattedMessage id="UI.JEROEN_VAN_DIJK" />
        </div>

        <div className="flex flex-col gap-2 text-2sm font-normal text-mono">
          <span><FormattedMessage id="UI.KEIZERSGRACHT_172" /></span>
          <span><FormattedMessage id="UI.1016_DW_AMSTERDAM" /></span>
          <span><FormattedMessage id="UI.NETHERLANDS" /></span>
          <span><FormattedMessage id="UI.PHONE_NUMBER_31612345678" /></span>
        </div>
      </CardContent>
    </Card>
  );
}
