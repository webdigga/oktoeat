import { KaboolyBanner } from '../KaboolyBanner/KaboolyBanner';
import styles from './Header.module.css';

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  return (
    <>
      <KaboolyBanner />
      <header className={styles.header}>
      <div className={styles.container}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✓</span>
          <span className={styles.logoText}>OK to Eat</span>
        </a>

        <nav className={styles.nav}>
          <a href="/about" className={styles.navLink}>About</a>
        </nav>
      </div>
    </header>
    </>
  );
}
