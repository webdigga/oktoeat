import styles from './RatingBadge.module.css';

interface RatingBadgeProps {
  rating: number | null;
  ratingKey?: string | null;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ratingLabels: Record<number, string> = {
  5: 'Very Good',
  4: 'Good',
  3: 'Generally Satisfactory',
  2: 'Improvement Necessary',
  1: 'Major Improvement Necessary',
  0: 'Urgent Improvement Necessary',
};

export function RatingBadge({ rating, ratingKey, size = 'medium', showLabel = false }: RatingBadgeProps) {
  // Handle special cases
  if (rating === null || rating === undefined) {
    const isExempt = ratingKey?.toLowerCase().includes('exempt');
    const isAwaiting = ratingKey?.toLowerCase().includes('awaiting');

    if (isExempt) {
      return (
        <div className={`${styles.badge} ${styles.exempt} ${styles[size]}`}>
          <span className={styles.value}>-</span>
          {showLabel && <span className={styles.label}>Exempt</span>}
        </div>
      );
    }

    return (
      <div className={`${styles.badge} ${styles.awaiting} ${styles[size]}`}>
        <span className={styles.value}>?</span>
        {showLabel && <span className={styles.label}>Awaiting Inspection</span>}
      </div>
    );
  }

  const label = ratingLabels[rating] || 'Unknown';
  const ratingClass = `rating${rating}`;

  return (
    <div className={`${styles.badge} ${styles[ratingClass]} ${styles[size]}`}>
      <span className={styles.value}>{rating}</span>
      {showLabel && <span className={styles.label}>{label}</span>}
    </div>
  );
}
