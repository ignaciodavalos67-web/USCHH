"use client";

import Image from "next/image";
import styles from "./CommunitySection.module.css";

interface CommunityCard {
  id: string;
  phrase: string;
  image: string;
  alt: string;
}

const cards: CommunityCard[] = [
  {
    id: "running",
    phrase: "Para los que eligen moverse.",
    image: "/images/comunidad_runner.jpg",
    alt: "Atleta corriendo al aire libre",
  },
  {
    id: "fuerza",
    phrase: "Para los que eligen ser más fuertes.",
    image: "/images/elisa_padel.jpg",
    alt: "Atleta en entrenamiento de fuerza y deporte",
  },
  {
    id: "natacion",
    phrase: "Para los que quieren alcanzar su mejor potencial.",
    image: "/images/piscina_bebiendo.jpg",
    alt: "Nadador hidratándose en la piscina",
  },
  {
    id: "resistencia",
    phrase: "Para los que no se rinden en cada repetición.",
    image: "/images/row.jpg",
    alt: "Entrenamiento de alta intensidad y resistencia",
  },
  {
    id: "disciplina",
    phrase: "Para los que dan un paso más cada día.",
    image: "/images/Squad.jpg",
    alt: "Comunidad y atletas USCHH en equipo",
  },
];

export function CommunitySection() {
  const renderCardGroup = (key: string) => (
    <div className={styles.group} key={key}>
      {cards.map((card) => (
        <div key={`${key}-${card.id}`} className={styles.card}>
          <Image
            src={card.image}
            alt={card.alt}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 320px, 400px"
          />
          <div className={styles.overlay} />
          <div className={styles.phraseContainer}>
            <p className={styles.phrase}>{card.phrase}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="comunidad"
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        backgroundColor: "var(--home-bg, #F8F7F2)",
        color: "var(--home-body, #55585E)",
        borderTop: "1px solid var(--home-border, rgba(16, 24, 32, 0.08))",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-12">
        <span
          className="text-[11px] tracking-[.15em] uppercase mb-3 font-semibold block"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: "var(--home-body, #55585E)",
          }}
        >
          NUESTRA COMUNIDAD
        </span>
        <h2
          className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05] mb-4"
          style={{ color: "var(--home-fg, #101820)" }}
        >
          USCHH ES PARA...
        </h2>
        <p
          className="text-base sm:text-lg max-w-2xl leading-relaxed"
          style={{ color: "var(--home-body, #55585E)" }}
        >
          Atletas, soñadores y personas en movimiento constante que transforman cada día en una oportunidad para ser mejores.
        </p>
      </div>

      {/* Carrusel continuo automático — Sin botones, fotos cuadradas 1:1 con esquinas rectas */}
      <div className={styles.marqueeWrapper} aria-label="Galería continua de la comunidad USCHH">
        <div className={styles.marqueeTrack}>
          {renderCardGroup("group-a")}
          {renderCardGroup("group-b")}
        </div>
      </div>

      {/* Cierre / Mensaje final */}
      <div className="mt-16 md:mt-24 text-center max-w-3xl mx-auto px-6">
        <p
          className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-snug"
          style={{ color: "var(--home-fg, #101820)" }}
        >
          “USCHH está listo para ser tu aliado en todas tus metas.”
        </p>
      </div>
    </section>
  );
}
