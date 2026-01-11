import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { StaticPageStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from '../about/AboutPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <article className={styles.content}>
          <h1>Privacy Policy</h1>

          <p>Last updated: January 2025</p>

          <h2>Overview</h2>
          <p>
            OK to Eat ("we", "us", "our") is committed to protecting your privacy.
            This policy explains how we collect, use, and protect your information
            when you use our website at oktoeat.co.uk.
          </p>

          <h2>Information we collect</h2>

          <h3>Information you provide</h3>
          <p>
            We do not require you to create an account or provide any personal
            information to use our service.
          </p>

          <h3>Automatically collected information</h3>
          <p>
            We use Cloudflare Web Analytics to understand how visitors use our
            site. This is a privacy-focused analytics service that:
          </p>
          <ul>
            <li>Does not use cookies</li>
            <li>Does not track individual users</li>
            <li>Does not collect personal information</li>
            <li>Anonymizes all data</li>
          </ul>
          <p>
            We can see aggregate statistics such as page views, referring
            websites, and general browser/device types, but we cannot identify
            individual visitors.
          </p>

          <h2>How we use your information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide food hygiene ratings for requested locations and businesses</li>
            <li>Improve our website and service</li>
            <li>Analyse usage patterns</li>
            <li>Ensure security and prevent abuse</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            This website does not use cookies. We do not use tracking cookies,
            analytics cookies, or advertising cookies. Our analytics provider
            (Cloudflare Web Analytics) is cookieless by design.
          </p>

          <h2>Third-party services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Food Standards Agency</strong> - Food hygiene rating data
              provider. All rating data is sourced from the FSA's publicly
              available dataset under the Open Government Licence.
            </li>
            <li>
              <strong>Cloudflare</strong> - Website hosting, security, and
              privacy-focused web analytics. Cloudflare Web Analytics does not
              use cookies or track individual users.
            </li>
          </ul>
          <p>
            Each of these services has their own privacy policy governing how they
            handle data.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain server logs for up to 30 days. Food hygiene rating data is
            updated weekly from the Food Standards Agency.
          </p>

          <h2>Your rights</h2>
          <p>
            Because we use privacy-focused, cookieless analytics and do not
            collect personal information, we do not hold any data that identifies
            you as an individual.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </p>
        </article>
      </main>

      <Footer />

      <StaticPageStructuredData
        pageType="WebPage"
        name="Privacy Policy - OK to Eat"
        description="Privacy policy for OK to Eat. Learn how we handle your data and protect your privacy."
        path="/privacy"
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: 'Privacy Policy', url: `${DOMAIN}/privacy` },
        ]}
      />
    </div>
  );
}
