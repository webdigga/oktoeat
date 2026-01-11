import { useData } from 'vike-react/useData';
import type { BusinessPageData } from '../../../functions/_shared/types';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { RatingBadge } from '@/components/RatingBadge/RatingBadge';
import { BusinessCard } from '@/components/BusinessCard/BusinessCard';
import { FoodEstablishmentStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData';
import styles from './BusinessPage.module.css';

const DOMAIN = 'https://oktoeat.co.uk';

export default function Page() {
  const { business, nearbyBusinesses } = useData<BusinessPageData>();

  const formattedDate = business.ratingDate
    ? new Date(business.ratingDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <nav className={styles.breadcrumbs}>
          <a href="/">Home</a>
          {business.townSlug && business.town && (
            <>
              <span>/</span>
              <a href={`/area/${business.townSlug}`}>{business.town}</a>
            </>
          )}
          <span>/</span>
          <span>{business.name}</span>
        </nav>

        <article className={styles.businessCard}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.name}>{business.name}</h1>
              {business.businessType && (
                <span className={styles.type}>{business.businessType}</span>
              )}
            </div>
            <RatingBadge
              rating={business.rating}
              ratingKey={business.ratingKey}
              size="large"
              showLabel
            />
          </header>

          <div className={styles.details}>
            <section className={styles.section}>
              <h2>Address</h2>
              <address className={styles.address}>
                {business.address}
                {business.postcode && (
                  <>
                    <br />
                    {business.postcode}
                  </>
                )}
              </address>
            </section>

            <section className={styles.section}>
              <h2>Inspection Details</h2>
              <dl className={styles.detailList}>
                {formattedDate && (
                  <>
                    <dt>Last Inspected</dt>
                    <dd>{formattedDate}</dd>
                  </>
                )}
                {business.localAuthority && (
                  <>
                    <dt>Local Authority</dt>
                    <dd>{business.localAuthority}</dd>
                  </>
                )}
                <dt>FHRS ID</dt>
                <dd>{business.fhrsId}</dd>
              </dl>
            </section>
          </div>

          <section className={styles.ratingExplainer}>
            <h2>What does this rating mean?</h2>
            {business.rating === 5 && (
              <p>A rating of <strong>5 (Very Good)</strong> means hygiene standards are very good and fully comply with the law.</p>
            )}
            {business.rating === 4 && (
              <p>A rating of <strong>4 (Good)</strong> means hygiene standards are good. The business is compliant with the law with only minor issues.</p>
            )}
            {business.rating === 3 && (
              <p>A rating of <strong>3 (Generally Satisfactory)</strong> means hygiene standards are generally satisfactory. Some improvements may be needed.</p>
            )}
            {business.rating === 2 && (
              <p>A rating of <strong>2 (Improvement Necessary)</strong> means some improvement is necessary. The business needs to make changes to comply with hygiene standards.</p>
            )}
            {business.rating === 1 && (
              <p>A rating of <strong>1 (Major Improvement Necessary)</strong> means major improvement is necessary. Significant changes are required.</p>
            )}
            {business.rating === 0 && (
              <p>A rating of <strong>0 (Urgent Improvement Necessary)</strong> means urgent improvement is required. Immediate action is needed to address serious hygiene issues.</p>
            )}
            {business.rating === null && (
              <p>This business is either <strong>awaiting inspection</strong> or is <strong>exempt</strong> from the rating scheme.</p>
            )}
          </section>
        </article>

        {nearbyBusinesses.length > 0 && (
          <section className={styles.nearby}>
            <h2>Other businesses in {business.town}</h2>
            <div className={styles.nearbyGrid}>
              {nearbyBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
            {business.townSlug && (
              <a href={`/area/${business.townSlug}`} className={styles.viewAll}>
                View all businesses in {business.town}
              </a>
            )}
          </section>
        )}
      </main>

      <Footer />

      <FoodEstablishmentStructuredData business={business} />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: DOMAIN },
          ...(business.townSlug && business.town
            ? [{ name: business.town, url: `${DOMAIN}/area/${business.townSlug}` }]
            : []),
          { name: business.name, url: `${DOMAIN}/business/${business.slug}` },
        ]}
      />
    </div>
  );
}
