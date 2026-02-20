import { FormattedMessage } from "react-intl";
import { ShoppingCart } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStoreClient } from '../../components/context';

export function Card2({ bgColor, borderColor, title, total, logo }) {
  const { showCartSheet } = useStoreClient();

  return (
    <Card className={`h-full ${bgColor} ${borderColor}`}>
      <CardContent className="flex flex-col items-center justify-center px-5 pb-0">
        <div className="mb-3.5">
          <Badge size="sm" variant="destructive" className="uppercase">
            <FormattedMessage id="UI.SAVE_25" />
          </Badge>
        </div>

        <span className="text-base font-medium text-mono mb-3">{title}</span>
        <Button
          size="sm"
          variant="outline"
          className="mb-2.5"
          onClick={showCartSheet}
        >
          <ShoppingCart /> <FormattedMessage id="UI.ADD_TO_CARD" />
        </Button>
        <span className="text-sm font-medium text-mono">{total}</span>

        <img
          src={toAbsoluteUrl(`/media/store/client/600x600/${logo}`)}
          className="size-48"
          alt="image"
        />
      </CardContent>
    </Card>
  );
}
