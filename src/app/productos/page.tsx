import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontProducts } from "@/server/storefront";
import { connection } from "next/server";
import styles from "./shop.module.css";
import CatalogUnavailable from "./catalog-unavailable";

export const metadata: Metadata = { title: "Tienda | USCHH", description: "Electrolitos en polvo USCHH. Limón y Mandarina." };

export default async function ShopPage() {
  await connection();
  const catalog = await getStorefrontProducts();
  if (!catalog.available) return <CatalogUnavailable />;
  const products = catalog.products;
  return (
    <main className={styles.shop}>
      <h1 className="sr-only">Tienda USCHH</h1>
      <div className={styles.grid}>
        {products.map((product, index) => (
          <article key={product.slug} className={styles.card}>
            <Link href={`/productos/${product.slug}`} className={styles.visual} style={{ backgroundColor: product.background }} aria-label={`Ver USCHH Electrolitos — ${product.flavor}`}>
              <span className={styles.index} aria-hidden="true">0{index + 1} / USCHH</span>
              <Image src={product.image} alt={`Envase USCHH Electrolitos en polvo sabor ${product.flavor}`} fill sizes="(max-width: 767px) 90vw, 46vw" className={styles.productImage} />
            </Link>
            <div className={styles.details}>
              <p className={styles.eyebrow}>USCHH · Electrolitos en polvo</p>
              <h2>{product.flavor}</h2>
              <p className={styles.price}>{product.price}</p>
              <p className={styles.availability}>{product.availability}</p>
              <Link href={`/productos/${product.slug}`} className={styles.cta} aria-label={`Ver producto ${product.flavor}`}>VER PRODUCTO <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        ))}
      </div>
      <footer className={styles.footer}><Link href="/">← VOLVER A INICIO</Link><span>USCHH</span></footer>
    </main>
  );
}
