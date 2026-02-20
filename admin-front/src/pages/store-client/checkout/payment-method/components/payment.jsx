import { FormattedMessage } from "react-intl";
import { Fragment } from 'react';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Payment() {
  const items = [
    {
      brandLogo: 'visa.svg',
      title: 'Jeroen’s Visa',
      subTitle: 'Jeroen van Dijk',
      description: (
        <span className="text-xs font-normal text-mono">
          <FormattedMessage id="UI.ENDING_3604_EXPIRES_ON_122026" />
        </span>
      ),

      badge: true,
    },
    {
      brandLogo: 'ideal.svg',
      title: 'Sophie’s iDeal',
      subTitle: 'Sophie de Vries',
      description: (
        <span className="text-xs font-normal text-mono">
          <FormattedMessage id="UI.IDEAL_WITH_ABN_AMBRO" />
        </span>
      ),
    },
    {
      brandLogo: 'paypal.svg',
      title: 'Emma’s Paypal',
      subTitle: 'Emma van den Berg',
      description: (
        <Link
          to="#"
          className="hover:text-primary text-sm font-medium text-secondary-foreground"
        >
          <FormattedMessage id="UI.EMMAREUIIO" />
        </Link>
      ),
    },
    {
      brandLogo: 'american-express.svg',
      title: 'Bob’s American Express',
      subTitle: 'Bob van den Berg',
      description: (
        <Link
          to="#"
          className="hover:text-primary text-sm font-medium text-secondary-foreground"
        >
          <FormattedMessage id="UI.BOBREUIIO" />
        </Link>
      ),
    },
  ];

  const renderItem = (item, index) => (
    <Card key={index}>
      <CardHeader className="px-5">
        <CardTitle>{item.title}</CardTitle>

        {item.badge && (
          <Badge variant="success" appearance="outline">
            <FormattedMessage id="UI.PAY_WITH_THIS" />
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-5 space-y-5">
        <div className="flex items-center gap-3">
          <img
            src={toAbsoluteUrl(`/media/brand-logos/${item.brandLogo}`)}
            className="size-12"
            alt="image"
          />

          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-mono">
              {item.subTitle}
            </span>
            {item.description}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Button mode="link" underlined="dashed">
              <Link to="#"><FormattedMessage id="UI.EDIT" /></Link>
            </Button>

            <Button mode="link" underlined="dashed">
              <Link to="#"><FormattedMessage id="UI.REMOVE" /></Link>
            </Button>
          </div>

          <Button size="sm" variant="outline">
            <FormattedMessage id="UI.SELECT_CARD" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Fragment>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}
