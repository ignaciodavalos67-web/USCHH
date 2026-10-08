"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  slug: string;
  flavor: string;
  defaultImage: string;
}

interface GalleryImage {
  src: string;
  alt: string;
  isNutritional?: boolean;
}

export function ProductGallery({ slug, flavor, defaultImage }: ProductGalleryProps) {
  const isLimon = slug.toLowerCase().includes("limon") || flavor.toLowerCase().includes("lim");

  const images: GalleryImage[] = isLimon
    ? [
        {
          src: defaultImage,
          alt: `USCHH Electrolitos sabor Limón - Empaque`,
        },
        {
          src: "/images/products/uschh-limon-front-hand.png",
          alt: "USCHH Electrolitos Limón - Frontal en mano",
        },
        {
          src: "/images/products/uschh-limon-back-hand.png",
          alt: "USCHH Electrolitos Limón - Reverso en mano",
        },
        {
          src: "/images/products/uschh-nutrition-facts-limon.png",
          alt: "USCHH Electrolitos Limón - Tabla de Información Nutricional",
          isNutritional: true,
        },
      ]
    : [
        {
          src: defaultImage,
          alt: `USCHH Electrolitos sabor Mandarina - Empaque`,
        },
        {
          src: "/images/products/uschh-mandarina-front-hand.png",
          alt: "USCHH Electrolitos Mandarina - Frontal en mano",
        },
        {
          src: "/images/products/uschh-mandarina-back-hand.png",
          alt: "USCHH Electrolitos Mandarina - Reverso en mano",
        },
        {
          src: "/images/products/uschh-nutrition-facts-mandarina.png",
          alt: "USCHH Electrolitos Mandarina - Tabla de Información Nutricional",
          isNutritional: true,
        },
      ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentImage = images[selectedIndex] ?? images[0];

  const activeThumbClass = isLimon
    ? styles.thumbBtnActiveLimon
    : styles.thumbBtnActiveMandarina;

  return (
    <div className={styles.galleryContainer} role="region" aria-label={`Galería de imágenes de ${flavor}`}>
      {/* Vista principal grande */}
      <div className={`${styles.mainStage} ${currentImage.isNutritional ? styles.mainImageWhiteBg : ""}`}>
        <Image
          key={currentImage.src}
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 650px"
          priority={selectedIndex === 0}
          className={styles.mainImage}
        />
      </div>

      {/* Miniaturas interactivas limpias sin textos/etiquetas superpuestas */}
      <div className={styles.thumbsRow} role="tablist" aria-label="Miniaturas de producto">
        {images.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.src}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Seleccionar vista ${index + 1} de ${images.length}`}
              className={`${styles.thumbBtn} ${isSelected ? activeThumbClass : ""}`}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(max-width: 767px) 25vw, 120px"
                className={styles.thumbImage}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
