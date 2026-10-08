import React from "react";
import styles from "./UschhMarquee.module.css";

export interface UschhMarqueeProps {
  items?: string[];
  backgroundColor?: string;
  textColor?: string;
  speedSeconds?: number;
  direction?: "left" | "right";
  strikethrough?: boolean;
  separator?: string;
  className?: string;
}

const DEFAULT_ITEMS = [
  "VEGANO",
  "SIN AZÚCAR",
  "SIN GLUTEN",
  "SIN GMO",
  "SIN COLORANTES ARTIFICIALES",
];

export function UschhMarquee({
  items = DEFAULT_ITEMS,
  backgroundColor = "#FF1735",
  textColor = "#101820",
  speedSeconds = 24,
  direction = "right",
  strikethrough = true,
  separator = "·",
  className = "",
}: UschhMarqueeProps) {
  // Repeat items inside each half so it comfortably covers ultra-wide monitors
  const repeatCount = 3;
  const sequence = Array.from({ length: repeatCount }).flatMap(() => items);

  const animationClass =
    direction === "right" ? styles.animateRight : styles.animateLeft;

  const renderGroup = (keyPrefix: string) => (
    <div className={styles.itemGroup} key={keyPrefix}>
      {sequence.map((item, index) => (
        <span
          key={`${keyPrefix}-${index}`}
          className={`${styles.itemWord} ${strikethrough ? styles.strikethrough : ""}`}
        >
          <span>{item}</span>
          <span className={`${styles.separator} mx-2.5 sm:mx-3.5`} aria-hidden="true">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`${styles.marqueeWrapper} ${className} py-2 sm:py-2.5 text-xs sm:text-sm`}
      style={{
        backgroundColor,
        color: textColor,
      }}
      role="region"
      aria-label="Atributos destacados"
    >
      <div
        className={`${styles.marqueeTrack} ${animationClass}`}
        style={{
          animationDuration: `${speedSeconds}s`,
        }}
      >
        {/* Two identical groups for seamless -50% to 0% infinite loop */}
        {renderGroup("group-a")}
        {renderGroup("group-b")}
      </div>
    </div>
  );
}
