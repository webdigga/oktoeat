import { useData } from 'vike-react/useData';
import type { HomePageData } from '../../functions/_shared/types';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/SEO/StructuredData';
import styles from './HomePage.module.css';

export default function Page() {
  const { topLocations, totalBusinesses, totalLocations } = useData<HomePageData>();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            Check Food Hygiene Ratings
          </h1>
          <p className={styles.subtitle}>
            Search {totalBusinesses.toLocaleString()} restaurants, takeaways, and food businesses across the UK
          </p>

          <div className={styles.searchWrapper}>
            <SearchBox autoFocus placeholder="Search by name or location..." />
          </div>
        </section>

        <section className={styles.locations}>
          <h2 className={styles.sectionTitle}>Popular Locations</h2>
          <div className={styles.locationGrid}>
            {topLocations.map((location) => (
              <a
                key={location.slug}
                href={`/area/${location.slug}`}
                className={styles.locationCard}
              >
                <span className={styles.locationName}>{location.name}</span>
                <span className={styles.locationCount}>
                  {location.businessCount.toLocaleString()} businesses
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.about}>
          <h2 className={styles.sectionTitle}>About Food Hygiene Ratings</h2>
          <div className={styles.ratingGuide}>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="5">5</span>
              <div>
                <strong>Very Good</strong>
                <p>Hygiene standards are very good</p>
              </div>
            </div>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="4">4</span>
              <div>
                <strong>Good</strong>
                <p>Hygiene standards are good</p>
              </div>
            </div>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="3">3</span>
              <div>
                <strong>Generally Satisfactory</strong>
                <p>Hygiene standards are generally satisfactory</p>
              </div>
            </div>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="2">2</span>
              <div>
                <strong>Improvement Necessary</strong>
                <p>Some improvement is necessary</p>
              </div>
            </div>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="1">1</span>
              <div>
                <strong>Major Improvement Necessary</strong>
                <p>Major improvement is necessary</p>
              </div>
            </div>
            <div className={styles.ratingItem}>
              <span className={styles.ratingBadge} data-rating="0">0</span>
              <div>
                <strong>Urgent Improvement Necessary</strong>
                <p>Urgent improvement is required</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <WebsiteStructuredData />
      <OrganizationStructuredData />
    </div>
  );
}
