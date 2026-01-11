import { useData } from 'vike-react/useData';
import type { BusinessPageData } from '../../../functions/_shared/types';

const DOMAIN = 'https://oktoeat.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

const ratingLabels: Record<number, string> = {
  5: 'Very Good',
  4: 'Good',
  3: 'Generally Satisfactory',
  2: 'Improvement Necessary',
  1: 'Major Improvement Necessary',
  0: 'Urgent Improvement Necessary',
};

export function Head() {
  const { business } = useData<BusinessPageData>();

  const ratingText = business.rating !== null
    ? `${business.rating}/5 - ${ratingLabels[business.rating]}`
    : 'Awaiting Inspection';

  const title = `${business.name} Food Hygiene Rating - ${ratingText} | OK to Eat`;
  const description = `${business.name} in ${business.town || business.localAuthority || 'UK'} has a food hygiene rating of ${ratingText}. ${business.businessType ? `Type: ${business.businessType}.` : ''} Check the full inspection details.`;
  const url = `${DOMAIN}/business/${business.slug}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="OK to Eat" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}
