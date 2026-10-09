import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Reveal } from "@/components/nosotros/NosotrosReveal";
import styles from "./producto.module.css";

export const metadata: Metadata = {
  title: "Nuestro producto | USCHH",
  description: "Conoce los Electrolitos USCHH: ingredientes, composición por sachet, beneficios, momentos de uso y ciencia de hidratación.",
};

interface MineralDetail {
  symbol: string;
  name: string;
  amount: string;
  description: string;
}

const detailedMinerals: MineralDetail[] = [
  {
    symbol: "Na",
    name: "Sodio",
    amount: "369 mg",
    description:
      "El sodio participa en el equilibrio de líquidos y en la transmisión de señales nerviosas. Al sudar pierdes sodio; USCHH aporta 369 mg por sachet para contribuir a su reposición.",
  },
  {
    symbol: "K",
    name: "Potasio",
    amount: "786 mg",
    description:
      "El potasio es el principal electrolito dentro de las células. Participa en el equilibrio de líquidos, la transmisión nerviosa y la contracción muscular.",
  },
  {
    symbol: "Mg",
    name: "Magnesio",
    amount: "86 mg",
    description:
      "El magnesio interviene en el metabolismo energético y en el funcionamiento normal de músculos y nervios.",
  },
  {
    symbol: "Ca",
    name: "Calcio",
    amount: "265 mg",
    description:
      "El calcio tiene funciones que van más allá de los huesos: también participa en la contracción muscular y la transmisión de señales nerviosas.",
  },
  {
    symbol: "Zn",
    name: "Zinc",
    amount: "13 mg",
    description:
      "El zinc es un mineral esencial que participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
  {
    symbol: "Aloe",
    name: "Aloe vera",
    amount: "45 mg",
    description:
      "Incorporamos aloe vera como complemento de nuestra mezcla de electrolitos, sumando un ingrediente de origen vegetal a nuestra fórmula.",
  },
];

const benefitsList = [
  {
    title: "Acompaña tu hidratación",
    description: "Aporta minerales que participan en el equilibrio de líquidos del cuerpo.",
  },
  {
    title: "Repón electrolitos después de sudar",
    description: "Cada sachet aporta 369 mg de sodio para contribuir a la reposición de este mineral perdido durante la sudoración.",
  },
  {
    title: "Apoya la función muscular normal",
    description: "El potasio, el magnesio y el calcio participan en el funcionamiento normal de tus músculos.",
  },
  {
    title: "Aporta magnesio para el metabolismo energético",
    description: "El magnesio interviene en los procesos que permiten a tu cuerpo utilizar la energía de los alimentos.",
  },
  {
    title: "Complementa tu aporte de zinc",
    description: "El zinc participa en el funcionamiento normal del sistema inmunitario y en la síntesis de proteínas.",
  },
];

const whenToUseList = [
  {
    title: "Durante actividades prolongadas",
    description: "Para complementar tu hidratación cuando el ejercicio se extiende y acumulas pérdidas de agua y electrolitos por el sudor.",
  },
  {
    title: "Después de sudar",
    description: "Como parte de tu reposición de líquidos y electrolitos después de entrenar o realizar una actividad con mucha sudoración.",
  },
  {
    title: "En actividades con calor",
    description: "El calor puede aumentar la sudoración. USCHH puede acompañar tu hidratación cuando necesitas reponer parte de los minerales perdidos.",
  },
  {
    title: "Cuando entrenas en altura",
    description: "Si entrenas en Quito o realizas actividades en la Sierra, incluye la hidratación en tu planificación, incluso cuando hace frío. USCHH puede complementar tu aporte de electrolitos durante actividades prolongadas o con mucha sudoración. No sustituye la aclimatación ni previene el mal de altura.",
  },
  {
    title: "Cuando tienes chuchaqui (resaca)",
    description: "Después de tomar alcohol, puedes haber perdido más líquidos por la orina. USCHH mezclado con agua puede acompañar tu hidratación al día siguiente. Hidratarte forma parte del cuidado de tu cuerpo, pero USCHH no cura el chuchaqui ni acelera la eliminación del alcohol.",
  },
];

const attributes = [
  ["VEGANO", "M12 21V11M12 15C3 15 3 7 3 3c7 0 9 4 9 8M12 18c9 0 9-8 9-12-7 0-9 4-9 8"],
  ["SIN GMO", "M7 3c0 8 10 10 10 18M17 3c0 8-10 10-10 18M8 5h8M9 9h6M9 15h6M8 19h8M3 3l18 18"],
  ["SIN AZÚCAR", "M5 8l7-4 7 4v8l-7 4-7-4V8M5 8l7 4 7-4M12 12v8M3 3l18 18"],
  ["GLUTEN FREE", "M12 21V3M12 9C6 9 6 6 6 4c4 0 6 2 6 5M12 14c6 0 6-3 6-5-4 0-6 2-6 5M3 3l18 18"],
  ["SIN COLORANTES ARTIFICIALES", "M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12M3 3l18 18"],
];

function Products({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.compactProducts : styles.products}>
      {[
        ["limon", "LIMÓN"],
        ["mandarina", "MANDARINA"],
      ].map(([file, label]) => (
        <figure key={file}>
          <div className={styles.pack}>
            <Image
              src={`/products/uschh-${file}-sin-fondo-con-sombra.png`}
              alt={`Electrolitos en polvo USCHH sabor ${label.toLowerCase()}`}
              fill
              sizes={compact ? "(max-width: 700px) 42vw, 300px" : "(max-width: 700px) 42vw, 480px"}
            />
          </div>
          <figcaption>{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function ProductPage() {
  return (
    <div className={styles.page} lang="es">
      <Navbar />
      <main>
        {/* 1. HERO */}
        <section className={styles.hero} aria-labelledby="product-heading">
          <div className={styles.heroIntro}>
            <div>
              <p className={styles.eyebrow}>NUESTRO PRODUCTO</p>
              <h1 id="product-heading">
                HIDRATACIÓN
                <br />
                QUE SIGUE
                <br />
                <span>TU RITMO.</span>
              </h1>
            </div>
            <div className={styles.copy}>
              <p>Cuando te mueves y sudas, no solo pierdes agua. También pierdes electrolitos.</p>
              <p>
                Los Electrolitos USCHH fueron creados para complementar tu hidratación y ayudarte a reponer minerales
                como sodio, potasio, magnesio y calcio.
              </p>
              <p>
                Una fórmula práctica, sin azúcar y fácil de llevar contigo para acompañarte antes, durante o después de
                esos momentos en los que tu cuerpo necesita hidratación.
              </p>
            </div>
          </div>
        </section>

        {/* 2. FÓRMULA, COMPOSICIÓN DESTACADA & MINERALES DETALLADOS */}
        <section className={styles.formula} aria-labelledby="formula-heading">
          <Reveal>
            <p className={styles.eyebrow}>CONOCE LO QUE HAY EN TU SACHET</p>
            <h2 id="formula-heading">
              LO QUE HAY
              <br />
              DENTRO IMPORTA.
            </h2>
          </Reveal>

          {/* Composición destacada */}
          <div className={styles.compositionHighlight}>
            <h3>Composición destacada por sachet de 6 g</h3>
            <p>
              Cada sachet de 6 g aporta: <strong>sodio (369 mg)</strong>, <strong>potasio (786 mg)</strong>,{" "}
              <strong>magnesio (86 mg)</strong>, <strong>calcio (265 mg)</strong>, <strong>zinc (13 mg)</strong> y{" "}
              <strong>aloe vera (45 mg)</strong>.
            </p>
          </div>

          {/* Grid detallado con la explicación de cada mineral e ingrediente */}
          <ul className={styles.mineralsGridDetailed}>
            {detailedMinerals.map((mineral, index) => (
              <li key={mineral.symbol}>
                <Reveal delay={index * 60}>
                  <div className={styles.mineralCardDetailed}>
                    <div className={styles.mineralHeaderRow}>
                      <span className={styles.mineralSymbolLarge}>{mineral.symbol}</span>
                      <span className={styles.mineralMgBadge}>{mineral.amount}</span>
                    </div>
                    <h4>{mineral.name}</h4>
                    <p>{mineral.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. ATRIBUTOS LIMPIOS */}
        <section className={styles.attributes} aria-label="Atributos del producto">
          <ul>
            {attributes.map(([label, path]) => (
              <li key={label}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. BENEFICIOS FUNCIONALES */}
        <section className={styles.benefitsSection} aria-labelledby="benefits-heading">
          <Reveal>
            <p className={styles.eyebrow}>BENEFICIOS FUNCIONALES</p>
            <h2 id="benefits-heading">
              RESPALDO REAL
              <br />
              A TU CUERPO.
            </h2>
          </Reveal>

          <ul className={styles.benefitsGrid}>
            {benefitsList.map((benefit, index) => (
              <li key={benefit.title}>
                <Reveal delay={index * 60}>
                  <div className={styles.benefitItem}>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. ¿CUÁNDO USAR USCHH? */}
        <section className={styles.whenSection} aria-labelledby="when-heading">
          <Reveal>
            <p className={styles.eyebrow}>MOMENTOS DE CONSUMO</p>
            <h2 id="when-heading">
              ¿CUÁNDO USAR
              <br />
              USCHH?
            </h2>
          </Reveal>

          <ul className={styles.whenGrid}>
            {whenToUseList.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 60}>
                  <div className={styles.whenItem}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className={styles.whenNote}>
            Cada cuerpo es diferente. Tus necesidades dependen de cuánto sudas, la duración de la actividad y las
            condiciones del entorno.
          </p>
        </section>

        {/* 6. HIDRATACIÓN: CONOCE TU CUERPO */}
        <section className={styles.hydrationSection} aria-labelledby="hydration-heading">
          <Reveal>
            <p className={styles.eyebrow}>CIENCIA & CONCIENCIA</p>
            <h2 id="hydration-heading">
              HIDRATACIÓN:
              <br />
              CONOCE TU CUERPO.
            </h2>
          </Reveal>

          <div className={styles.hydrationGrid}>
            <div>
              <div className={styles.hydrationStat}>~60%</div>
              <p className={styles.hydrationStatLabel}>De tu cuerpo es agua</p>
            </div>

            <div className={styles.hydrationCopy}>
              <p>
                Tu cuerpo es aproximadamente un 60 % agua. El agua forma parte de tus células, transporta nutrientes y
                ayuda a regular tu temperatura. Cuidar tu hidratación es cuidar una parte esencial de cómo funciona tu
                cuerpo.
              </p>
              <p>
                Cuando sudas, pierdes agua y electrolitos, especialmente sodio. En actividades prolongadas o con mucha
                sudoración, reponer ambos puede formar parte de tu estrategia de hidratación.
              </p>
              <p>En USCHH creemos en conocer lo que tu cuerpo necesita y entender lo que consumes.</p>
              <p className={styles.hydrationDisclaimer}>
                * El porcentaje de agua corporal varía según la edad y la composición corporal.
              </p>
            </div>
          </div>
        </section>

        {/* 7. CÓMO USAR */}
        <section className={styles.usage} aria-labelledby="usage-heading">
          <Reveal>
            <p className={styles.eyebrow}>CÓMO USAR</p>
            <h2 id="usage-heading">
              SIMPLE.
              <br />
              COMO DEBERÍA SER.
            </h2>
          </Reveal>
          <p className={styles.instruction}>Mezcla 1 sachet con 400 ml de agua. Agita y disfruta.</p>
          <ol className={styles.steps}>
            <li>
              <strong>1</strong>
              <span>SACHET</span>
            </li>
            <li>
              <i aria-hidden="true">+</i>
              <strong>400</strong>
              <span>ML DE AGUA</span>
            </li>
            <li>
              <i aria-hidden="true">→</i>
              <strong className={styles.word}>AGITA</strong>
            </li>
            <li>
              <i aria-hidden="true">→</i>
              <strong className={styles.word}>DISFRUTA</strong>
            </li>
          </ol>
        </section>

        {/* 8. MOVIMIENTO */}
        <section className={styles.movement} aria-labelledby="movement-heading">
          <div className={styles.movementIntro}>
            <h2 id="movement-heading">
              HECHO PARA
              <br />
              MOVERSE
              <br />
              CONTIGO.
            </h2>
            <p className={styles.editorialLead}>ENTRENA. CORRE. MUÉVETE. VIVE.</p>
          </div>

          <Reveal className={styles.movementImage}>
            <div className={styles.gymPhoto}>
              <Image
                src="/products/producto_fondo_gym.jpg"
                alt="Pack de electrolitos USCHH Limón en el gimnasio"
                fill
                sizes="100vw"
                priority
              />
            </div>
          </Reveal>

          <div className={styles.movementBottom}>
            <ul className={styles.activities}>
              {["RUNNING", "GYM", "HIKING", "CYCLING", "DEPORTES", "DÍAS DE MUCHO MOVIMIENTO"].map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
            <div className={styles.movementStatement}>
              <h3 className={styles.elevate}>
                ELEVA TU
                <br />
                POTENCIAL.
              </h3>
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className={styles.final} aria-labelledby="flavor-heading">
          <p className={styles.eyebrow}>LIMÓN / MANDARINA</p>
          <h2 id="flavor-heading">ENCUENTRA TU SABOR.</h2>
          <Products compact />
          <Link href="/productos" className={styles.cta}>
            COMPRAR USCHH <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/">USCHH / INICIO</Link>
        <Link href="/nosotros">NOSOTROS ↗</Link>
      </footer>
    </div>
  );
}
