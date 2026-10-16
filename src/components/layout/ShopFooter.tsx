import { ShopFooterLogo } from "./ShopFooterLogo";
import styles from "./ShopFooter.module.css";

export function ShopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.labels}>
        <a
          href="https://www.instagram.com/uschh_/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLink}
        >
          Instagram
        </a>
        <span>Términos</span>
      </div>
      <ShopFooterLogo className={styles.logo} />
      <p className={styles.handle}>@Uschh2026</p>
    </footer>
  );
}
