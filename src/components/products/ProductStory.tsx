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
  roleTag: string;
  explanation: string;
}

const MINERALS: MineralItem[] = [
  {
    id: "sodio",
    symbol: "Na",
    name: "Sodio",
    amount: "369 mg",
    roleTag: "Equilibrio osmótico y sudor",
    explanation:
      "El sodio participa en el equilibrio de líquidos y en la transmisión de señales nerviosas. Al sudar pierdes sodio; USCHH aporta 369 mg por sachet para contribuir a su reposición.",
  },
  {
    id: "potasio",
    symbol: "K",
    name: "Potasio",
    amount: "786 mg",
    roleTag: "Contracción muscular y células",
    explanation:
      "El potasio es el principal electrolito dentro de las células. Participa en el equilibrio de líquidos, la transmisión nerviosa y la contracción muscular.",
  },
  {
    id: "magnesio",
    symbol: "Mg",
    name: "Magnesio",
    amount: "86 mg",
    roleTag: "Metabolismo y energía",
    explanation:
      "El magnesio interviene en el metabolismo energético y en el funcionamiento normal de músculos y nervios.",
  },
  {
    id: "calcio",
    symbol: "Ca",
    name: "Calcio",
    amount: "265 mg",
    roleTag: "Transmisión neuromuscular",
    explanation:
      "El calcio tiene funciones que van más allá de los huesos: también participa en la contracción muscular y la transmisión de señales nerviosas.",
  },
  {
    id: "zinc",
    symbol: "Zn",
    name: "Zinc",
    amount: "13 mg",
    roleTag: "Sistema inmunitario y síntesis",
    explanation:
      "El zinc es un mineral esencial que participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
  {
    id: "aloe",
    symbol: "Aloe",
    name: "Aloe vera",
    amount: "45 mg",
    roleTag: "Botánico funcional de soporte",
    explanation:
      "Incorporamos aloe vera como complemento de nuestra mezcla de electrolitos, sumando un ingrediente de origen vegetal a nuestra fórmula.",
  },
];

const BENEFITS = [
  {
    num: "01",
    title: "Complementa tu hidratación",
    desc: "Combina agua con minerales que ayudan a mantener el equilibrio de líquidos en tu cuerpo.",
  },
  {
    num: "02",
    title: "Ayuda a reponer lo que pierdes al sudar",
    desc: "Aporta electrolitos, como el sodio, que tu cuerpo pierde a través del sudor.",
  },
  {
    num: "03",
    title: "Apoya el funcionamiento de tus músculos",
    desc: "Contiene potasio, magnesio y calcio, minerales que participan en la contracción y relajación muscular.",
  },
  {
    num: "04",
    title: "Contribuye al aprovechamiento de la energía",
    desc: "El magnesio ayuda a tu cuerpo a transformar los nutrientes de los alimentos en energía.",
  },
  {
    num: "05",
    title: "Apoya el funcionamiento de tus defensas",
    desc: "El zinc contribuye al funcionamiento normal del sistema inmunitario.",
  },
];

const WHEN_TO_USE = [
  {
    id: "prolongadas",
    tag: "Entrenamiento y competición",
    title: "Durante actividades prolongadas",
    desc: "Para complementar tu hidratación cuando el ejercicio se extiende y acumulas pérdidas de agua y electrolitos por el sudor.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="15" cy="4" r="2" />
        <path d="M10.5 9.5 7 12l2 3" />
        <path d="m14 9.5-3.5 5.5-4.5 1" />
        <path d="m10.5 9.5 3.5 0 3 3 2.5-1" />
        <path d="m12.5 13 3.5 3-1.5 5" />
      </svg>
    ),
  },
  {
    id: "sudar",
    tag: "Post entrenamiento",
    title: "Después de sudar",
    desc: "Como parte de tu reposición de líquidos y electrolitos después de entrenar o realizar una actividad con mucha sudoración.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        <path d="M9.5 14.5a3.5 3.5 0 0 0 3.5 3" />
      </svg>
    ),
  },
  {
    id: "calor",
    tag: "Clima cálido y humedad",
    title: "En actividades con calor",
    desc: "El calor puede aumentar la sudoración. USCHH puede acompañar tu hidratación cuando necesitas reponer parte de los minerales perdidos.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
  },
  {
    id: "altura",
    tag: "Altitud y montaña",
    title: "Cuando entrenas en altura",
    desc: "Si entrenas en Quito o realizas actividades en la Sierra, incluye la hidratación en tu planificación, incluso cuando hace frío. USCHH puede complementar tu aporte de electrolitos durante actividades prolongadas o con mucha sudoración. No sustituye la aclimatación ni previene el mal de altura.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        <path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" />
      </svg>
    ),
  },
  {
    id: "chuchaqui",
    tag: "Recuperación cotidiana",
    title: "Cuando tienes chuchaqui (resaca)",
    desc: "Después de tomar alcohol, puedes haber perdido más líquidos por la orina. USCHH mezclado con agua puede acompañar tu hidratación al día siguiente. Hidratarte forma parte del cuidado de tu cuerpo, pero USCHH no cura el chuchaqui ni acelera la eliminación del alcohol.",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2h4" />
        <path d="M10.5 2v4.2L7.8 9.6A2.5 2.5 0 0 0 7.2 11.2V20a2 2 0 0 0 2 2h5.6a2 2 0 0 0 2-2v-8.8a2.5 2.5 0 0 0-.6-1.6l-2.7-3.4V2" />
        <rect x="9.2" y="12.5" width="5.6" height="4.5" rx="0.8" />
      </svg>
    ),
  },
];

