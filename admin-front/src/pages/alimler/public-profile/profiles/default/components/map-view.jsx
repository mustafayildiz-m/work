import { FormattedMessage } from "react-intl";
import React from 'react';

export function MapView({ latitude, longitude, locationName }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full rounded-lg overflow-hidden border border-muted" style={{height: 300, minHeight: 200}}>
        <iframe
          title="Harita"
          width="100%"
          height="100%"
          src={mapSrc}
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      {locationName && (
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-primary underline text-sm hover:text-primary-dark"
        >
          {locationName} <FormattedMessage id="UI.HARITADA_AC" />
        </a>
      )}
    </div>
  );
} 