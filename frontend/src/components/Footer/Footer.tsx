import { OurPartners } from '../OurPartners/OurPartners';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <>
      <OurPartners />
      <footer className={styles.footer}>
        <div className={styles.content}>
          <nav className={styles.nav}>
            <a href="/about">About</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
          <p className={styles.attribution}>
            Rating data from{' '}
            <a
              href="https://www.food.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Food Standards Agency
            </a>
          </p>
          <p className={styles.attribution}>
            Built by{' '}
            <a
              href="https://kabooly.com/?utm_source=oktoeat&utm_medium=footer&utm_campaign=food"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kabooly
            </a>
          </p>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} OK to Eat
          </p>
        </div>
      </footer>
    </>
  );
}
