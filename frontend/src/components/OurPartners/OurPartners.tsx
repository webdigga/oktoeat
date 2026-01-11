import styles from './OurPartners.module.css';

export function OurPartners() {
  return (
    <section className={styles.partners}>
      <div className={styles.inner}>
        <p className={styles.label}>Our Partners</p>
        <div className={styles.container}>
          <a
            href="https://arragondigital.com/?utm_source=oktoeat&utm_medium=partner&utm_campaign=food"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.arragon}`}
          >
            <span className={styles.adBadge}>Ad</span>
            <span className={styles.brand}>Arragon Digital</span>
            <span className={styles.tagline}>Digital solutions that deliver results</span>
          </a>

          <a
            href="https://kabooly.com/?utm_source=oktoeat&utm_medium=partner&utm_campaign=food"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.card} ${styles.kabooly}`}
          >
            <span className={styles.adBadge}>Ad</span>
            <span className={styles.brand}>Kabooly</span>
            <span className={styles.tagline}>Simple, powerful CRM for growing teams</span>
          </a>
        </div>
      </div>
    </section>
  );
}
