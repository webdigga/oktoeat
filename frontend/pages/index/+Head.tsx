import { useData } from 'vike-react/useData';
import type { HomePageData } from '../../functions/_shared/types';

const DOMAIN = 'https://oktoeat.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const { totalBusinesses } = useData<HomePageData>();

  const title = 'OK to Eat - UK Food Hygiene Ratings';
  const description = `Check food hygiene ratings for ${totalBusinesses.toLocaleString()} restaurants, takeaways, and food businesses across the UK. Find the cleanest places to eat near you.`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={DOMAIN} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={DOMAIN} />
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
