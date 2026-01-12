export function Head() {
  return (
    <>
      {/* Google Search Console verification */}
      <meta name="google-site-verification" content="FIEU8FhQQdUzggFJvxnaXK5jwWfGhK8AvKzO9_plj5g" />

      {/* Language alternates */}
      <link rel="alternate" hrefLang="en-GB" href="https://oktoeat.co.uk/" />
      <link rel="alternate" hrefLang="x-default" href="https://oktoeat.co.uk/" />

      {/* Default Open Graph */}
      <meta property="og:locale" content="en_GB" />
      <meta property="og:site_name" content="OK to Eat" />

      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#22c55e" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="OK to Eat" />

      {/* Icons */}
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Default meta tags (overridden by page-specific +Head.tsx) */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Default title (overridden by pages) */}
      <title>OK to Eat - UK Food Hygiene Ratings</title>
      <meta
        name="description"
        content="Check food hygiene ratings for restaurants, takeaways, and food businesses across the UK. Find the cleanest places to eat near you."
      />
    </>
  );
}