const PREPARATION_STEPS = [
  {
    num: "01",
    action: "1 Sachet",
    sublabel: "Abre un sobre individual",
    icon: (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="12" height="18" x="6" y="3" rx="2" />
        <path d="M10 7h4" />
        <path d="M10 11h4" />
      </svg>
    ),
  },
  {
    num: "02",
    action: "400 ml de agua",
    sublabel: "Vierte en tu botella o vaso",
    icon: (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2h8" />
        <path d="M9 2v3a3 3 0 0 0 6 0V2" />
        <rect width="10" height="14" x="7" y="8" rx="2" />
        <path d="M10 12h4" />
        <path d="M10 15h4" />
      </svg>
    ),
  },
  {
    num: "03",
    action: "Agita",
    sublabel: "Disuelve completamente",
    icon: (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m7.5 4.27 9 5.15" />
        <path d="M3.29 7 12 12l8.71-5" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    num: "04",
    action: "Disfruta",
    sublabel: "Antes, durante o después",
    icon: (
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
];

function AloeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3.8C10.7 7.6 10.5 11.8 12 16.8C13.5 11.8 13.3 7.6 12 3.8Z" />
      <path d="M6.6 6.8C7.2 10.6 8.5 14.2 11.2 17.5C10.5 13.4 9.1 9.6 6.6 6.8Z" />
      <path d="M17.4 6.8C14.9 9.6 13.5 13.4 12.8 17.5C15.5 14.2 16.8 10.6 17.4 6.8Z" />
      <path d="M3.6 12.4C5.4 16.3 8.4 19.2 12 20.2C15.6 19.2 18.6 16.3 20.4 12.4C17.3 13.8 14.7 15.8 12 18.4C9.3 15.8 6.7 13.8 3.6 13.8Z" />
    </svg>
  );
}

export function ProductStory({ flavor, slug }: ProductStoryProps) {
  const [selectedMineralId, setSelectedMineralId] = useState<string>("sodio");
  const [expandedMobileMineral, setExpandedMobileMineral] = useState<string | null>("sodio");

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

  const selectedMineral =
    MINERALS.find((m) => m.id === selectedMineralId) ?? MINERALS[0];

  const handleMineralClick = (id: string) => {
    setSelectedMineralId(id);
    setExpandedMobileMineral((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className={`${styles.storyContainer} ${themeClass}`}
      aria-label={`Detalles y formulación de USCHH ${flavor}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. FORMATO Y PRESENTACIÓN
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.formatSection}>
        <div className={styles.formatGrid}>
          <div className={styles.formatMain}>
            <span className={styles.eyebrow}>
              FORMATO Y PRESENTACIÓN
            </span>
            <h2 className={styles.formatTitle}>
              Pouch con 15 sachets individuales de 6 g
            </h2>
          </div>

          <div className={styles.formatStatsStrip}>
            <div className={styles.statCell}>
              <div className={styles.statCircle}>
                <span className={styles.statValue}>15</span>
              </div>
              <span className={styles.statLabel}>Sachets por pouch</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statCell}>
              <div className={styles.statCircle}>
                <span className={styles.statValue}>6 g</span>
              </div>
              <span className={styles.statLabel}>Porción exacta</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statCell}>
              <div className={styles.statCircle}>
                <span className={styles.statValue}>90 g</span>
              </div>
              <span className={styles.statLabel}>Peso neto total</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2 Y 3. COMPOSICIÓN Y MINERALES ACTIVOS
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.compositionSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            COMPOSICIÓN CIENTÍFICA Y TRANSPARENCIA TOTAL
          </span>
          <h3 className={styles.sectionTitle}>
            CADA SACHET APORTA EL BALANCE EXACTO.
          </h3>
          <p className={styles.sectionLead}>
            Cinco electrolitos biodisponibles combinados con aloe vera botánico en proporciones
            calibradas para apoyar el equilibrio osmótico celular y la contracción muscular.
          </p>
        </div>

        {/* Resumen de formulación matemática */}
        <div className={styles.formulaSummaryBar}>
          <span className={styles.formulaLabel}>FORMULACIÓN ACTIVA:</span>
          <span className={styles.formulaExpression}>
            <strong>369 mg</strong> Na + <strong>786 mg</strong> K + <strong>86 mg</strong> Mg +{" "}
            <strong>265 mg</strong> Ca + <strong>13 mg</strong> Zn + <strong>45 mg</strong> Aloe
          </span>
          <span className={styles.formulaTotalBadge}>1,564 mg ACTIVOS POR SACHET</span>
        </div>

        {/* Explorador interactivo editorial dividido */}
        <div className={styles.mineralsExplorer}>
          {/* Columna izquierda: Tabla / Lista editorial */}
          <div className={styles.mineralsList}>
            {MINERALS.map((mineral) => {
              const isSelected = selectedMineralId === mineral.id;
              const isMobileOpen = expandedMobileMineral === mineral.id;

              return (
                <div
                  key={mineral.id}
                  className={`${styles.mineralRow} ${isSelected ? styles.rowActive : ""} ${
                    isMobileOpen ? styles.rowMobileOpen : styles.rowMobileClosed
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleMineralClick(mineral.id)}
                    className={styles.mineralRowButton}
                    aria-expanded={isSelected}
                    aria-controls={`mineral-desc-${mineral.id}`}
                  >
                    <div className={styles.symbolCell}>
                      {mineral.id === "aloe" ? (
                        <AloeIcon className={styles.aloeSvg} />
                      ) : (
                        <span className={styles.symbolText}>{mineral.symbol}</span>
                      )}
                    </div>

                    <div className={styles.nameCell}>
                      <span className={styles.mineralName}>{mineral.name}</span>
                      <span className={styles.mineralRole}>{mineral.roleTag}</span>
                    </div>

                    <div className={styles.amountCell}>
                      <span className={styles.mineralAmount}>{mineral.amount}</span>
                      <span className={styles.rowChevron} aria-hidden="true">→</span>
                    </div>
                  </button>

                  {/* Detalle inline visible solo en mobile cuando está expandido */}
                  {isMobileOpen && (
                    <div
                      id={`mineral-desc-${mineral.id}`}
                      className={styles.mobileMineralDetail}
                    >
                      <p>{mineral.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Columna derecha: Spotlight interactivo para escritorio */}
          <div className={styles.mineralSpotlight} aria-live="polite">
            <span className={styles.watermarkSymbol} aria-hidden="true">
              {selectedMineral.id === "aloe" ? (
                <AloeIcon className={styles.watermarkAloeSvg} />
              ) : (
                selectedMineral.symbol
              )}
            </span>

            <div className={styles.spotlightContent}>
              <div className={styles.spotlightBadge}>
                <span className={styles.badgePulse} />
                <span>ELECTROLITO ACTIVO SELECCIONADO</span>
              </div>

              <div className={styles.spotlightHeader}>
                <h4 className={styles.spotlightName}>{selectedMineral.name}</h4>
                <span className={styles.spotlightAmount}>{selectedMineral.amount}</span>
              </div>

              <p className={styles.spotlightRole}>{selectedMineral.roleTag}</p>

              <div className={styles.spotlightDivider} />

              <p className={styles.spotlightExplanation}>
                {selectedMineral.explanation}
              </p>

              <div className={styles.spotlightFooter}>
                <span>USCHH FORMULACIÓN CIENTÍFICA</span>
                <span>0% AZÚCAR AÑADIDA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BENEFICIOS NUTRICIONALES
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.benefitsSection}>
        <div className={styles.benefitsHeader}>
          <div>
            <span className={styles.eyebrow}>
              BENEFICIOS FUNCIONALES Y FISIOLOGÍA DEL ESFUERZO
            </span>
            <h3 className={styles.sectionTitle}>
              DISEÑADO PARA TU RENDIMIENTO.
            </h3>
          </div>
          <p className={styles.benefitsManifesto}>
            “El rendimiento no se improvisa: se hidrata célula por célula. Cada
            ingrediente cumple una función biológica comprobada en tu cuerpo.”
          </p>
        </div>

        <div className={styles.benefitsList}>
          {BENEFITS.map((benefit) => (
            <div key={benefit.num} className={styles.benefitRow}>
              <span className={styles.benefitNum}>{benefit.num}</span>
              <div className={styles.benefitBody}>
                <h4 className={styles.benefitTitle}>{benefit.title}</h4>
                <p className={styles.benefitDesc}>{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MOMENTOS DE CONSUMO
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.lifestyleSection}>
        <div className={styles.lifestyleContent}>
          <div className={styles.lifestyleHeader}>
            <span className={styles.eyebrow}>
              MOMENTOS DE CONSUMO Y RITUAL DEPORTIVO
            </span>
            <h3 className={styles.sectionTitle}>¿CUÁNDO USAR USCHH?</h3>
            <p className={styles.sectionLead}>
              Diseñado para acompañarte en los momentos clave donde tu cuerpo más pierde
              minerales por transpiración o esfuerzo.
            </p>
          </div>

          <div className={styles.momentsTimeline}>
            {WHEN_TO_USE.map((item) => (
              <div key={item.id} className={styles.momentItem}>
                <div className={styles.momentIcon} aria-hidden="true">
                  {item.icon}
                </div>
                <div className={styles.momentBody}>
                  <span className={styles.momentTag}>{item.tag}</span>
                  <h4 className={styles.momentTitle}>{item.title}</h4>
                  <p className={styles.momentDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.disclaimerBox}>
            <p>
              Cada cuerpo es diferente. Tus necesidades dependen de cuánto sudas, la duración de
              la actividad y las condiciones del entorno.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. PREPARACIÓN
      ───────────────────────────────────────────────────────────── */}
      <div className={styles.prepSection}>
        <div className={styles.prepHeader}>
          <div className={styles.prepHeaderLeft}>
            <span className={styles.eyebrow}>
              PREPARACIÓN Y MÉTODO RÁPIDO
            </span>
            <h3 className={styles.sectionTitle}>
              SIMPLE. RÁPIDO. EXACTO.
            </h3>
          </div>

          <div className={styles.prepFormulaBadge}>
            <span>1 SACHET</span>
            <span className={styles.prepMathPlus}>+</span>
            <span>400 ML</span>
            <span className={styles.prepMathPlus}>=</span>
            <strong>HIDRATACIÓN COMPLETA</strong>
          </div>
        </div>

        <div className={styles.prepStepsGrid}>
          {PREPARATION_STEPS.map((step) => (
            <div key={step.num} className={styles.stepItem}>
              <div className={styles.stepTop}>
                <span className={styles.stepNum}>{step.num}</span>
                <span className={styles.stepArrow} aria-hidden="true">→</span>
              </div>
              <div className={styles.stepIcon} aria-hidden="true">
                {step.icon}
              </div>
              <div className={styles.stepTextBlock}>
                <h4 className={styles.stepAction}>{step.action}</h4>
                <p className={styles.stepSublabel}>{step.sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.prepFooterBar}>
          <span className={styles.prepTip}>
            TIP PRO: Tómalo frío antes de comenzar para iniciar hidratado, o durante entrenamientos de alta sudoración para mantener el ritmo.
          </span>
          <span className={styles.prepOrigin}>
            USCHH HECHO EN ECUADOR CON CALIDAD FARMACÉUTICA
          </span>
        </div>
      </div>
    </section>
  );
}
