import React from "react";
import Image from "next/image";
import styles from "./BrandLogoMarquee.module.css";

interface BrandLogoMarqueeProps {
  speedSeconds?: number;
  flavor?: string;
  slug?: string;
  backgroundColor?: string;
  className?: string;
}

export function BrandLogoMarquee({
  speedSeconds = 24,
  flavor = "",
  slug = "",
  backgroundColor,
  className = "",
}: BrandLogoMarqueeProps) {
  const isLimon =
    slug.toLowerCase().includes("limon") ||
    flavor.toLowerCase().includes("lim");
  const isMandarina =
    slug.toLowerCase().includes("mandarina") ||
    flavor.toLowerCase().includes("man") ||
    flavor.toLowerCase().includes("nar");

  const colorClass = backgroundColor
    ? ""
    : isLimon
    ? styles.flavorLimon
    : isMandarina
    ? styles.flavorMandarina
    : styles.flavorRed;

  // Repeat pair 6 times per group to ensure ultra-wide screens are covered
  const repeatCount = 6;
  const items = Array.from({ length: repeatCount }, (_, i) => i);

  const renderGroup = (groupKey: string) => (
    <div className={styles.group} key={groupKey}>
      {items.map((i) => (
        <div className={styles.pair} key={`${groupKey}-${i}`}>
          <Image
            src="/images/uschh-logo-stripes-black.png"
            alt="USCHH Logo"
            width={96}
            height={30}
            className={styles.logoStripes}
            loading="eager"
          />
          <span className={styles.separator} aria-hidden="true">
            •
          </span>
          <Image
            src="/images/uschh-monogram-black.png"
            alt="USCHH Monograma"
            width={31}
            height={31}
            className={styles.monogram}
            loading="eager"
          />
          <span className={styles.separator} aria-hidden="true">
            •
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section
      className={`${styles.wrapper} ${colorClass} ${className}`}
      style={backgroundColor ? { backgroundColor, boxShadow: "0 6px 24px rgba(247, 226, 163, 0.25)" } : undefined}
      aria-label={`Identidad de marca USCHH ${flavor}`}
      role="region"
    >
      <div
        className={styles.track}
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {renderGroup("group-a")}
        {renderGroup("group-b")}
      </div>
    </section>
  );
}
