import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import styles from "../shop.module.css";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
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
          <Link href="/productos" className={styles.cta}>← VOLVER A LA TIENDA</Link>
        </div>
      </div>
    </main>
  );
}