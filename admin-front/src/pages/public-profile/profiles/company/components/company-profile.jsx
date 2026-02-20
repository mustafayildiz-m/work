import { FormattedMessage } from "react-intl";
import L from 'leaflet';
import { Link } from 'react-router';
import 'leaflet/dist/leaflet.css';
import {
  RiFacebookCircleLine,
  RiWhatsappLine,
  RiYoutubeLine,
} from '@remixicon/react';
import { Dribbble, MapPinHouse } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CompanyProfile = () => {
  const rows = [
    {
      icon: Dribbble,
      text: 'https://duolingo.com',
      info: true,
    },
    {
      icon: RiFacebookCircleLine,
      text: 'duolingo',
      info: true,
    },
    {
      icon: RiYoutubeLine,
      text: 'duolingo-tuts',
      info: true,
    },
    {
      icon: RiWhatsappLine,
      text: '(31) 6-1235-4567',
      info: false,
    },
    {
      icon: MapPinHouse,
      text: 'Herengracht 501, 1017 BV Amsterdam, NL',
      info: false,
    },
  ];

  const products = [
    { label: 'Lingo Kids' },
    { label: 'Lingo Express' },
    { label: 'Fun Learning' },
    { label: 'Lingo Espanol' },
    { label: 'Speaking Mastery' },
    { label: 'Grammar Guru' },
    { label: 'Lingo Quest' },
    { label: 'History Lessons' },
    { label: 'Global Explorer' },
    { label: 'Translator' },
    { label: 'Webflow' },
    { label: 'Language Lab' },
    { label: 'Lingo Plus' },
  ];

  const renderRows = (row, index) => {
    return (
      <div key={index} className="flex items-center gap-2.5">
        <span>
          <row.icon className="text-lg text-muted-foreground" size={18} />
        </span>
        {row.info ? (
          <Link to={row.text} className="link text-sm font-medium">
            {row.text}
          </Link>
        ) : (
          <span className="text-sm text-mono">{row.text}</span>
        )}
      </div>
    );
  };

  const renderProducts = (product, index) => {
    return (
      <Badge key={index} size="lg" variant="secondary" appearance="outline">
        {product.label}
      </Badge>
    );
  };

  const customIcon = L.divIcon({
    html: `<i class="ki-solid ki-geolocation text-3xl text-green-500"></i>`,
    className: 'leaflet-marker',
    bgPos: [10, 10],
    iconAnchor: [20, 37],
    popupAnchor: [0, -37],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle><FormattedMessage id="UI.COMPANY_PROFILE" /></CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-base font-semibold text-mono leading-none mb-5">
          <FormattedMessage id="UI.HEADQUARTER" />
        </h3>
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <MapContainer
            center={[40.725, -73.985]}
            zoom={30}
            className="rounded-xl w-full md:w-80 min-h-52"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[40.724716, -73.984789]} icon={customIcon}>
              <Popup><FormattedMessage id="UI.430_E_6TH_ST_NEW_YORK_10009" /></Popup>
            </Marker>
          </MapContainer>
          <div className="flex flex-col gap-2.5">
            {rows.map((row, index) => {
              return renderRows(row, index);
            })}
          </div>
        </div>
        <div className="grid gap-2.5 mb-7">
          <div className="text-base font-semibold text-mono"><FormattedMessage id="UI.ABOUT" /></div>
          <p className="text-sm text-foreground leading-5.5">
            <FormattedMessage id="UI.NOW_THAT_IM_DONE_THOROUGHLY_MANGLING_THA_1" />
          </p>
        </div>
        <div className="flex flex-col gap-4 mb-2.5">
          <div className="text-base font-semibold text-mono"><FormattedMessage id="UI.PRODUCTS" /></div>
          <div className="flex flex-wrap gap-2.5">
            {products.map((product, index) => {
              return renderProducts(product, index);
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { CompanyProfile };
