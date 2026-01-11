import type { Business, Location, BusinessType } from '../../../functions/_shared/types';

const DOMAIN = 'https://oktoeat.co.uk';

// Helper to create JSON-LD script tag
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Website schema with SearchAction for homepage
export function WebsiteStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OK to Eat',
    url: DOMAIN,
    description: 'Check food hygiene ratings for restaurants, takeaways, and food businesses across the UK',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DOMAIN}/area/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// Organization schema for site identity
export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OK to Eat',
    url: DOMAIN,
    logo: `${DOMAIN}/favicon-96x96.png`,
    description: 'UK Food Hygiene Ratings - helping you find safe places to eat',
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    knowsAbout: ['food hygiene', 'food safety', 'restaurant ratings', 'UK food standards'],
  };

  return <JsonLd data={data} />;
}

// FoodEstablishment schema for business pages
interface FoodEstablishmentProps {
  business: Business;
}

export function FoodEstablishmentStructuredData({ business }: FoodEstablishmentProps) {
  const ratingLabels: Record<number, string> = {
    5: 'Very Good',
    4: 'Good',
    3: 'Generally Satisfactory',
    2: 'Improvement Necessary',
    1: 'Major Improvement Necessary',
    0: 'Urgent Improvement Necessary',
  };

  const url = `${DOMAIN}/business/${business.slug}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: business.name,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      postalCode: business.postcode || undefined,
      addressLocality: business.town || undefined,
      addressCountry: 'GB',
    },
  };

  // Add geo coordinates if available
  if (business.latitude && business.longitude) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    };
  }

  // Add rating if available (using aggregateRating for hygiene score)
  if (business.rating !== null) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      bestRating: 5,
      worstRating: 0,
      ratingCount: 1,
      reviewCount: 1,
    };

    // Add review for the hygiene inspection
    data.review = {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: business.rating,
        bestRating: 5,
        worstRating: 0,
      },
      author: {
        '@type': 'Organization',
        name: business.localAuthority || 'Food Standards Agency',
      },
      reviewBody: `Food hygiene rating: ${business.rating}/5 - ${ratingLabels[business.rating] || 'Unknown'}`,
      datePublished: business.ratingDate || undefined,
    };
  }

  // Add business type if available
  if (business.businessType) {
    data.servesCuisine = business.businessType;
  }

  return <JsonLd data={data} />;
}

// Area/Location schema
interface AreaProps {
  location: Location;
}

export function AreaStructuredData({ location }: AreaProps) {
  const url = `${DOMAIN}/area/${location.slug}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Food Hygiene Ratings in ${location.name}`,
    description: `Check food hygiene ratings for ${location.businessCount.toLocaleString()} restaurants and food businesses in ${location.name}`,
    url,
    mainEntity: {
      '@type': 'Place',
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.name,
        addressCountry: 'GB',
      },
    },
  };

  return <JsonLd data={data} />;
}

// ItemList schema for best/worst pages
interface BusinessListProps {
  location: Location;
  businesses: Business[];
  type: 'best' | 'worst';
}

export function BusinessListStructuredData({ location, businesses, type }: BusinessListProps) {
  const url = `${DOMAIN}/area/${location.slug}/${type}`;
  const title = type === 'best'
    ? `Best Rated Food Businesses in ${location.name}`
    : `Lowest Rated Food Businesses in ${location.name}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url,
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 20).map((business, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'FoodEstablishment',
        name: business.name,
        url: `${DOMAIN}/business/${business.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          postalCode: business.postcode || undefined,
          addressLocality: business.town || undefined,
          addressCountry: 'GB',
        },
        ...(business.rating !== null && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: business.rating,
            bestRating: 5,
            worstRating: 0,
          },
        }),
      },
    })),
  };

  return <JsonLd data={data} />;
}

// ItemList for business type pages
interface TypeListProps {
  location: Location;
  businessType: BusinessType;
  businesses: Business[];
}

export function TypeListStructuredData({ location, businessType, businesses }: TypeListProps) {
  const url = `${DOMAIN}/area/${location.slug}/${businessType.slug}`;
  const title = `${businessType.name} in ${location.name}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url,
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 20).map((business, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'FoodEstablishment',
        name: business.name,
        url: `${DOMAIN}/business/${business.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          postalCode: business.postcode || undefined,
          addressCountry: 'GB',
        },
        ...(business.rating !== null && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: business.rating,
            bestRating: 5,
            worstRating: 0,
          },
        }),
      },
    })),
  };

  return <JsonLd data={data} />;
}

// Breadcrumb schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({ items }: BreadcrumbProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

// Static page schema
interface StaticPageProps {
  pageType: 'AboutPage' | 'WebPage';
  name: string;
  description: string;
  path: string;
}

export function StaticPageStructuredData({ pageType, name, description, path }: StaticPageProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': pageType,
    name,
    description,
    url: `${DOMAIN}${path}`,
    inLanguage: 'en-GB',
    isPartOf: {
      '@type': 'WebSite',
      name: 'OK to Eat',
      url: DOMAIN,
    },
  };

  return <JsonLd data={data} />;
}
