import { Navbar } from "@/components/layout/Navbar";
import { ShopFooter } from "@/components/layout/ShopFooter";
import { StoreThemeRoot } from "@/components/store/StoreThemeRoot";
import styles from "./shop.module.css";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <StoreThemeRoot className={styles.storefront}><Navbar storeTheme />{children}<ShopFooter /></StoreThemeRoot>;
}
