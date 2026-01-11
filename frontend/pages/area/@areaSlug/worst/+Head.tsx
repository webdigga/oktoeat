import { useData } from 'vike-react/useData';
import type { BestWorstPageData } from '../../../../functions/_shared/types';

const DOMAIN = 'https://oktoeat.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const { location, totalCount } = useData<BestWorstPageData>();

  const title = `Worst Food Hygiene Ratings in ${location.name} - ${totalCount} Businesses to Avoid | OK to Eat`;
  const description = `${totalCount} food businesses in ${location.name} with poor hygiene ratings (0-2 stars). Check before you eat - these places need improvement.`;
  const url = `${DOMAIN}/area/${location.slug}/worst`;

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
