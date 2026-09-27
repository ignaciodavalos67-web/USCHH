import React from "react";
import Image from "next/image";

const minerals = [
  { symbol: "Na", name: "SODIO" },
  { symbol: "K", name: "POTASIO" },
  { symbol: "Mg", name: "MAGNESIO" },
  { symbol: "Ca", name: "CALCIO" },
  { symbol: "Zn", name: "ZINC" },
];

const attributes = ["VEGANO", "SIN AZÚCAR", "SIN GLUTEN", "SIN COLORANTES ARTIFICIALES"];

export function Scene6Minerals() {
  return (
    <section
      data-scene="6"
      className="scene-6-container absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10 opacity-0"
      aria-label="Composición de Minerales USCHH"
    >
      {/* ── LAYER 0: BACKGROUND ─────────────────────────────── */}
      <div className="absolute inset-0 bg-[#F7E2A3]" />

      {/* Subtle decorative warm circles — CSS only, no JS */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#F5D680]/60 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full bg-[#E8A84A]/25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/30 pointer-events-none" />

      {/* ── LAYER 1: OVERSIZED PRODUCT PACKAGES ─────────────── */}
      {/* Mandarina — large, slightly left of center, extends top/bottom */}
      <div className="scene-6-products absolute inset-0 opacity-0">
        <div className="scene-6-can-left absolute top-1/2 -translate-y-1/2 left-[2%] sm:left-[5%] w-[48%] sm:w-[42%] md:w-[38%] lg:w-[34%] aspect-[2398/2520]">
          <Image
            src="/products/uschh-mandarina-sin-fondo-con-sombra.png"
            alt="USCHH Mandarina"
            fill
            sizes="(max-width: 768px) 48vw, 38vw"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Limón — large, slightly right of center */}
        <div className="scene-6-can-right absolute top-1/2 -translate-y-1/2 right-[2%] sm:right-[5%] w-[48%] sm:w-[42%] md:w-[38%] lg:w-[34%] aspect-[2392/2520]">
          <Image
            src="/products/uschh-limon-sin-fondo-con-sombra.png"
            alt="USCHH Limón"
            fill
            sizes="(max-width: 768px) 48vw, 38vw"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* ── LAYER 2: CENTER CONTENT COLUMN ──────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-8 sm:py-10 px-4 sm:px-8">

        {/* ── HEADLINE — top area, never overlaps anything ── */}
        <div className="scene-6-headline w-full max-w-lg text-center">
          <span className="block text-[10px] sm:text-xs uppercase tracking-[0.3em] font-mono text-[#101820]/60 mb-2">
            COMPOSICIÓN ACTIVA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#101820] uppercase leading-tight">
            5 Minerales.
            <br />
            <span className="font-light">1 Propósito.</span>
          </h2>
          {/* Yellow accent bar */}
          <div className="mx-auto mt-3 h-[3px] w-12 bg-[#101820] rounded-full" />
        </div>

        {/* ── MINERAL ROW — structured horizontal grid ─── */}
        {/* 5 minerals in a single flex row; each mineral in its own column with clear space */}
        <div className="scene-6-minerals-row w-full max-w-2xl md:max-w-3xl">
          <div className="flex items-end justify-between gap-0 sm:gap-2">
            {minerals.map((m) => (
              <div
                key={m.symbol}
                className="scene-6-mineral flex-1 flex flex-col items-center text-center opacity-0"
              >
                {/* Large chemical symbol */}
                <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight text-[#101820] leading-none">
                  {m.symbol}
                </span>
                {/* Thin separator */}
                <span className="block w-full h-[1px] bg-[#101820]/20 my-1.5 sm:my-2" />
                {/* Mineral name — much smaller */}
                <span className="block text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] font-bold text-[#101820]/80 uppercase">
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER: Aloe Vera + Product Attributes ─── */}
        <div className="scene-6-footer w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4">
          {/* Aloe Vera — visually separate, between mineral row and attributes */}
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-6 sm:w-10 bg-[#101820]/30" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-[#101820]/75 uppercase font-medium">
              + Aloe Vera
            </span>
            <div className="h-[1px] w-6 sm:w-10 bg-[#101820]/30" />
          </div>

          {/* Product attributes — secondary, compact */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5">
            {attributes.map((attr, i) => (
              <React.Fragment key={attr}>
                <span className="text-[8px] sm:text-[10px] font-mono tracking-widest uppercase text-[#101820]/65">
                  {attr}
                </span>
                {i < attributes.length - 1 && (
                  <span className="text-[#101820]/30 text-[8px] sm:text-[10px]">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
