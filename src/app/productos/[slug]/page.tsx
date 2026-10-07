import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStorefrontProduct } from "@/server/storefront";
import { connection } from "next/server";
import styles from "../shop.module.css";
import CatalogUnavailable from "../catalog-unavailable";
import { AddToCart } from "@/components/cart/AddToCart";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const result = await getStorefrontProduct(slug);
  if (!result.available) return <CatalogUnavailable />;
  const product = result.product;
  if (!product) notFound();

  return (
    <main className={styles.shop}>
      <div className={styles.productDetail}>
        <div className={styles.detailImageArea}>
          <Image
            src={product.image}
            alt={`USCHH Electrolitos en polvo, sabor ${product.flavor}`}
            fill
            sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1536px) 60vw, 900px"
            loading="eager"
            className={styles.detailImage}
          />
        </div>
        <div className={styles.detailInfo}>
          <p className={styles.eyebrow}>USCHH · ELECTROLITOS EN POLVO</p>
          <h1>{product.flavor}</h1>
          <p className={styles.price}>{product.price}</p>
          <p className={styles.availability}>{product.availability}</p>
          <AddToCart product={product} />
          <Link href="/productos" className={styles.cta}>← VOLVER A LA TIENDA</Link>
        </div>
      </div>
    </main>
  );
}
