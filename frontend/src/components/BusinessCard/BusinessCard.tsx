import type { Business } from '../../../functions/_shared/types';
import { RatingBadge } from '../RatingBadge/RatingBadge';
import styles from './BusinessCard.module.css';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const formattedDate = business.ratingDate
    ? new Date(business.ratingDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <a href={`/business/${business.slug}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{business.name}</h3>
        <RatingBadge rating={business.rating} ratingKey={business.ratingKey} size="small" />
      </div>

      <div className={styles.details}>
        {business.businessType && (
          <span className={styles.type}>{business.businessType}</span>
        )}

        {business.address && (
          <p className={styles.address}>{business.address}</p>
        )}

        {business.postcode && (
          <p className={styles.postcode}>{business.postcode}</p>
        )}
      </div>

      {formattedDate && (
        <p className={styles.date}>Inspected: {formattedDate}</p>
      )}
    </a>
  );
}
