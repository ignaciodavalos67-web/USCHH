import { Navbar } from "@/components/layout/Navbar";
import styles from "./shop.module.css";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.storefront}><Navbar />{children}</div>;
}
