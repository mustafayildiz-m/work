import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Payment() {
  return (
    <Card>
      <CardHeader className="px-5 min-h-[44px]">
        <CardTitle className="text-sm"><FormattedMessage id="UI.PAYMENT" /></CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5">
          <img
            src={toAbsoluteUrl('/media/brand-logos/visa.svg')}
            className="size-12"
            alt="image"
          />

          <div className="flex flex-col gap-0.5 text-2sm">
            <span className="font-semibold text-mono"><FormattedMessage id="UI.JEROEN_VAN_DIJK" /></span>
            <span className="font-normal text-mono">
              <FormattedMessage id="UI.ENDING_3604_EXPIRES_ON_122026" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
