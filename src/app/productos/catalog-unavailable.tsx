import Link from "next/link";
import styles from "./shop.module.css";

export default function CatalogUnavailable() {
  return <main className={styles.shop}><div className={styles.details}>
    <h1>Catálogo temporalmente no disponible</h1>
    <p className={styles.availability}>Vuelve a intentarlo más tarde.</p>
    <Link href="/" className={styles.cta}>← VOLVER A INICIO</Link>
  </div></main>;
}
