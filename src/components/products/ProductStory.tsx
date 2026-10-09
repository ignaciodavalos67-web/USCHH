"use client";

import React, { useState } from "react";
import styles from "./ProductStory.module.css";

interface ProductStoryProps {
  flavor: string;
  slug: string;
}

interface MineralItem {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  explanation: string;
}

const MINERALS: MineralItem[] = [
  {
    id: "sodio",
    symbol: "Na",
    name: "Sodio",
    amount: "369 mg",
    explanation:
      "El sodio participa en el equilibrio de líquidos y en la transmisión de señales nerviosas. Al sudar pierdes sodio; USCHH aporta 369 mg por sachet para contribuir a su reposición.",
  },
  {
    id: "potasio",
    symbol: "K",
    name: "Potasio",
    amount: "786 mg",
    explanation:
      "El potasio es el principal electrolito dentro de las células. Participa en el equilibrio de líquidos, la transmisión nerviosa y la contracción muscular.",
  },
  {
    id: "magnesio",
    symbol: "Mg",
    name: "Magnesio",
    amount: "86 mg",
    explanation:
      "El magnesio interviene en el metabolismo energético y en el funcionamiento normal de músculos y nervios.",
  },
  {
    id: "calcio",
    symbol: "Ca",
    name: "Calcio",
    amount: "265 mg",
    explanation:
      "El calcio tiene funciones que van más allá de los huesos: también participa en la contracción muscular y la transmisión de señales nerviosas.",
  },
  {
    id: "zinc",
    symbol: "Zn",
    name: "Zinc",
    amount: "13 mg",
    explanation:
      "El zinc es un mineral esencial que participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
  {
    id: "aloe",
    symbol: "Aloe",
    name: "Aloe vera",
    amount: "45 mg",
    explanation:
      "Incorporamos aloe vera como complemento de nuestra mezcla de electrolitos, sumando un ingrediente de origen vegetal a nuestra fórmula.",
  },
];

const BENEFITS = [
  {
    title: "Acompaña tu hidratación",
    desc: "Aporta minerales que participan en el equilibrio de líquidos del cuerpo.",
  },
  {
    title: "Repón electrolitos después de sudar",
    desc: "Cada sachet aporta 369 mg de sodio para contribuir a la reposición de este mineral perdido durante la sudoración.",
  },
  {
    title: "Apoya la función muscular normal",
    desc: "El potasio, el magnesio y el calcio participan en el funcionamiento normal de tus músculos.",
  },
  {
    title: "Aporta magnesio para el metabolismo energético",
    desc: "El magnesio interviene en los procesos que permiten a tu cuerpo utilizar la energía de los alimentos.",
  },
  {
    title: "Complementa tu aporte de zinc",
    desc: "El zinc participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
];

const WHEN_TO_USE = [
  {
    title: "Durante actividades prolongadas",
    desc: "Para complementar tu hidratación cuando el ejercicio se extiende y acumulas pérdidas de agua y electrolitos por el sudor.",
  },
  {
    title: "Después de sudar",
    desc: "Como parte de tu reposición de líquidos y electrolitos después de entrenar o realizar una actividad con mucha sudoración.",
  },
  {
    title: "En actividades con calor",
    desc: "El calor puede aumentar la sudoración. USCHH puede acompañar tu hidratación cuando necesitas reponer parte de los minerales perdidos.",
  },
  {
    title: "Cuando entrenas en altura",
    desc: "Si entrenas en Quito o realizas actividades en la Sierra, incluye la hidratación en tu planificación, incluso cuando hace frío. USCHH puede complementar tu aporte de electrolitos durante actividades prolongadas o con mucha sudoración. No sustituye la aclimatación ni previene el mal de altura.",
  },
  {
    title: "Cuando tienes chuchaqui (resaca)",
    desc: "Después de tomar alcohol, puedes haber perdido más líquidos por la orina. USCHH mezclado con agua puede acompañar tu hidratación al día siguiente. Hidratarte forma parte del cuidado de tu cuerpo, pero USCHH no cura el chuchaqui ni acelera la eliminación del alcohol.",
  },
];

export function ProductStory({ flavor, slug }: ProductStoryProps) {
  const [expandedMineral, setExpandedMineral] = useState<string | null>("sodio");

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

  const toggleMineral = (id: string) => {
    setExpandedMineral((prev) => (prev === id ? null : id));
  };

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
          2. COMPOSICIÓN DESTACADA
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.compositionBanner}>
        <div className={styles.compositionHeadline}>
          <span className={styles.eyebrow}>COMPOSICIÓN DESTACADA</span>
        </div>
        <h3 className={styles.compositionTitle}>
          Cada sachet de 6 g aporta una proporción balanceada de electrolitos clave:
        </h3>
        <div className={styles.compositionValues}>
          <div className={styles.compositionPill}>
            <span>Sodio:</span>
            <strong>369 mg</strong>
          </div>
          <div className={styles.compositionPill}>
            <span>Potasio:</span>
            <strong>786 mg</strong>
          </div>
          <div className={styles.compositionPill}>
            <span>Magnesio:</span>
            <strong>86 mg</strong>
          </div>
          <div className={styles.compositionPill}>
            <span>Calcio:</span>
            <strong>265 mg</strong>
          </div>
          <div className={styles.compositionPill}>
            <span>Zinc:</span>
            <strong>13 mg</strong>
          </div>
          <div className={styles.compositionPill}>
            <span>Aloe vera:</span>
            <strong>45 mg</strong>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CONOCE LO QUE HAY EN TU SACHET (INTERACTIVO PLEGABLE)
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.insideSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>CONOCE LO QUE HAY EN TU SACHET</span>
          <h3>LO QUE HAY DENTRO IMPORTA.</h3>
          <p>
            Haz clic en cada elemento para desplegar su función biológica y cómo contribuye a tu hidratación.
          </p>
          <span className={styles.interactiveNotice}>Toca un mineral para ver su explicación ↓</span>
        </div>

        {/* 6 Minerales e ingredientes interactivos */}
        <div className={styles.mineralsGrid}>
          {MINERALS.map((mineral) => {
            const isExpanded = expandedMineral === mineral.id;
            return (
              <div
                key={mineral.id}
                className={`${styles.mineralInteractiveCard} ${isExpanded ? styles.expanded : ""}`}
              >
                <button
                  type="button"
                  className={styles.mineralHeader}
                  onClick={() => toggleMineral(mineral.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`desc-${mineral.id}`}
                >
                  <div className={styles.mineralHeaderLeft}>
                    <span className={styles.mineralSymbol}>{mineral.symbol}</span>
                    <div className={styles.mineralTitleBlock}>
                      <span className={styles.mineralName}>{mineral.name}</span>
                      <span className={styles.mineralMg}>{mineral.amount}</span>
                    </div>
                  </div>
                  <span className={styles.toggleIcon} aria-hidden="true">
                    +
                  </span>
                </button>

                {isExpanded && (
                  <div id={`desc-${mineral.id}`} className={styles.mineralBody}>
                    <p>{mineral.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BENEFICIOS
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>BENEFICIOS FUNCIONALES</span>
          <h3>POR QUÉ FUNCIONA USCHH</h3>
          <p>Nutrición precisa para sostener tu esfuerzo diario y recuperación.</p>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <h4 className={styles.benefitTitle}>{benefit.title}</h4>
              <p className={styles.benefitDesc}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. ¿CUÁNDO USAR USCHH?
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.whenSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>MOMENTOS DE CONSUMO</span>
          <h3>¿CUÁNDO USAR USCHH?</h3>
          <p>Diseñado para acompañarte en los momentos clave donde tu cuerpo más lo necesita.</p>
        </div>

        <div className={styles.whenGrid}>
          {WHEN_TO_USE.map((item, index) => (
            <div key={index} className={styles.whenCard}>
              <h4 className={styles.whenTitle}>{item.title}</h4>
              <p className={styles.whenDesc}>{item.desc}</p>
            </div>
          ))}
        </div>

        <p className={styles.whenDisclaimer}>
          Cada cuerpo es diferente. Tus necesidades dependen de cuánto sudas, la duración de la actividad y las condiciones del entorno.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. MODO DE USO
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
