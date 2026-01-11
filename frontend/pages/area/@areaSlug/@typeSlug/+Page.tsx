import { useData } from 'vike-react/useData';
import type { TypePageData } from '../../../../functions/_shared/types';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { BusinessCard } from '@/components/BusinessCard/BusinessCard';
import { TypeListStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from '../AreaPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  const { location, businessType, businesses, totalPages, currentPage } = useData<TypePageData>();

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav className={styles.breadcrumbs}>
          <a href="/">Home</a>
          <span>/</span>
          <a href={`/area/${location.slug}`}>{location.name}</a>
          <span>/</span>
          <span>{businessType.name}</span>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{businessType.name} in {location.name}</h1>
          <p className={styles.subtitle}>
            {businessType.businessCount.toLocaleString()} {businessType.name.toLowerCase()} businesses
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
            <div className={styles.businessGrid}>
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <p>No {businessType.name.toLowerCase()} found in {location.name}.</p>
          )}

          {totalPages > 1 && (
            <nav className={styles.pagination}>
              {currentPage > 1 && (
                <a
                  href={`/area/${location.slug}/${businessType.slug}?page=${currentPage - 1}`}
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
                  href={`/area/${location.slug}/${businessType.slug}?page=${currentPage + 1}`}
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

      <TypeListStructuredData location={location} businessType={businessType} businesses={businesses} />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          { name: location.name, url: `${DOMAIN}/area/${location.slug}` },
          { name: businessType.name, url: `${DOMAIN}/area/${location.slug}/${businessType.slug}` },
        ]}
      />
    </div>
  );
}
