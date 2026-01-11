import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { StaticPageStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from './AboutPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <article className={styles.content}>
          <h1>About OK to Eat</h1>

          <p>
            OK to Eat helps you make informed decisions about where to eat by providing
            easy access to official food hygiene ratings for restaurants, takeaways, and
            food businesses across the UK.
          </p>

          <h2>What are Food Hygiene Ratings?</h2>
          <p>
            Food hygiene ratings are given by local authorities to food businesses in the UK.
            They show how well businesses are meeting food hygiene law. The scheme operates in
            England, Wales, and Northern Ireland.
          </p>

          <p>
            Businesses are rated from 0 to 5, with 5 being the best:
          </p>

          <ul>
            <li><strong>5 - Very Good:</strong> Hygiene standards are very good</li>
            <li><strong>4 - Good:</strong> Hygiene standards are good</li>
            <li><strong>3 - Generally Satisfactory:</strong> Hygiene standards are generally satisfactory</li>
            <li><strong>2 - Improvement Necessary:</strong> Some improvement is necessary</li>
            <li><strong>1 - Major Improvement Necessary:</strong> Major improvement is necessary</li>
            <li><strong>0 - Urgent Improvement Necessary:</strong> Urgent improvement is required</li>
          </ul>

          <h2>Our Data Source</h2>
          <p>
            All food hygiene rating data on this website comes from the{' '}
            <a href="https://www.food.gov.uk/" target="_blank" rel="noopener noreferrer">
              Food Standards Agency
            </a>
            . The data is published under the{' '}
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Government Licence v3.0
            </a>
            .
          </p>

          <p>
            We update our database regularly to ensure you have access to the most current
            ratings available.
          </p>

          <h2>Disclaimer</h2>
          <p>
            While we strive to keep our data as up-to-date as possible, food hygiene ratings
            can change at any time following re-inspection. For the most accurate and current
            rating, we recommend checking directly with the{' '}
            <a href="https://ratings.food.gov.uk/" target="_blank" rel="noopener noreferrer">
              official FHRS website
            </a>
            .
          </p>

          <p>
            OK to Eat is not affiliated with the Food Standards Agency or any government body.
          </p>
        </article>
      </main>

      <Footer />

      <StaticPageStructuredData
        pageType="AboutPage"
        name="About OK to Eat"
        description="Learn about OK to Eat and how we provide food hygiene rating information for UK food businesses."
        path="/about"
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: 'About', url: `${DOMAIN}/about` },
        ]}
      />
    </div>
  );
}
