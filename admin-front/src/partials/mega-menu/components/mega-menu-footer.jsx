import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';

const MegaMenuFooter = () => {
  return (
    <div className="flex flex-wrap items-center lg:justify-between rounded-xl lg:rounded-t-none bg-accent/50 border border-border lg:border-0 lg:border-t lg:border-t-gray-100 dark:lg:border-t-gray-100 px-4 py-4 lg:px-7.5 lg:py-5 gap-2.5">
      <div className="flex flex-col gap-1.5">
        <div className="text-base font-semibold text-mono leading-none">
          <FormattedMessage id="UI.READ_TO_GET_STARTED_" />
        </div>
        <div className="text-sm fomt-medium text-secondary-foreground">
          <FormattedMessage id="UI.TAKE_YOUR_DOCS_TO_THE_NEXT_LEVEL_OF_METR" />
        </div>
      </div>
      <NavigationMenuLink>
        <Button variant="mono" asChild>
          <Link to="https://keenthemes.com/metronic" target="_blank">
            <FormattedMessage id="UI.READ_DOCUMENTATION" />
          </Link>
        </Button>
      </NavigationMenuLink>
    </div>
  );
};

export { MegaMenuFooter };
