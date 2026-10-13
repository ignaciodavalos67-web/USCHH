"use client";

import React, { useState } from "react";
import styles from "./InteractiveProductBlocks.module.css";

/* ── 1. NUTRIENTES Y SU FUNCIÓN ── */
export interface NutrientItem {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  description: string;
}

export const NUTRIENTS: NutrientItem[] = [
  {
    id: "sodio",
    symbol: "Na",
    name: "Sodio",
    amount: "369 mg",
    description:
      "El sodio participa en el equilibrio de líquidos y en la transmisión de señales nerviosas. Al sudar pierdes sodio; USCHH aporta 369 mg por sachet para contribuir a su reposición.",
  },
  {
    id: "potasio",
    symbol: "K",
    name: "Potasio",
    amount: "786 mg",
    description:
      "El potasio es el principal electrolito dentro de las células. Participa en el equilibrio de líquidos, la transmisión nerviosa y la contracción muscular.",
  },
  {
    id: "magnesio",
    symbol: "Mg",
    name: "Magnesio",
    amount: "86 mg",
    description:
      "El magnesio interviene en el metabolismo energético y en el funcionamiento normal de músculos y nervios.",
  },
  {
    id: "calcio",
    symbol: "Ca",
    name: "Calcio",
    amount: "265 mg",
    description:
      "El calcio tiene funciones que van más allá de los huesos: también participa en la contracción muscular y la transmisión de señales nerviosas.",
  },
  {
    id: "zinc",
    symbol: "Zn",
    name: "Zinc",
    amount: "13 mg",
    description:
      "El zinc es un mineral esencial que participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
  {
    id: "aloe",
    symbol: "Aloe",
    name: "Aloe vera",
    amount: "45 mg",
    description:
      "Incorporamos aloe vera como complemento de nuestra mezcla de electrolitos, sumando un ingrediente de origen vegetal a nuestra fórmula.",
  },
];

export function NutrientAccordion() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ sodio: true });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ul className={styles.accordionList} aria-label="Minerales e ingredientes en cada sachet">
      {NUTRIENTS.map((item) => {
        const isOpen = !!openIds[item.id];
        return (
          <li key={item.id} className={styles.item}>
            <div className={`${styles.card} ${styles.formulaCard} ${isOpen ? styles.expanded : ""}`}>
              <button
                type="button"
                className={styles.headerButton}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`nutrient-${item.id}`}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.symbolBadge}>{item.symbol}</span>
                  <div className={styles.titleBlock}>
                    <span className={styles.title}>{item.name}</span>
                    <span className={styles.subtitle}>{item.amount}</span>
                  </div>
                </div>
                <span className={styles.toggleIcon} aria-hidden="true">
                  +
                </span>
              </button>
              <div id={`nutrient-${item.id}`} className={styles.collapsibleGrid} aria-hidden={!isOpen}>
                <div className={styles.collapsibleInner}>
                  <div className={styles.bodyContent}>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ── 2. RESPALDO REAL A TU CUERPO (BENEFICIOS) ── */
export interface BenefitItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const BENEFITS: BenefitItem[] = [
  {
    id: "hidratacion",
    number: "01",
    title: "Complementa tu hidratación",
    description:
      "Combina agua con minerales que ayudan a mantener el equilibrio de líquidos en tu cuerpo.",
  },
  {
    id: "reponer",
    number: "02",
    title: "Ayuda a reponer lo que pierdes al sudar",
    description:
      "Aporta electrolitos, como el sodio, que tu cuerpo pierde a través del sudor.",
  },
  {
    id: "musculos",
    number: "03",
    title: "Apoya el funcionamiento de tus músculos",
    description:
      "Contiene potasio, magnesio y calcio, minerales que participan en la contracción y relajación muscular.",
  },
  {
    id: "energia",
    number: "04",
    title: "Contribuye al aprovechamiento de la energía",
    description:
      "El magnesio ayuda a tu cuerpo a transformar los nutrientes de los alimentos en energía.",
  },
  {
    id: "defensas",
    number: "05",
    title: "Apoya el funcionamiento de tus defensas",
    description:
      "El zinc contribuye al funcionamiento normal del sistema inmunitario.",
  },
];

export function BenefitsAccordion() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ hidratacion: true });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ul className={styles.accordionList} aria-label="Beneficios funcionales de USCHH">
      {BENEFITS.map((item) => {
        const isOpen = !!openIds[item.id];
        return (
          <li key={item.id} className={styles.item}>
            <div className={`${styles.card} ${styles.benefitCard} ${isOpen ? styles.expanded : ""}`}>
              <button
                type="button"
                className={styles.headerButton}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`benefit-${item.id}`}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.numberBadge}>{item.number}</span>
                  <div className={styles.titleBlock}>
                    <span className={styles.title}>{item.title}</span>
                  </div>
                </div>
                <span className={styles.toggleIcon} aria-hidden="true">
                  +
                </span>
              </button>
              <div id={`benefit-${item.id}`} className={styles.collapsibleGrid} aria-hidden={!isOpen}>
                <div className={styles.collapsibleInner}>
                  <div className={styles.bodyContent}>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ── 3. CUÁNDO USAR USCHH ── */
export interface MomentItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const MOMENTS: MomentItem[] = [
  {
    id: "prolongadas",
    number: "01",
    title: "Durante actividades prolongadas",
    description:
      "Para complementar tu hidratación cuando el ejercicio se extiende y acumulas pérdidas de agua y electrolitos por el sudor.",
  },
  {
    id: "despues-sudar",
    number: "02",
    title: "Después de sudar",
    description:
      "Como parte de tu reposición de líquidos y electrolitos después de entrenar o realizar una actividad con mucha sudoración.",
  },
  {
    id: "calor",
    number: "03",
    title: "En actividades con calor",
    description:
      "El calor puede aumentar la sudoración. USCHH puede acompañar tu hidratación cuando necesitas reponer parte de los minerales perdidos.",
  },
  {
    id: "altura",
    number: "04",
    title: "Cuando entrenas en altura",
    description:
      "Si entrenas en Quito o realizas actividades en la Sierra, incluye la hidratación en tu planificación, incluso cuando hace frío. USCHH puede complementar tu aporte de electrolitos durante actividades prolongadas o con mucha sudoración. No sustituye la aclimatación ni previene el mal de altura.",
  },
  {
    id: "resaca",
    number: "05",
    title: "Cuando tienes chuchaqui (resaca)",
    description:
      "Después de tomar alcohol, puedes haber perdido más líquidos por la orina. USCHH mezclado con agua puede acompañar tu hidratación al día siguiente. Hidratarte forma parte del cuidado de tu cuerpo, pero USCHH no cura el chuchaqui ni acelera la eliminación del alcohol.",
  },
];

export function WhenToUseAccordion() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ prolongadas: true });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ul className={styles.accordionList} aria-label="Momentos recomendados de consumo">
      {MOMENTS.map((item) => {
        const isOpen = !!openIds[item.id];
        return (
          <li key={item.id} className={styles.item}>
            <div className={`${styles.card} ${styles.whenCard} ${isOpen ? styles.expanded : ""}`}>
              <button
                type="button"
                className={styles.headerButton}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`when-${item.id}`}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.numberBadge}>{item.number}</span>
                  <div className={styles.titleBlock}>
                    <span className={styles.title}>{item.title}</span>
                  </div>
                </div>
                <span className={styles.toggleIcon} aria-hidden="true">
                  +
                </span>
              </button>
              <div id={`when-${item.id}`} className={styles.collapsibleGrid} aria-hidden={!isOpen}>
                <div className={styles.collapsibleInner}>
                  <div className={styles.bodyContent}>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
