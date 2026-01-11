import styles from './KaboolyBanner.module.css';

export function KaboolyBanner() {
  return (
    <a
      href="https://kabooly.com/crm/how-it-works/?utm_source=oktoeat&utm_medium=banner&utm_campaign=food"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.banner}
    >
      <img
        src="/rocket-background.avif"
        alt="Kabooly CRM"
        className={styles.logo}
        width={50}
        height={48}
        loading="lazy"
      />
      <span className={styles.text}>
        Need a CRM? Try Kabooly - simple, powerful, and refreshingly easy to use
      </span>
      <span className={styles.cta}>Learn more</span>
    </a>
  );
}
