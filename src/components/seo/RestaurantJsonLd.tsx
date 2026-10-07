import React from 'react';
import { restaurantConfig } from '../../../restaurant.config';

const RestaurantJsonLd: React.FC = () => {
  const { contact, openingHours, siteUrl, socials, name, description } =
    restaurantConfig;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    description,
    url: siteUrl,
    image: `${siteUrl}/og`,
    telephone: contact.phone,
    email: contact.email,
    priceRange: '$$$',
    servesCuisine: ['Fine dining', 'Steakhouse', 'Halal'],
    acceptsReservations: true,
    menu: `${siteUrl}/#menu`,
    sameAs: [socials.instagram, socials.telegram, socials.facebook],
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: 'Toshkent',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: contact.geo.lat,
      longitude: contact.geo.lng,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: openingHours.open,
      closes: openingHours.close,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default RestaurantJsonLd;
