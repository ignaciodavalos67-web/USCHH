import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { StoreThemeRoot } from "@/components/store/StoreThemeRoot";
import styles from "@/components/home/HomeTheme.module.css";

export const metadata: Metadata = {
  title: "USCHH | Eleva tu potencial",
  description: "Suplementos y electrolitos funcionales para acompañar tu movimiento, tu entrenamiento y tus metas.",
};

export default function HomePage() {
  return (
    <StoreThemeRoot className={styles.homeRoot}>
      <Navbar minimal storeTheme />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ProductsSection />
        <PhilosophySection />
        <CommunitySection />
      </main>
      <HomeFooter />
    </StoreThemeRoot>
  );
}
