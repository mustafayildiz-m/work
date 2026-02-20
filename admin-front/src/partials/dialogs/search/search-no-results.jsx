import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

export function SearchNoResults() {
  return (
    <div className="flex flex-col text-center py-9 gap-5">
      <div className="flex justify-center">
        <img
          src={toAbsoluteUrl('/media/illustrations/33.svg')}
          className="dark:hidden max-h-[113px]"
          alt="image"
        />

        <img
          src={toAbsoluteUrl('/media/illustrations/33-dark.svg')}
          className="light:hidden max-h-[113px]"
          alt="image"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-mono text-center">
          <FormattedMessage id="UI.NO_RESULTS_FOUND" />
        </h3>
        <span className="text-sm font-medium text-center text-secondary-foreground">
          <FormattedMessage id="UI.REFINE_YOUR_QUERY_TO_DISCOVER_RELEVANT_I" />
        </span>
      </div>
      <div className="flex justify-center">
        <Button variant="outline"><FormattedMessage id="UI.VIEW_PROJECTS" /></Button>
      </div>
    </div>
  );
}
