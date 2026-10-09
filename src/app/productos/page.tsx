import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStorefrontProducts } from "@/server/storefront";
import { connection } from "next/server";
import styles from "./shop.module.css";
import CatalogUnavailable from "./catalog-unavailable";
import { BrandLogoMarquee } from "@/components/products/BrandLogoMarquee";

export const metadata: Metadata = {
  title: "Tienda | USCHH",
  description: "Electrolitos en polvo USCHH. Limón y Mandarina.",
};

export default async function ShopPage() {
  await connection();
  const catalog = await getStorefrontProducts();
  if (!catalog.available) return <CatalogUnavailable />;
  const products = catalog.products;

  return (
    <main className={styles.shop}>
      <h1 className="sr-only">Tienda USCHH</h1>

      {/* Marquee horizontal de ancho completo con fondo amarillo USCHH #F7E2A3 */}
      <BrandLogoMarquee backgroundColor="#F7E2A3" />

      <div className={styles.grid}>
        {products.map((product, index) => {
          const isMandarina =
            product.slug.toLowerCase().includes("mandarina") ||
            product.flavor.toLowerCase().includes("man");
          const ctaClass = isMandarina ? styles.ctaMandarina : styles.ctaLimon;

          return (
            <article key={product.slug} className={styles.card}>
              <Link
                href={`/productos/${product.slug}`}
                className={styles.visual}
                style={{ backgroundColor: product.background }}
                aria-label={`Ver USCHH Electrolitos — ${product.flavor}`}
              >
                <span className={styles.index} aria-hidden="true">
                  0{index + 1} / USCHH
                </span>
                <Image
                  src={product.image}
                  alt={`Envase USCHH Electrolitos en polvo sabor ${product.flavor}`}
                  fill
                  sizes="(max-width: 767px) 90vw, 46vw"
                  className={styles.productImage}
                />
              </Link>
              <div className={styles.details}>
                <p className={styles.eyebrow}>USCHH · Electrolitos en polvo</p>
                <h2>{product.flavor}</h2>
                <p className={styles.price}>
                  {product.price}
                </p>
                <Link
                  href={`/productos/${product.slug}`}
                  className={`${styles.cta} ${ctaClass}`}
                  aria-label={`Ver producto ${product.flavor}`}
                >
                  VER PRODUCTO <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
