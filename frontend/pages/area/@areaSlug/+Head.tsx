import { useData } from 'vike-react/useData';
import type { LocationPageData } from '../../../functions/_shared/types';

const DOMAIN = 'https://oktoeat.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const { location, currentPage } = useData<LocationPageData>();

  const pageStr = currentPage > 1 ? ` - Page ${currentPage}` : '';
  const title = `Food Hygiene Ratings in ${location.name}${pageStr} | OK to Eat`;
  const description = `Check food hygiene ratings for ${location.businessCount.toLocaleString()} restaurants, takeaways, and food businesses in ${location.name}. Find the cleanest places to eat.`;
  const url = `${DOMAIN}/area/${location.slug}${currentPage > 1 ? `?page=${currentPage}` : ''}`;

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
