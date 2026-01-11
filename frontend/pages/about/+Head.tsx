const DOMAIN = 'https://oktoeat.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const title = 'About OK to Eat - UK Food Hygiene Ratings';
  const description = 'Learn about OK to Eat and how we help you find food hygiene ratings for restaurants and takeaways across the UK.';
  const url = `${DOMAIN}/about`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="OK to Eat" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}
