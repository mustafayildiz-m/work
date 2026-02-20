import { FormattedMessage } from "react-intl";
import { ShoppingCart } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStoreClient } from '../../components/context';

export function Card1() {
  const { showCartSheet } = useStoreClient();

  return (
    <Card className="bg-violet-50 border-violet-200 h-full">
      <CardContent className="flex items-center flex-wrap sm:flex-nowrap justify-between gap-5 lg:gap-9 px-7.5 pb-0">
        <div className="flex flex-col">
          <div className="mb-3">
            <Badge size="sm" variant="destructive" className="uppercase">
              <FormattedMessage id="UI.SAVE_25" />
            </Badge>
          </div>

          <h3 className="text-[26px] font-semibold text-mono mb-1">
            <FormattedMessage id="UI.NIKE_AIR_MAX_270" />
          </h3>

          <span className="text-sm font-normal text-foreground mb-5 leading-5.5">
            <FormattedMessage id="UI.THE_MELODIC_MONSTER_OF_SONIC_DELIGHTS_AN" />
          </span>

          <div className="flex items-center gap-4">
            <Button size="sm" variant="mono" onClick={showCartSheet}>
              <ShoppingCart /> <FormattedMessage id="UI.ADD_TO_CARD" />
            </Button>
            <span className="text-base font-semibold text-mono">$140.00</span>
          </div>
        </div>

        <img
          src={toAbsoluteUrl('/media/store/client/600x600/16.png')}
          className="h-[250px]"
          alt="image"
        />
      </CardContent>
    </Card>
  );
}
