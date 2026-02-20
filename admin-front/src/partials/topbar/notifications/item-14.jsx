import { FormattedMessage } from "react-intl";
import { Check } from 'lucide-react';

export default function Item14() {
  return (
    <div className="flex items-center grow gap-2.5 px-5">
      <div className="flex items-center justify-center size-8 bg-green-500-soft rounded-full border border-success-transparent">
        <Check className="text-lg text-green-500" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-secondary-foreground">
          <FormattedMessage id="UI.YOU_HAVE_SUCCESFULLY_VERIFIED_YOUR_ACCOU" />
        </span>
        <span className="font-medium text-muted-foreground text-xs">
          <FormattedMessage id="UI.2_DAYS_AGO" />
        </span>
      </div>
    </div>
  );
}
