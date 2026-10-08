import Link from "next/link";
import { notFound } from "next/navigation";
import { getStorefrontProduct } from "@/server/storefront";
import { connection } from "next/server";
import styles from "../shop.module.css";
import CatalogUnavailable from "../catalog-unavailable";
import { AddToCart } from "@/components/cart/AddToCart";
import { ProductStory } from "@/components/products/ProductStory";
import { BrandLogoMarquee } from "@/components/products/BrandLogoMarquee";
import { ProductGallery } from "@/components/products/ProductGallery";

const FLAVOR_DESCRIPTIONS: Record<string, string> = {
  limon:
    "Electrolitos en polvo sabor limón. Una opción fresca y cítrica para acompañar tu hidratación diaria, antes, durante o después de tus actividades.",
  mandarina:
    "Electrolitos en polvo sabor mandarina. Una opción de sabor cítrico y afrutado para acompañar tu hidratación diaria, antes, durante o después de tus actividades.",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const result = await getStorefrontProduct(slug);
  if (!result.available) return <CatalogUnavailable />;
  const product = result.product;
  if (!product) notFound();

  const isMandarina =
    slug?.toLowerCase().includes("mandarina") ||
    product.flavor?.toLowerCase().includes("man") ||
    product.flavor?.toLowerCase().includes("nar");
  const isLimon =
    slug?.toLowerCase().includes("limon") ||
    product.flavor?.toLowerCase().includes("lim");


  const titleClass = isMandarina
    ? styles.titleMandarina
    : isLimon
    ? styles.titleLimon
    : "";
  const priceClass = isMandarina
    ? styles.priceMandarina
    : isLimon
    ? styles.priceLimon
    : "";

  const individualDescription =
    FLAVOR_DESCRIPTIONS[slug.toLowerCase()] ??
    `Electrolitos en polvo sabor ${product.flavor.toLowerCase()}. Una opción diseñada para acompañar tu hidratación diaria, antes, durante o después de tus actividades.`;

  return (
    <main className={styles.shop}>
      <div className={styles.productDetail}>
        <div className={styles.detailImageArea}>
          <ProductGallery
            slug={slug}
            flavor={product.flavor}
            defaultImage={product.image}
          />
        </div>
        <div className={styles.detailInfo}>
          <p className={styles.eyebrow}>USCHH · ELECTROLITOS EN POLVO</p>
          <h1 className={titleClass}>{product.flavor}</h1>
          <p className={styles.flavorDescription}>{individualDescription}</p>
          <p className={`${styles.price} ${priceClass}`}>{product.price}</p>
          <AddToCart product={product} />
          <Link href="/productos" className={styles.backCta}>← VOLVER A LA TIENDA</Link>
        </div>
      </div>

      {/* Franja animada con logo y monograma USCHH, con color según sabor */}
      <BrandLogoMarquee flavor={product.flavor} slug={slug} />

      <ProductStory flavor={product.flavor} slug={slug} />
    </main>
  );
}
