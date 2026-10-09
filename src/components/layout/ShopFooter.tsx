import { ShopFooterLogo } from "./ShopFooterLogo";
import styles from "./ShopFooter.module.css";

export function ShopFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.labels}>
        <span>Instagram</span>
        <span>TikTok</span>
        <span>Términos</span>
      </div>
      <ShopFooterLogo className={styles.logo} />
      <p className={styles.handle}>@Uschh2026</p>
    </footer>
  );
}
