import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Reveal } from "@/components/nosotros/NosotrosReveal";
import styles from "./producto.module.css";

export const metadata: Metadata = {
  title: "Nuestro producto | USCHH",
  description: "Conoce los Electrolitos USCHH: ingredientes, presentación, sabores y preparación. Hidratación que sigue tu ritmo.",
};
const minerals = [["Na", "SODIO"], ["K", "POTASIO"], ["Mg", "MAGNESIO"], ["Ca", "CALCIO"], ["Zn", "ZINC"]];
const attributes = [
  ["VEGANO", "M12 21V11M12 15C3 15 3 7 3 3c7 0 9 4 9 8M12 18c9 0 9-8 9-12-7 0-9 4-9 8"],
  ["SIN GMO", "M7 3c0 8 10 10 10 18M17 3c0 8-10 10-10 18M8 5h8M9 9h6M9 15h6M8 19h8M3 3l18 18"],
  ["SIN AZÚCAR", "M5 8l7-4 7 4v8l-7 4-7-4V8M5 8l7 4 7-4M12 12v8M3 3l18 18"],
  ["GLUTEN FREE", "M12 21V3M12 9C6 9 6 6 6 4c4 0 6 2 6 5M12 14c6 0 6-3 6-5-4 0-6 2-6 5M3 3l18 18"],
  ["SIN COLORANTES ARTIFICIALES", "M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12M3 3l18 18"],
];
function Products({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? styles.compactProducts : styles.products}>{[["limon", "LIMÓN"], ["mandarina", "MANDARINA"]].map(([file, label]) => <figure key={file}><div className={styles.pack}><Image src={`/products/uschh-${file}-sin-fondo-con-sombra.png`} alt={`Electrolitos en polvo USCHH sabor ${label.toLowerCase()}`} fill sizes={compact ? "(max-width: 700px) 42vw, 300px" : "(max-width: 700px) 42vw, 480px"} /></div><figcaption>{label}</figcaption></figure>)}</div>;
}
export default function ProductPage() {
  return <div className={styles.page} lang="es"><Navbar /><main>
    <section className={styles.hero} aria-labelledby="product-heading">
      <div className={styles.heroIntro}><div><p className={styles.eyebrow}>NUESTRO PRODUCTO</p><h1 id="product-heading">HIDRATACIÓN<br />QUE SIGUE<br /><span>TU RITMO.</span></h1></div>
      <div className={styles.copy}><p>Cuando te mueves y sudas, no solo pierdes agua. También pierdes electrolitos.</p><p>Los Electrolitos USCHH fueron creados para complementar tu hidratación y ayudarte a reponer minerales como sodio, potasio, magnesio y calcio.</p><p>Una fórmula práctica, sin azúcar y fácil de llevar contigo para acompañarte antes, durante o después de esos momentos en los que tu cuerpo necesita hidratación.</p></div></div>
    </section>
    <section className={styles.formula} aria-labelledby="formula-heading"><Reveal><p className={styles.eyebrow}>UNA FÓRMULA HECHA CON INTENCIÓN.</p><h2 id="formula-heading">LO QUE HAY<br />DENTRO IMPORTA.</h2></Reveal>
      <ul className={styles.minerals}>{minerals.map(([symbol, name], index) => <li key={symbol}><Reveal delay={index * 60}><span>{symbol}</span><p>{name}</p></Reveal></li>)}</ul>
      <p className={styles.aloe}>+ ALOE VERA</p>
    </section>
    <section className={styles.attributes} aria-label="Atributos del producto"><ul>{attributes.map(([label, path]) => <li key={label}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg><span>{label}</span></li>)}</ul></section>
    <section className={styles.usage} aria-labelledby="usage-heading"><Reveal><p className={styles.eyebrow}>CÓMO USAR</p><h2 id="usage-heading">SIMPLE.<br />COMO DEBERÍA SER.</h2></Reveal><p className={styles.instruction}>Mezcla 1 sachet con 400 ml de agua. Agita y disfruta.</p><ol className={styles.steps}><li><strong>1</strong><span>SACHET</span></li><li><i aria-hidden="true">+</i><strong>400</strong><span>ML DE AGUA</span></li><li><i aria-hidden="true">→</i><strong className={styles.word}>AGITA</strong></li><li><i aria-hidden="true">→</i><strong className={styles.word}>DISFRUTA</strong></li></ol></section>
    <section className={styles.movement} aria-labelledby="movement-heading">
      <div className={styles.movementEditorial}>
        <div className={styles.movementIntro}>
          <h2 id="movement-heading">HECHO PARA<br />MOVERSE<br />CONTIGO.</h2>
          <p className={styles.editorialLead}>ENTRENA. CORRE. MUÉVETE. VIVE.</p>
        <Reveal className={styles.movementImage}>
          <div className={styles.gymPhoto}>
            <Image src="/products/producto_fondo_gym.jpg" alt="Pack de electrolitos USCHH Limón en el gimnasio" fill sizes="(max-width: 700px) 90vw, 760px" />
          </div>
        </Reveal>
          <ul className={styles.activities}>{["RUNNING", "GYM", "HIKING", "CYCLING", "DEPORTES", "DÍAS DE MUCHO MOVIMIENTO"].map(activity => <li key={activity}>{activity}</li>)}</ul>
        </div>
        <div className={styles.movementStatement}>
          <h3 className={styles.elevate}>ELEVA TU<br />POTENCIAL.</h3>
        </div>
      </div>
    </section>
    <section className={styles.final} aria-labelledby="flavor-heading"><p className={styles.eyebrow}>LIMÓN / MANDARINA</p><h2 id="flavor-heading">ENCUENTRA TU SABOR.</h2><Products compact /><Link href="/productos" className={styles.cta}>COMPRAR USCHH <span aria-hidden="true">↗</span></Link></section>
  </main><footer className={styles.footer}><Link href="/">USCHH / INICIO</Link><Link href="/nosotros">NOSOTROS ↗</Link></footer></div>;
}
