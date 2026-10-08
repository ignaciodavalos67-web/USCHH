import React from "react";
import styles from "./ProductStory.module.css";

interface ProductStoryProps {
  flavor: string;
  slug: string;
}

const MINERALS = [
  { symbol: "Na", name: "Sodio" },
  { symbol: "K", name: "Potasio" },
  { symbol: "Mg", name: "Magnesio" },
  { symbol: "Ca", name: "Calcio" },
  { symbol: "Zn", name: "Zinc" },
];

export function ProductStory({ flavor, slug }: ProductStoryProps) {
  const isMandarina =
    slug?.toLowerCase().includes("mandarina") ||
    flavor?.toLowerCase().includes("man") ||
    flavor?.toLowerCase().includes("nar");
  const isLimon =
    slug?.toLowerCase().includes("limon") ||
    flavor?.toLowerCase().includes("lim");

  const themeClass = isMandarina
    ? styles.themeMandarina
    : isLimon
    ? styles.themeLimon
    : "";

  return (
    <section
      className={`${styles.storyContainer} ${themeClass}`}
      aria-label={`Detalles y formulación de USCHH ${flavor}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. PRESENTACIÓN
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.presentationBanner}>
        <div className={styles.presentationLeft}>
          <span className={styles.eyebrow}>FORMATO & PRESENTACIÓN</span>
          <h2 className={styles.presentationTitle}>Pouch con 15 sachets individuales de 6 g</h2>
          <p className={styles.presentationDesc}>
            Formato práctico y fácil de llevar para preparar tu hidratación donde sea.
          </p>
        </div>
        <div className={styles.presentationBadge}>
          <span className={styles.badgeNumber}>15</span>
          <div className={styles.badgeLabel}>
            <span>SACHETS</span>
            <span>DE 6 G</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CARACTERÍSTICAS (5 ICONOS ELEGANTES)
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.attributesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>CALIDAD & TRANSPARENCIA</span>
          <h3>Fórmula limpia y consciente</h3>
        </div>

        <div className={styles.attributesGrid}>
          {/* 1. Vegano */}
          <div className={styles.attributeCard}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className={styles.attributeName}>Vegano</span>
          </div>

          {/* 2. Sin GMO */}
          <div className={styles.attributeCard}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className={styles.attributeName}>Sin GMO</span>
          </div>

          {/* 3. Sin azúcar */}
          <div className={styles.attributeCard}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 14.14 14.14" />
                <path d="M12 8v8" />
              </svg>
            </div>
            <span className={styles.attributeName}>Sin azúcar</span>
          </div>

          {/* 4. Gluten Free */}
          <div className={styles.attributeCard}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 2 20 20" />
                <path d="M7 17a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-3" />
                <path d="M10 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
                <path d="M12 4v10" />
              </svg>
            </div>
            <span className={styles.attributeName}>Gluten Free</span>
          </div>

          {/* 5. Sin colorantes artificiales */}
          <div className={styles.attributeCard}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                <path d="m14 10-4 4" />
              </svg>
            </div>
            <span className={styles.attributeName}>Sin colorantes artificiales</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LO QUE HAY DENTRO IMPORTA
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.insideSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>COMPOSICIÓN TRANSPARENTE</span>
          <h3>LO QUE HAY DENTRO IMPORTA.</h3>
          <p>Una fórmula hecha con intención.</p>
        </div>

        {/* 5 Minerales */}
        <div className={styles.mineralsGrid}>
          {MINERALS.map((mineral) => (
            <div key={mineral.symbol} className={styles.mineralCard}>
              <span className={styles.mineralSymbol}>{mineral.symbol}</span>
              <span className={styles.mineralName}>{mineral.name}</span>
            </div>
          ))}
        </div>

        {/* Aloe vera separado visualmente */}
        <div className={styles.aloeSeparator}>
          <div className={styles.aloeLine} aria-hidden="true" />
          <div className={styles.aloeCard}>
            <span>+</span> ALOE VERA
            <span>· Extracto botánico complementario</span>
          </div>
          <div className={styles.aloeLine} aria-hidden="true" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MODO DE USO
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.usageSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>PREPARACIÓN</span>
          <h3>SIMPLE. COMO DEBERÍA SER.</h3>
          <p>Mezcla 1 sachet con 400 ml de agua. Agita y disfruta.</p>
        </div>

        <div className={styles.usageSteps}>
          {/* Paso 1 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>01</span>
            <div className={styles.stepIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="12" height="18" x="6" y="3" rx="2" />
                <path d="M10 7h4" />
                <path d="M10 11h4" />
              </svg>
            </div>
            <div>
              <div className={styles.stepLabel}>1 Sachet</div>
              <p className={styles.stepSublabel}>Abre un sobre individual</p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>02</span>
            <div className={styles.stepIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8" />
                <path d="M9 2v3a3 3 0 0 0 6 0V2" />
                <rect width="10" height="14" x="7" y="8" rx="2" />
                <path d="M10 12h4" />
                <path d="M10 15h4" />
              </svg>
            </div>
            <div>
              <div className={styles.stepLabel}>400 ml de agua</div>
              <p className={styles.stepSublabel}>Vierte en tu botella o vaso</p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>03</span>
            <div className={styles.stepIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="m7.5 4.27 9 5.15" />
                <path d="M3.29 7 12 12l8.71-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <div>
              <div className={styles.stepLabel}>Agita</div>
              <p className={styles.stepSublabel}>Disuelve completamente</p>
            </div>
          </div>

          {/* Paso 4 */}
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>04</span>
            <div className={styles.stepIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <div className={styles.stepLabel}>Disfruta</div>
              <p className={styles.stepSublabel}>Antes, durante o después</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
