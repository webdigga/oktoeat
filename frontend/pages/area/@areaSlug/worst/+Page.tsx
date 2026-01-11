import { useData } from 'vike-react/useData';
import type { BestWorstPageData } from '../../../../functions/_shared/types';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { BusinessCard } from '@/components/BusinessCard/BusinessCard';
import { BusinessListStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from '../AreaPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  const { location, businesses, totalCount } = useData<BestWorstPageData>();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span>/</span>
          <a href={`/area/${location.slug}`}>{location.name}</a>
          <span>/</span>
          <span>Worst Rated</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Worst Rated Food Businesses in {location.name}</h1>
          <p className={styles.subtitle}>
            {totalCount.toLocaleString()} businesses with ratings of 0-2 stars
          </p>

          <div className={styles.quickLinks}>
            <a href={`/area/${location.slug}`} className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>📍</span>
              All Businesses
            </a>
            <a href={`/area/${location.slug}/best`} className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>⭐</span>
              Best Rated
            </a>
          </div>
        </header>

        <section className={styles.businesses}>
          {businesses.length > 0 ? (
            <>
              <div className={styles.businessGrid}>
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
              <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                Note: Ratings can change after re-inspection. Always check the latest rating before visiting.
              </p>
            </>
          ) : (
            <p>No businesses with ratings of 0-2 found in {location.name}. Great news!</p>
          )}
        </section>
      </main>

      <Footer />

      <BusinessListStructuredData location={location} businesses={businesses} type="worst" />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: location.name, url: `${DOMAIN}/area/${location.slug}` },
          { name: 'Worst Rated', url: `${DOMAIN}/area/${location.slug}/worst` },
        ]}
      />
    </div>
  );
}
