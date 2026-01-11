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
          <h1>Terms of Use</h1>

          <p>Last updated: January 2025</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using OK to Eat (oktoeat.co.uk), you accept and agree to be
            bound by these Terms of Use. If you do not agree to these terms, please do
            not use our website.
          </p>

          <h2>Use of Service</h2>
          <p>
            OK to Eat provides food hygiene rating information for informational purposes only.
            You may use this service for personal, non-commercial purposes.
          </p>

          <h2>Data Accuracy</h2>
          <p>
            The food hygiene rating data displayed on this website is sourced from the
            Food Standards Agency. While we strive to keep the data accurate and up-to-date:
          </p>
          <ul>
            <li>We cannot guarantee the accuracy, completeness, or timeliness of the information</li>
            <li>Ratings may change at any time following re-inspection</li>
            <li>For the most current rating, please check the official FHRS website</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            OK to Eat shall not be liable for any direct, indirect, incidental, consequential,
            or punitive damages arising from your use of or inability to use this website,
            or from any information provided on this website.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            Food hygiene rating data is provided by the Food Standards Agency under the
            Open Government Licence. The OK to Eat website design, code, and branding
            are our property.
          </p>

          <h2>Links to Third Parties</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible
            for the content or practices of any linked websites.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Changes will be
            effective immediately upon posting to this page.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with the
            laws of England and Wales.
          </p>
        </article>
      </main>

      <Footer />

      <StaticPageStructuredData
        pageType="WebPage"
        name="Terms of Use - OK to Eat"
        description="Terms of use for OK to Eat. Read our terms and conditions for using this website."
        path="/terms"
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: 'Terms of Use', url: `${DOMAIN}/terms` },
        ]}
      />
    </div>
  );
}
