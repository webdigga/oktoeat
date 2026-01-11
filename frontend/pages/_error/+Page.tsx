import { usePageContext } from 'vike-react/usePageContext';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import styles from './ErrorPage.module.css';

export default function Page() {
  const pageContext = usePageContext();
  const is404 = pageContext.is404;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.code}>{is404 ? '404' : '500'}</h1>
          <h2 className={styles.title}>
            {is404 ? 'Page Not Found' : 'Something Went Wrong'}
          </h2>
          <p className={styles.message}>
            {is404
              ? "The page you're looking for doesn't exist or has been moved."
              : 'An unexpected error occurred. Please try again later.'}
          </p>
          <a href="/" className={styles.homeLink}>
            Go to Homepage
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
