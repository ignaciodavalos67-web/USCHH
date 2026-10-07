import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Reveal } from "@/components/nosotros/NosotrosReveal";
import styles from "./nosotros.module.css";

export const metadata: Metadata = {
  title: "Sobre nosotros | USCHH",
  description: "Nacimos para hacer las cosas diferente. Conoce la historia, filosofía y ambición de USCHH: hecho en Ecuador, pensado en grande.",
};

export default function NosotrosPage() {
  return <div className={styles.page} lang="es">
    <Navbar />
    <main>
      <section className={styles.hero} aria-labelledby="story-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>SOBRE NOSOTROS</p>
          <h1 id="story-heading">NACIMOS PARA HACER<br className={styles.desktopBreak} /><span> LAS COSAS DIFERENTE.</span></h1>
          <div className={styles.intro}>
            <p className={styles.lead}>USCHH nace de una pasión por el deporte, la nutrición y por entender realmente qué le damos a nuestro cuerpo.</p>
            <div className={styles.copy}>
              <p>Vivimos en un mercado lleno de opciones, pero donde muchas veces falta lo más importante: entender qué estás consumiendo, por qué lo estás consumiendo y qué propósito tiene cada ingrediente.</p>
              <p>Por eso creamos USCHH: para transformar la manera en la que vemos los suplementos a través de productos funcionales, transparentes y creados con intención.</p>
              <p>Queremos ser una marca que no solo venda suplementos. Queremos motivar, inspirar y educar a las personas a conocer mejor su cuerpo, sus hábitos y lo que consumen.</p>
            </div>
          </div>
          <Reveal className={styles.heroPhoto}><Image src="/images/row.jpg" alt="Dos deportistas entrenando en máquinas de remo con camisetas USCHH" fill sizes="(max-width: 700px) 100vw, 1280px" /></Reveal>
        </div>
      </section>
      <section className={styles.philosophy} aria-labelledby="philosophy-heading">
        <div className={styles.container}>
          <Reveal><p className={styles.eyebrow}>NUESTRA FILOSOFÍA</p><h2 id="philosophy-heading">TODOS PODEMOS SER<br />ATLETAS DE ALTO RENDIMIENTO<span className={styles.ownLevel}>A NUESTRO PROPIO NIVEL.</span></h2></Reveal>
          <div className={styles.philosophyGrid}>
            <Reveal className={styles.trainingPhoto}><Image src="/images/gym.jpg" alt="Tres deportistas entrenando con mancuernas en el gimnasio" fill sizes="(max-width: 700px) 90vw, 550px" /></Reveal>
            <Reveal className={styles.definition}>
              <p>Para nosotros, rendir mejor no significa dar el 100% todos los días. Significa dar lo mejor que tienes ese día.</p>
              <p className={styles.movement}>Moverte, intentarlo,<br />cuidarte y seguir avanzando.</p>
              <p>Creemos que el rendimiento no se mide contra los demás, sino contra nuestro propio potencial.</p>
            </Reveal>
          </div>
        </div>
      </section>
      <section className={styles.origin} aria-labelledby="origin-heading">
        <div className={styles.container}>
          <Reveal><p className={styles.eyebrow}>NUESTRO ORIGEN / NUESTRA AMBICIÓN</p><h2 id="origin-heading">HECHO EN <span className={styles.ecu}>ECU</span><span className={styles.ad}>AD</span><span className={styles.or}>OR</span>.<br /><span>PENSADO EN GRANDE.</span></h2></Reveal>
          <div className={styles.originGrid}>
            <div className={styles.originStory}>
              <p>USCHH nace con orgullo en Ecuador, en una industria históricamente dominada por marcas extranjeras. Queremos demostrar que desde Latinoamérica también podemos crear productos increíbles, innovar y elevar el estándar de la industria.</p>
              <p className={styles.beginning}>Nuestro primer producto son nuestros electrolitos, pero esto recién comienza.</p>
              <p>Queremos construir una marca ecuatoriana que llegue a toda Latinoamérica, desarrollar nuevos productos y convertirnos en ese acompañante que las personas eligen todos los días para sentirse mejor, rendir mejor y seguir elevando su potencial.</p>
            </div>
            <Reveal className={styles.runningPhoto}><Image src="/images/botella_uschh.jpg" alt="Deportista sosteniendo una botella USCHH al aire libre" fill sizes="(max-width: 700px) 90vw, 550px" /></Reveal>
          </div>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="potential-heading">
        <div className={styles.container}>
          <Reveal><p className={styles.newChapter}>SOMOS USCHH.<br />Y ESTO RECIÉN COMIENZA.</p><h2 id="potential-heading">ELEVA TU<br />POTENCIAL.</h2></Reveal>
          <div className={styles.manifesto}>
            <blockquote>Cada ingrediente tiene una razón,<br className={styles.desktopBreak} /> cada fórmula un propósito<br className={styles.desktopBreak} /> y cada producto un impacto real.</blockquote>
          </div>
        </div>
      </section>
    </main>
    <footer className={styles.footer}><Link href="/">USCHH / INICIO</Link><Link href="/productos">TIENDA ↗</Link></footer>
  </div>;
}
