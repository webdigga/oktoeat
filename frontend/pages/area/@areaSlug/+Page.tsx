import { useData } from 'vike-react/useData';
import type { LocationPageData } from '../../../functions/_shared/types';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { BusinessCard } from '@/components/BusinessCard/BusinessCard';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import { AreaStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from './AreaPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  const { location, businesses, businessTypes, totalPages, currentPage } = useData<LocationPageData>();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span>/</span>
          <span>{location.name}</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Food Hygiene Ratings in {location.name}</h1>
          <p className={styles.subtitle}>
            {location.businessCount.toLocaleString()} food businesses
            {location.avgRating && (
              <> &middot; Average rating: {location.avgRating.toFixed(1)}/5</>
            )}
          </p>

          <div className={styles.quickLinks}>
            <a href={`/area/${location.slug}/best`} className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>⭐</span>
              Best Rated
            </a>
            <a href={`/area/${location.slug}/worst`} className={styles.quickLink}>
              <span className={styles.quickLinkIcon}>⚠️</span>
              Worst Rated
            </a>
          </div>
        </header>

        {businessTypes.length > 0 && (
          <section className={styles.types}>
            <h2 className={styles.sectionTitle}>Browse by Type</h2>
            <div className={styles.typeList}>
              {businessTypes.slice(0, 12).map((type) => (
                <a
                  key={type.slug}
                  href={`/area/${location.slug}/${type.slug}`}
                  className={styles.typeTag}
                >
                  {type.name}
                  <span className={styles.typeCount}>{type.businessCount}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className={styles.businesses}>
          <h2 className={styles.sectionTitle}>All Businesses</h2>
          <div className={styles.businessGrid}>
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination}>
              {currentPage > 1 && (
                <a
                  href={`/area/${location.slug}?page=${currentPage - 1}`}
                  className={styles.pageLink}
                >
                  Previous
                </a>
              )}
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <a
                  href={`/area/${location.slug}?page=${currentPage + 1}`}
                  className={styles.pageLink}
                >
                  Next
                </a>
              )}
            </nav>
          )}
        </section>
      </main>

      <Footer />

      <AreaStructuredData location={location} />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: location.name, url: `${DOMAIN}/area/${location.slug}` },
        ]}
      />
    </div>
  );
}
