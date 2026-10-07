import React from "react";
import Image from "next/image";
import styles from "./Scene6Minerals.module.css";

const minerals = [
  { symbol: "Na", name: "SODIO" },
  { symbol: "K", name: "POTASIO" },
  { symbol: "Mg", name: "MAGNESIO" },
  { symbol: "Ca", name: "CALCIO" },
  { symbol: "Zn", name: "ZINC" },
];
const attributes = ["VEGANO", "SIN AZÚCAR", "SIN GLUTEN", "SIN COLORANTES ARTIFICIALES"];

export function Scene6Minerals() {
  return (
    <section data-scene="6" className="scene-6-container absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10 opacity-0" aria-label="Composición de Minerales USCHH">
      <div className="absolute inset-0 bg-[#F7E2A3]" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#F5D680]/60 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full bg-[#E8A84A]/25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/30 pointer-events-none" />

      <div className={styles.composition}>
        <div className={`scene-6-headline ${styles.headline}`}>
          <span className={styles.eyebrow}>COMPOSICIÓN ACTIVA</span>
          <h2>5 MINERALES.<br /><span>1 PROPÓSITO.</span></h2>
          <div className={styles.accent} />
        </div>

        <div className={`scene-6-minerals-row ${styles.mineralRow}`}>
          {minerals.map(mineral => (
            <div key={mineral.symbol} className={`scene-6-mineral opacity-0 ${styles.mineral}`}>
              <span className={styles.symbol}>{mineral.symbol}</span>
              <span className={styles.name}>{mineral.name}</span>
            </div>
          ))}
        </div>

        {/* Dedicated product area reserves space for the existing ±30px parallax. */}
        <div className={`scene-6-products opacity-0 ${styles.products}`}>
          <div className={`scene-6-can-left ${styles.pouch} ${styles.mandarina}`}>
            <Image src="/products/uschh-mandarina-sin-fondo-con-sombra.png" alt="USCHH Mandarina" fill sizes="(max-width: 600px) 34vw, 240px" className={styles.productImage} />
          </div>
          <div className={`scene-6-can-right ${styles.pouch} ${styles.limon}`}>
            <Image src="/products/uschh-limon-sin-fondo-con-sombra.png" alt="USCHH Limón" fill sizes="(max-width: 600px) 34vw, 240px" className={styles.productImage} />
          </div>
        </div>

        <div className={`scene-6-footer ${styles.footer}`}>
          <div className={styles.aloe}><span />+ ALOE VERA<span /></div>
          <div className={styles.attributes}>
            {attributes.map(attribute => <span key={attribute}>{attribute}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
